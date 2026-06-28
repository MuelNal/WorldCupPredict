import {Check, Download, Eye, LoaderCircle, RotateCcw, Trophy } from "lucide-react"
import type { TFunction } from "i18next"
import { type CSSProperties, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import QRCode from "qrcode"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"
import { groups, knockoutRounds, type GroupKey, type Match, type Slot, type Team } from "./data/worldCup2026"
import { isLocale, localeStorageKey, locales, type Locale } from "./i18n"
import { cn } from "./lib/utils"

type Ranking = Record<GroupKey, string[]>
type Winners = Record<number, string>
type Stage =  "knockout" | "share"
type SavedState = {
  version: number
  ranking: Ranking
  thirdGroups: GroupKey[]
  winners: Winners
  stage: Stage
}

const storageVersion = 2
const storageKey = "world-cup-2026-predictor-state"
const shareUrl = "https://wc2026.egoist.dev"
const twemojiSvgBase = "/twemoji/svg"
const teamMap = new Map(groups.flatMap((group) => group.teams.map((team) => [team.id, team])))
const groupKeys = new Set(groups.map((group) => group.key))
const stages: { id: Stage }[] = [{ id: "knockout" }, { id: "share" }]

function isStage(value: unknown): value is Stage {
  return typeof value === "string" && stages.some((stage) => stage.id === value)
}

function isWinners(value: unknown): value is Winners {
  return Boolean(value && typeof value === "object" && Object.values(value).every((id) => typeof id === "string"))
}

function loadSavedState(): Partial<SavedState> {
  if (typeof localStorage === "undefined") return {}

  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<SavedState>
    if (parsed.version !== storageVersion) return {}
    return {
      winners: isWinners(parsed.winners) ? parsed.winners : undefined,
      stage: isStage(parsed.stage) ? parsed.stage : undefined,
    }
  } catch {
    return {}
  }
}

function getTeam(id?: string) {
  return id ? teamMap.get(id) : undefined
}

function getTeamName(team: Team, locale: Locale) {
  if (locale === "en") return team.name
  if (locale === "ja") return team.ja
  return team.zh
}

function getVenueName(venue: string, t: TFunction) {
  return t(`venues.${venue}`, { defaultValue: venue })
}

function getSlotFallback(slot: Slot, t: TFunction) {
  if (slot.type === "winner") {
    return t("slotWinner", { match: slot.match })
  }
  // 现在是 group 类型，但所有槽位都有明确的 teamId，实际不会走到这里
  if (slot.type === "group") {
    return t(slot.place === 1 ? "slotGroupWinner" : "slotGroupRunnerUp", { group: slot.group })
  }
  return ""
}

function twemojiCodepoint(team: Team) {
  if (team.id === "england") return "1f3f4-e0067-e0062-e0065-e006e-e0067-e007f"
  if (team.id === "scotland") return "1f3f4-e0067-e0062-e0073-e0063-e0074-e007f"

  return Array.from(team.flag)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-")
}

function FlagIcon({ team, className }: { team: Team; className?: string }) {
  return <img className={cn("twemoji-flag", className)} src={`${twemojiSvgBase}/${twemojiCodepoint(team)}.svg`} alt="" loading="eager" draggable={false} />
}

function slotCandidates(slot: Slot, winners: Winners): Team[] {
  if (slot.type === "winner") {
    const winner = getTeam(winners[slot.match])
    return winner ? [winner] : []
  }
  if (slot.type === "group" && slot.teamId) {
    const team = getTeam(slot.teamId)
    return team ? [team] : []
  }
  return []
}

function slotLabel(slot: Slot, winners: Winners, locale: Locale, t: TFunction) {
  const team = slotCandidates(slot, winners)[0]
  return team ? getTeamName(team, locale) : getSlotFallback(slot, t)
}

function isMatchReady(match: Match, winners: Winners) {
  return slotCandidates(match.left, winners).length > 0 && slotCandidates(match.right, winners).length > 0
}

function App() {
  const { t, i18n } = useTranslation()
  const [savedState] = useState(loadSavedState)
  const [stage, setStage] = useState<Stage>(savedState.stage ?? "knockout")
  const [winners, setWinners] = useState<Winners>(savedState.winners ?? {})
  const [isExporting, setIsExporting] = useState(false)
  const [exportRequestId, setExportRequestId] = useState(0)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const exportRef = useRef<HTMLDivElement>(null)
  const locale = isLocale(i18n.language) ? i18n.language : "en"

  const champion = getTeam(winners[104])
  const completedMatches = knockoutRounds.filter((match) => winners[match.id]).length
  const readyMatches = knockoutRounds.filter((match) => isMatchReady(match, winners))
  const stageReady: Record<Stage, boolean> = {
  knockout: Boolean(champion),
  share: false,
}

useEffect(() => {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      winners,
      stage,
      version: storageVersion,
    } satisfies Partial<SavedState>), // 注意这里类型可放宽
  )
}, [winners, stage])

  useEffect(() => {
    localStorage.setItem(localeStorageKey, locale)
    document.documentElement.lang = locales.find((item) => item.id === locale)?.htmlLang ?? "en"
    document.title = t("metaTitle")
  }, [locale, t])

  useEffect(() => {
    QRCode.toDataURL(shareUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 8,
      color: {
        dark: "#16000a",
        light: "#ffffff",
      },
    }).then(setQrCodeUrl)
  }, [])

  useEffect(() => {
    if (!exportRequestId || stage !== "share" || !exportRef.current) return

    let cancelled = false

    const runExport = async () => {
      const startedAt = performance.now()
      await new Promise((resolve) => requestAnimationFrame(resolve))
      if (cancelled || !exportRef.current) return

      try {
        const dataUrl = await toPng(exportRef.current, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: "#7f002c",
        })
        const link = document.createElement("a")
        link.download = "world-cup-2026-knockout-prediction.png"
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error("Failed to export image", error)
      } finally {
        const remaining = Math.max(0, 300 - (performance.now() - startedAt))
        if (remaining) await new Promise((resolve) => window.setTimeout(resolve, remaining))
        if (!cancelled) setIsExporting(false)
      }
    }

    void runExport()

    return () => {
      cancelled = true
    }
  }, [exportRequestId, stage])

  const pickWinner = (matchId: number, teamId: string) => {
    const affected = new Set<number>([matchId])
    let changed = true
    while (changed) {
      changed = false
      for (const match of knockoutRounds) {
        const dependsOn = [match.left, match.right].some((slot) => slot.type === "winner" && affected.has(slot.match))
        if (dependsOn && !affected.has(match.id)) {
          affected.add(match.id)
          changed = true
        }
      }
    }

    setWinners((current) => {
      const next = { ...current, [matchId]: teamId }
      for (const id of affected) {
        if (id !== matchId) delete next[id]
      }
      return next
    })
  }

const reset = () => {
  setWinners({})
  setStage("knockout")
}

  const showShareGraphic = () => {
    setStage("share")
  }

  const exportImage = () => {
    if (isExporting) return
    if (stage !== "share") {
      showShareGraphic()
      return
    }
    setIsExporting(true)
    setExportRequestId((id) => id + 1)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-hero">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded border border-white/25 bg-white/10 px-2.5 py-1 text-xs text-white/85">
                  {t("heroKicker")}
                </div>
                <select className="locale-select" value={locale} onChange={(event) => void i18n.changeLanguage(event.target.value)} aria-label={t("language")}>
                  {locales.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-white md:text-5xl">{t("title")}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                {t("subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={reset}>
                <RotateCcw size={16} /> {t("reset")}
              </Button>
              <Button variant="outline" onClick={exportImage} disabled={isExporting}>
                {isExporting ? <LoaderCircle className="animate-spin" size={16} /> : stage === "share" ? <Download size={16} /> : <Eye size={16} />}
                {isExporting ? t("exporting") : stage === "share" ? t("exportImage") : t("viewShare")}
              </Button>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            {stages.map((item, index) => {
              const ready = stageReady[item.id]
              return (
                <button
                  key={item.id}
                  className={cn("stage-button", stage === item.id && "stage-button-active", ready && "stage-button-ready")}
                  onClick={() => setStage(item.id)}
                >
                  <span className="stage-button-marker">{ready ? <Check size={14} strokeWidth={3} /> : index + 1}</span>
                  {t(`stages.${item.id}`)}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="min-w-0">
          

      

          {stage === "knockout" && (
            <div>
              <div className="section-heading">
                <h2>{t("knockoutTitle")}</h2>
                <p>{t("knockoutDescription")}</p>
              </div>
              <KnockoutPicker locale={locale} t={t} winners={winners} onPick={pickWinner} />
            </div>
          )}

          {stage === "share" && (
            <div>
              <div className="section-heading">
                <h2>{t("shareTitle")}</h2>
                <p>{t("shareDescription")}</p>
              </div>
              <ShareGraphic locale={locale} t={t} refEl={exportRef} winners={winners} qrCodeUrl={qrCodeUrl} />
            </div>
          )}
        </div>

        <aside className={cn("space-y-4", stage === "share" && "hidden")}>
          <div className="panel sticky top-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground">
                <Trophy size={20} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t("championPrediction")}</div>
                <div className="flex items-center gap-2 font-semibold">
                  {champion ? (
                    <>
                      <FlagIcon team={champion} className="summary-flag" />
                      <span>{getTeamName(champion, locale)}</span>
                    </>
                  ) : (
                    t("noChampion")
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-muted p-3">
                <div className="text-muted-foreground">{t("readyMatches")}</div>
                <div className="mt-1 text-xl font-semibold">{readyMatches.length}</div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="text-muted-foreground">{t("completed")}</div>
                <div className="mt-1 text-xl font-semibold">{completedMatches}/31</div>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={showShareGraphic}>
              {t("viewShare")}
            </Button>
            
          </div>
        </aside>
      </section>
    </main>
  )
}

const knockoutRoundOrder = ["r32", "r16", "qf", "sf", "final"] as const

function KnockoutPicker({
  locale,
  t,
  winners,
  onPick,
}: {
  locale: Locale
  t: TFunction
  winners: Winners
  onPick: (matchId: number, teamId: string) => void
}) {
  return (
    <div className="knockout-picker">
      {knockoutRoundOrder.map((round) => {
        const matches = knockoutRounds.filter((match) => match.round === round)
        const completed = matches.filter((match) => winners[match.id]).length
        return (
          <section key={round} className="knockout-round-section">
            <div className="knockout-round-heading">
              <h3>{t(`roundLabels.${round}`)}</h3>
              <span>
                {completed}/{matches.length}
              </span>
            </div>
            <div className="knockout-match-grid">
              {matches.map((match) => (
                <KnockoutMatchCard
                  key={match.id}
                  locale={locale}
                  t={t}
                  match={match}
                  winners={winners}
                  onPick={onPick}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function KnockoutMatchCard({
  locale,
  t,
  match,
  winners,
  onPick,
}: {
  locale: Locale
  t: TFunction
  match: Match
  winners: Winners
  onPick: (matchId: number, teamId: string) => void
}){
  const leftTeam = slotCandidates(match.left, winners)[0]
  const rightTeam = slotCandidates(match.right, winners)[0]
  const winner = getTeam(winners[match.id])
  const ready = Boolean(leftTeam && rightTeam)

  return (
    <article className={cn("knockout-match-card", !ready && "knockout-match-card-locked")}>
      <div className="knockout-match-meta">
        <span>{t("matchNumber", { id: match.id })}</span>
        <span>{getVenueName(match.venue, t)}</span>
      </div>
      <div className="knockout-team-choices">
        {[
          { team: leftTeam, label: slotLabel(match.left, winners, locale, t) },
          { team: rightTeam, label: slotLabel(match.right, winners, locale, t) },
        ].map((item, index) => {
          const selected = Boolean(item.team && winner && item.team.id === winner.id)
          return (
            <button
              key={`${match.id}-${index}`}
              className={cn("knockout-team-choice", selected && "knockout-team-choice-selected")}
              disabled={!ready || !item.team}
              onClick={() => item.team && onPick(match.id, item.team.id)}
            >
              <span className="knockout-team-main">
                {item.team ? <FlagIcon team={item.team} className="knockout-team-flag" /> : <span>·</span>}
                <span>{item.team ? getTeamName(item.team, locale) : item.label}</span>
              </span>
              {selected ? (
                <span className="knockout-winner-badge">
                  <Trophy size={13} />
                  {t("winner")}
                </span>
              ) : (
                <span className="knockout-team-code">{item.team?.code ?? t("pending")}</span>
              )}
            </button>
          )
        })}
      </div>
    </article>
  )
}

function ShareGraphic({
  locale,
  t,
  refEl,
  winners,
  qrCodeUrl,
}: {
  locale: Locale
  t: TFunction
  refEl: React.RefObject<HTMLDivElement | null>
  winners: Winners
  qrCodeUrl: string
}) {
  const champion = getTeam(winners[104])

  return (
    <div ref={refEl} className="share-graphic">
      <div className="poster-ornament poster-ornament-left" aria-hidden="true" />
      <div className="poster-ornament poster-ornament-right" aria-hidden="true" />
      <header className="poster-header">
        <div className="poster-kicker">2026 FIFA WORLD CUP</div>
        <h2>{t("posterTitle")}</h2>
        <p>{t("posterSubtitle")}</p>
      </header>
      <section className="poster-bracket" aria-label={t("posterAriaLabel")}>
        <PosterBracketGraph locale={locale} winners={winners} />
        <div className="poster-champion">
          {champion ? (
            <div className="poster-champion-team">
              <FlagIcon team={champion} className="poster-champion-flag" />
              <span className="poster-champion-name">{getTeamName(champion, locale)}</span>
            </div>
          ) : (
            <div className="poster-champion-empty">{t("posterEmpty")}</div>
          )}
          <div className="poster-champion-label">CHAMPIONS</div>
        </div>
        <div className="poster-trophy">
          <img className="poster-trophy-image" src="/world-cup-trophy.png" alt="" />
        </div>
      </section>
    </div>
  )
}

const posterWidth = 692
const posterHeight = 664
const posterNodeWidth = 64
const posterNodeHeight = 38
const posterFinalCenterX = posterWidth / 2
const posterLeftColumnX = [0, 150, 223, 260]
const posterRightColumnX = [628, 542, 469, 432]
const posterFinalY = 326
const posterChampionLineTop = 262
const posterBasePathProps = {
  fill: "none",
  stroke: "rgb(255 39 91)",
  strokeWidth: 3,
  strokeLinecap: "butt",
  strokeLinejoin: "miter",
} as const
const posterActivePathProps = {
  fill: "none",
  stroke: "rgb(255 225 45)",
  strokeWidth: 4,
  strokeLinecap: "butt",
  strokeLinejoin: "miter",
} as const
const posterRoundY = {
  r32: [0, 78, 156, 234, 312, 390, 468, 546],
  r16: [39, 195, 351, 507],
  qf: [117, 429],
  sf: [307],
}
const posterMatchIds = {
  left: {
    r32: [74, 77, 73, 75, 83, 84, 81, 82],
    r16: [89, 90, 93, 94],
    qf: [97, 98],
    sf: [101],
  },
  right: {
    r32: [76, 78, 79, 80, 86, 88, 85, 87],
    r16: [91, 92, 95, 96],
    qf: [99, 100],
    sf: [102],
  },
}

function PosterBracketGraph({ locale, winners }: { locale: Locale; winners: Winners }){
  const matches = new Map(knockoutRounds.map((match) => [match.id, match]))
  return (
    <div className="poster-bracket-board">
      <PosterLines side="left" />
      <PosterLines side="right" />
      <PosterFinalLines winners={winners} />
      <PosterActiveLines winners={winners} />
      <PosterBracketSide side="left" locale={locale} matchIds={posterMatchIds.left} matches={matches} winners={winners} />
      <PosterBracketSide side="right" locale={locale} matchIds={posterMatchIds.right} matches={matches} winners={winners} />
    </div>
  )
}

function PosterBracketSide({
  side,
  locale,
  matchIds,
  matches,
  winners,
}: {
  side: "left" | "right"
  locale: Locale
  matchIds: { r32: number[]; r16: number[]; qf: number[]; sf: number[] }
  matches: Map<number, Match>
  winners: Winners
}) {
  const columnX = side === "left" ? posterLeftColumnX : posterRightColumnX
  const nodeStyle = (column: number, top: number): CSSProperties => ({
    left: column === 0 ? columnX[column] : columnX[column] - posterNodeWidth / 2,
    top,
  })

  return (
    <>
      {matchIds.r32.map((id, index) => (
        <PosterMatch key={id} side={side} locale={locale} match={matches.get(id)!} winners={winners} style={nodeStyle(0, posterRoundY.r32[index])} showPair />
      ))}
      {matchIds.r16.map((id, index) => (
        <PosterMatch key={id} side={side} locale={locale} match={matches.get(id)!} winners={winners} style={nodeStyle(1, posterRoundY.r16[index])} />
      ))}
      {matchIds.qf.map((id, index) => (
        <PosterMatch key={id} side={side} locale={locale} match={matches.get(id)!} winners={winners} style={nodeStyle(2, posterRoundY.qf[index])} />
      ))}
      {matchIds.sf.map((id, index) => (
        <PosterMatch key={id} side={side} locale={locale} match={matches.get(id)!} winners={winners} style={nodeStyle(3, posterRoundY.sf[index])} />
      ))}
    </>
  )
}

function PosterMatch({
  side,
  locale,
  match,
  winners,
  style,
  showPair,
}: {
  side: "left" | "right"
  locale: Locale
  match: Match
  winners: Winners
  style: CSSProperties
  showPair?: boolean
}) {
  const leftTeam = slotCandidates(match.left, winners)[0]
  const rightTeam = slotCandidates(match.right, winners)[0]
  const winner = getTeam(winners[match.id])
  const teams = (showPair ? [leftTeam, rightTeam] : [winner]).filter(Boolean) as Team[]

  return (
    <div className={cn("poster-match", `poster-match-${match.round}`, side === "right" && "poster-match-right", !teams.length && "poster-match-empty")} style={style}>
      {teams.length ? (
        teams.map((team) => (
          <div
            key={team.id}
            className={cn(
              "poster-team",
              !showPair && "poster-team-flag-only",
              team.id === winner?.id && "poster-team-winner",
              showPair && team.id === winner?.id && "poster-team-first-knockout-winner",
            )}
          >
            <FlagIcon team={team} className="poster-team-flag" />
            {showPair && <span>{getTeamName(team, locale)}</span>}
          </div>
        ))
      ) : (
        <span className="poster-slot" />
      )}
    </div>
  )
}

function PosterLines({ side }: { side: "left" | "right" }) {
  const columnX = side === "left" ? posterLeftColumnX : posterRightColumnX
  const pairBridge = side === "left" ? columnX[0] + posterNodeWidth + 12 : columnX[0] - 12
  const sourceX = (column: number) => {
    return column === 0 ? pairBridge : columnX[column]
  }
  const targetX = (column: number) => columnX[column]
  const linePair = (fromColumn: number, fromY: number, toColumn: number, toY: number) => {
    return { fromX: sourceX(fromColumn), fromY, toX: targetX(toColumn), toY }
  }
  const connections = [
    ...posterRoundY.r16.flatMap((targetY, index) => [
      linePair(0, posterRoundY.r32[index * 2] + posterNodeHeight / 2, 1, targetY + posterNodeHeight / 2),
      linePair(0, posterRoundY.r32[index * 2 + 1] + posterNodeHeight / 2, 1, targetY + posterNodeHeight / 2),
    ]),
    ...posterRoundY.qf.flatMap((targetY, index) => [
      linePair(1, posterRoundY.r16[index * 2] + posterNodeHeight / 2, 2, targetY + posterNodeHeight / 2),
      linePair(1, posterRoundY.r16[index * 2 + 1] + posterNodeHeight / 2, 2, targetY + posterNodeHeight / 2),
    ]),
  ]
  const sfConnections = posterRoundY.qf.map((qfTop) => ({
    fromX: sourceX(2),
    fromY: qfTop + posterNodeHeight / 2,
    toX: targetX(3),
    toY: posterRoundY.sf[0] + posterNodeHeight / 2,
  }))

  return (
    <svg className="poster-lines" width={posterWidth} height={posterHeight} viewBox={`0 0 ${posterWidth} ${posterHeight}`} aria-hidden="true">
      {posterRoundY.r32.map((top, index) => {
        const y1 = top + 10
        const y2 = top + 28
        const centerY = top + posterNodeHeight / 2
        const nodeEdge = side === "left" ? columnX[0] + posterNodeWidth : columnX[0]
        return (
          <path key={`pair-${index}`} {...posterBasePathProps} d={`M ${nodeEdge} ${y1} H ${pairBridge} V ${y2} H ${nodeEdge} M ${pairBridge} ${centerY} H ${sourceX(0)}`} />
        )
      })}
      {connections.map((line, index) => {
        const midX = line.fromX + (line.toX - line.fromX) / 2
        return <path key={index} {...posterBasePathProps} d={`M ${line.fromX} ${line.fromY} H ${midX} V ${line.toY} H ${line.toX}`} />
      })}
      {sfConnections.map((line, index) => (
        <path key={`sf-${index}`} {...posterBasePathProps} d={`M ${line.fromX} ${line.fromY} H ${line.toX} V ${line.toY}`} />
      ))}
    </svg>
  )
}

function PosterFinalLines({ winners }: { winners: Winners }) {
  const championId = winners[104]
  const leftFinalistId = winners[101]
  const rightFinalistId = winners[102]
  const activeSide = championId && championId === leftFinalistId ? "left" : championId && championId === rightFinalistId ? "right" : undefined

  return (
    <svg className="poster-lines poster-final-lines" width={posterWidth} height={posterHeight} viewBox={`0 0 ${posterWidth} ${posterHeight}`} aria-hidden="true">
      <path className="poster-final-base" {...posterBasePathProps} d={`M ${posterLeftColumnX[3]} ${posterFinalY} H ${posterFinalCenterX}`} />
      <path className="poster-final-base" {...posterBasePathProps} d={`M ${posterRightColumnX[3]} ${posterFinalY} H ${posterFinalCenterX}`} />
      {activeSide === "left" && <path className="poster-final-active" {...posterActivePathProps} d={`M ${posterLeftColumnX[3]} ${posterFinalY} H ${posterFinalCenterX} V ${posterChampionLineTop}`} />}
      {activeSide === "right" && <path className="poster-final-active" {...posterActivePathProps} d={`M ${posterRightColumnX[3]} ${posterFinalY} H ${posterFinalCenterX} V ${posterChampionLineTop}`} />}
    </svg>
  )
}

function getPosterMatchPoint(matchId: number) {
  for (const side of ["left", "right"] as const) {
    const matchIds = posterMatchIds[side]
    const columnX = side === "left" ? posterLeftColumnX : posterRightColumnX
    const rounds = ["r32", "r16", "qf", "sf"] as const

    for (const round of rounds) {
      const index = matchIds[round].indexOf(matchId)
      if (index === -1) continue
      const y = posterRoundY[round][index] + posterNodeHeight / 2
      if (round === "r32") {
        return {
          side,
          x: side === "left" ? columnX[0] + posterNodeWidth + 12 : columnX[0] - 12,
          y,
        }
      }
      return { side, x: columnX[rounds.indexOf(round)], y }
    }
  }

  return undefined
}

function getPosterPath(fromMatchId: number, toMatchId: number) {
  const from = getPosterMatchPoint(fromMatchId)
  const to = toMatchId === 104 ? { x: posterFinalCenterX, y: posterFinalY } : getPosterMatchPoint(toMatchId)
  if (!from || !to) return undefined
  if (toMatchId === 101 || toMatchId === 102) {
    return `M ${from.x} ${from.y} H ${to.x} V ${to.y}`
  }
  const midX = from.x + (to.x - from.x) / 2
  return `M ${from.x} ${from.y} H ${midX} V ${to.y} H ${to.x}`
}

function getPosterR32WinnerPath(match: Match, winnerId: string, winners: Winners) {
  for (const side of ["left", "right"] as const) {
    const index = posterMatchIds[side].r32.indexOf(match.id)
    if (index === -1) continue

    const leftTeam = slotCandidates(match.left, winners)[0]
    const rightTeam = slotCandidates(match.right, winners)[0]
    const winnerIndex = leftTeam?.id === winnerId ? 0 : rightTeam?.id === winnerId ? 1 : -1
    if (winnerIndex === -1) return undefined

    const columnX = side === "left" ? posterLeftColumnX : posterRightColumnX
    const top = posterRoundY.r32[index]
    const y = top + (winnerIndex === 0 ? 10 : 28)
    const centerY = top + posterNodeHeight / 2
    const nodeEdge = side === "left" ? columnX[0] + posterNodeWidth : columnX[0]
    const pairBridge = side === "left" ? columnX[0] + posterNodeWidth + 12 : columnX[0] - 12
    return `M ${nodeEdge} ${y} H ${pairBridge} V ${centerY}`
  }

  return undefined
}

function PosterActiveLines({ winners }: { winners: Winners }) {
  const paths: string[] = []
  const matches = new Map(knockoutRounds.map((match) => [match.id, match]))

  const collect = (matchId: number) => {
    const match = matches.get(matchId)
    const winnerId = winners[matchId]
    if (!match || !winnerId) return

    if (match.round === "r32") {
      const path = getPosterR32WinnerPath(match, winnerId, winners)
      if (path) paths.push(path)
      return
    }

    const advancingSlot = [match.left, match.right].find((slot) => slot.type === "winner" && winners[slot.match] === winnerId)
    if (advancingSlot?.type !== "winner") return

    const path = getPosterPath(advancingSlot.match, matchId)
    if (path) paths.push(path)
    collect(advancingSlot.match)
  }

  collect(104)

  return (
    <svg className="poster-lines poster-active-lines" width={posterWidth} height={posterHeight} viewBox={`0 0 ${posterWidth} ${posterHeight}`} aria-hidden="true">
      {paths.map((path, index) => (
        <path key={index} {...posterActivePathProps} d={path} />
      ))}
    </svg>
  )
}

export default App
