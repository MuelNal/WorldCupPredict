export type GroupKey =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"

export type Team = {
  id: string
  name: string
  zh: string
  ja: string
  code: string
  flag: string
}

export type Group = {
  key: GroupKey
  teams: Team[]
}

export type Slot =
  | { type: "group"; group: GroupKey; place: 1 | 2 | 3; label: string; teamId?: string }
  | { type: "winner"; match: number; label: string }

export type Match = {
  id: number
  round: "r32" | "r16" | "qf" | "sf" | "third" | "final"
  title: string
  venue: string
  left: Slot
  right: Slot
}

export const groups: Group[] = [
  {
    key: "A",
    teams: [
      { id: "mexico", name: "Mexico", zh: "墨西哥", ja: "メキシコ", code: "MEX", flag: "🇲🇽" },
      { id: "south-africa", name: "South Africa", zh: "南非", ja: "南アフリカ", code: "RSA", flag: "🇿🇦" },
      { id: "south-korea", name: "South Korea", zh: "韩国", ja: "韓国", code: "KOR", flag: "🇰🇷" },
      { id: "czechia", name: "Czechia", zh: "捷克", ja: "チェコ", code: "CZE", flag: "🇨🇿" },
    ],
  },
  {
    key: "B",
    teams: [
      { id: "canada", name: "Canada", zh: "加拿大", ja: "カナダ", code: "CAN", flag: "🇨🇦" },
      { id: "switzerland", name: "Switzerland", zh: "瑞士", ja: "スイス", code: "SUI", flag: "🇨🇭" },
      { id: "qatar", name: "Qatar", zh: "卡塔尔", ja: "カタール", code: "QAT", flag: "🇶🇦" },
      { id: "bosnia-herzegovina", name: "Bosnia and Herzegovina", zh: "波黑", ja: "ボスニア・ヘルツェゴビナ", code: "BIH", flag: "🇧🇦" },
    ],
  },
  {
    key: "C",
    teams: [
      { id: "brazil", name: "Brazil", zh: "巴西", ja: "ブラジル", code: "BRA", flag: "🇧🇷" },
      { id: "morocco", name: "Morocco", zh: "摩洛哥", ja: "モロッコ", code: "MAR", flag: "🇲🇦" },
      { id: "haiti", name: "Haiti", zh: "海地", ja: "ハイチ", code: "HAI", flag: "🇭🇹" },
      { id: "scotland", name: "Scotland", zh: "苏格兰", ja: "スコットランド", code: "SCO", flag: "🏴" },
    ],
  },
  {
    key: "D",
    teams: [
      { id: "united-states", name: "United States", zh: "美国", ja: "アメリカ", code: "USA", flag: "🇺🇸" },
      { id: "paraguay", name: "Paraguay", zh: "巴拉圭", ja: "パラグアイ", code: "PAR", flag: "🇵🇾" },
      { id: "australia", name: "Australia", zh: "澳大利亚", ja: "オーストラリア", code: "AUS", flag: "🇦🇺" },
      { id: "turkiye", name: "Turkiye", zh: "土耳其", ja: "トルコ", code: "TUR", flag: "🇹🇷" },
    ],
  },
  {
    key: "E",
    teams: [
      { id: "germany", name: "Germany", zh: "德国", ja: "ドイツ", code: "GER", flag: "🇩🇪" },
      { id: "curacao", name: "Curacao", zh: "库拉索", ja: "キュラソー", code: "CUW", flag: "🇨🇼" },
      { id: "ivory-coast", name: "Ivory Coast", zh: "科特迪瓦", ja: "コートジボワール", code: "CIV", flag: "🇨🇮" },
      { id: "ecuador", name: "Ecuador", zh: "厄瓜多尔", ja: "エクアドル", code: "ECU", flag: "🇪🇨" },
    ],
  },
  {
    key: "F",
    teams: [
      { id: "netherlands", name: "Netherlands", zh: "荷兰", ja: "オランダ", code: "NED", flag: "🇳🇱" },
      { id: "japan", name: "Japan", zh: "日本", ja: "日本", code: "JPN", flag: "🇯🇵" },
      { id: "tunisia", name: "Tunisia", zh: "突尼斯", ja: "チュニジア", code: "TUN", flag: "🇹🇳" },
      { id: "sweden", name: "Sweden", zh: "瑞典", ja: "スウェーデン", code: "SWE", flag: "🇸🇪" },
    ],
  },
  {
    key: "G",
    teams: [
      { id: "belgium", name: "Belgium", zh: "比利时", ja: "ベルギー", code: "BEL", flag: "🇧🇪" },
      { id: "egypt", name: "Egypt", zh: "埃及", ja: "エジプト", code: "EGY", flag: "🇪🇬" },
      { id: "iran", name: "Iran", zh: "伊朗", ja: "イラン", code: "IRN", flag: "🇮🇷" },
      { id: "new-zealand", name: "New Zealand", zh: "新西兰", ja: "ニュージーランド", code: "NZL", flag: "🇳🇿" },
    ],
  },
  {
    key: "H",
    teams: [
      { id: "spain", name: "Spain", zh: "西班牙", ja: "スペイン", code: "ESP", flag: "🇪🇸" },
      { id: "cape-verde", name: "Cape Verde", zh: "佛得角", ja: "カーボベルデ", code: "CPV", flag: "🇨🇻" },
      { id: "saudi-arabia", name: "Saudi Arabia", zh: "沙特阿拉伯", ja: "サウジアラビア", code: "KSA", flag: "🇸🇦" },
      { id: "uruguay", name: "Uruguay", zh: "乌拉圭", ja: "ウルグアイ", code: "URU", flag: "🇺🇾" },
    ],
  },
  {
    key: "I",
    teams: [
      { id: "france", name: "France", zh: "法国", ja: "フランス", code: "FRA", flag: "🇫🇷" },
      { id: "senegal", name: "Senegal", zh: "塞内加尔", ja: "セネガル", code: "SEN", flag: "🇸🇳" },
      { id: "norway", name: "Norway", zh: "挪威", ja: "ノルウェー", code: "NOR", flag: "🇳🇴" },
      { id: "iraq", name: "Iraq", zh: "伊拉克", ja: "イラク", code: "IRQ", flag: "🇮🇶" },
    ],
  },
  {
    key: "J",
    teams: [
      { id: "argentina", name: "Argentina", zh: "阿根廷", ja: "アルゼンチン", code: "ARG", flag: "🇦🇷" },
      { id: "algeria", name: "Algeria", zh: "阿尔及利亚", ja: "アルジェリア", code: "ALG", flag: "🇩🇿" },
      { id: "austria", name: "Austria", zh: "奥地利", ja: "オーストリア", code: "AUT", flag: "🇦🇹" },
      { id: "jordan", name: "Jordan", zh: "约旦", ja: "ヨルダン", code: "JOR", flag: "🇯🇴" },
    ],
  },
  {
    key: "K",
    teams: [
      { id: "portugal", name: "Portugal", zh: "葡萄牙", ja: "ポルトガル", code: "POR", flag: "🇵🇹" },
      { id: "uzbekistan", name: "Uzbekistan", zh: "乌兹别克斯坦", ja: "ウズベキスタン", code: "UZB", flag: "🇺🇿" },
      { id: "colombia", name: "Colombia", zh: "哥伦比亚", ja: "コロンビア", code: "COL", flag: "🇨🇴" },
      { id: "dr-congo", name: "DR Congo", zh: "刚果（金）", ja: "コンゴ民主共和国", code: "COD", flag: "🇨🇩" },
    ],
  },
  {
    key: "L",
    teams: [
      { id: "england", name: "England", zh: "英格兰", ja: "イングランド", code: "ENG", flag: "🏴" },
      { id: "croatia", name: "Croatia", zh: "克罗地亚", ja: "クロアチア", code: "CRO", flag: "🇭🇷" },
      { id: "ghana", name: "Ghana", zh: "加纳", ja: "ガーナ", code: "GHA", flag: "🇬🇭" },
      { id: "panama", name: "Panama", zh: "巴拿马", ja: "パナマ", code: "PAN", flag: "🇵🇦" },
    ],
  },
]

const g = (group: GroupKey, place: 1 | 2 | 3, label: string): Slot => ({ type: "group", group, place, label })
const w = (match: number): Slot => ({ type: "winner", match, label: `第 ${match} 场胜者` })

export const roundOf32: Match[] = [
  { id: 73, round: "r32", title: "32 强", venue: "洛杉矶", left: { type: "group", group: "A", place: 2, label: "南非", teamId: "south-africa" }, right: { type: "group", group: "B", place: 2, label: "加拿大", teamId: "canada" } },
  { id: 74, round: "r32", title: "32 强", venue: "波士顿", left: { type: "group", group: "E", place: 1, label: "德国", teamId: "germany" }, right: { type: "group", group: "D", place: 3, label: "巴拉圭", teamId: "paraguay" } },
  { id: 75, round: "r32", title: "32 强", venue: "蒙特雷", left: { type: "group", group: "F", place: 1, label: "荷兰", teamId: "netherlands" }, right: { type: "group", group: "C", place: 2, label: "摩洛哥", teamId: "morocco" } },
  { id: 76, round: "r32", title: "32 强", venue: "休斯敦", left: { type: "group", group: "C", place: 1, label: "巴西", teamId: "brazil" }, right: { type: "group", group: "F", place: 2, label: "日本", teamId: "japan" } },
  { id: 77, round: "r32", title: "32 强", venue: "纽约/新泽西", left: { type: "group", group: "I", place: 1, label: "法国", teamId: "france" }, right: { type: "group", group: "F", place: 3, label: "瑞典", teamId: "sweden" } },
  { id: 78, round: "r32", title: "32 强", venue: "达拉斯", left: { type: "group", group: "E", place: 2, label: "科特迪瓦", teamId: "ivory-coast" }, right: { type: "group", group: "I", place: 2, label: "挪威", teamId: "norway" } },
  { id: 79, round: "r32", title: "32 强", venue: "墨西哥城", left: { type: "group", group: "A", place: 1, label: "墨西哥", teamId: "mexico" }, right: { type: "group", group: "E", place: 3, label: "厄瓜多尔", teamId: "ecuador" } },
  { id: 80, round: "r32", title: "32 强", venue: "亚特兰大", left: { type: "group", group: "L", place: 1, label: "英格兰", teamId: "england" }, right: { type: "group", group: "K", place: 3, label: "刚果 (金)", teamId: "dr-congo" } },
  { id: 81, round: "r32", title: "32 强", venue: "旧金山湾区", left: { type: "group", group: "D", place: 1, label: "美国", teamId: "united-states" }, right: { type: "group", group: "B", place: 3, label: "波黑", teamId: "bosnia-herzegovina" } },
  { id: 82, round: "r32", title: "32 强", venue: "西雅图", left: { type: "group", group: "G", place: 1, label: "比利时", teamId: "belgium" }, right: { type: "group", group: "I", place: 3, label: "塞内加尔", teamId: "senegal" } },
  { id: 83, round: "r32", title: "32 强", venue: "多伦多", left: { type: "group", group: "K", place: 2, label: "葡萄牙", teamId: "portugal" }, right: { type: "group", group: "L", place: 2, label: "克罗地亚", teamId: "croatia" } },
  { id: 84, round: "r32", title: "32 强", venue: "洛杉矶", left: { type: "group", group: "H", place: 1, label: "西班牙", teamId: "spain" }, right: { type: "group", group: "J", place: 2, label: "奥地利", teamId: "austria" } },
  { id: 85, round: "r32", title: "32 强", venue: "温哥华", left: { type: "group", group: "B", place: 1, label: "瑞士", teamId: "switzerland" }, right: { type: "group", group: "J", place: 3, label: "阿尔及利亚", teamId: "algeria" } },
  { id: 86, round: "r32", title: "32 强", venue: "迈阿密", left: { type: "group", group: "J", place: 1, label: "阿根廷", teamId: "argentina" }, right: { type: "group", group: "H", place: 2, label: "佛得角", teamId: "cape-verde" } },
  { id: 87, round: "r32", title: "32 强", venue: "堪萨斯城", left: { type: "group", group: "K", place: 1, label: "哥伦比亚", teamId: "colombia" }, right: { type: "group", group: "L", place: 3, label: "加纳", teamId: "ghana" } },
  { id: 88, round: "r32", title: "32 强", venue: "达拉斯", left: { type: "group", group: "D", place: 2, label: "澳大利亚", teamId: "australia" }, right: { type: "group", group: "G", place: 2, label: "埃及", teamId: "egypt" } },
]

export const knockoutRounds: Match[] = [
  ...roundOf32,
  { id: 89, round: "r16", title: "16 强", venue: "费城", left: w(74), right: w(77) },
  { id: 90, round: "r16", title: "16 强", venue: "休斯敦", left: w(73), right: w(75) },
  { id: 91, round: "r16", title: "16 强", venue: "纽约/新泽西", left: w(76), right: w(78) },
  { id: 92, round: "r16", title: "16 强", venue: "墨西哥城", left: w(79), right: w(80) },
  { id: 93, round: "r16", title: "16 强", venue: "达拉斯", left: w(83), right: w(84) },
  { id: 94, round: "r16", title: "16 强", venue: "西雅图", left: w(81), right: w(82) },
  { id: 95, round: "r16", title: "16 强", venue: "亚特兰大", left: w(86), right: w(88) },
  { id: 96, round: "r16", title: "16 强", venue: "温哥华", left: w(85), right: w(87) },
  { id: 97, round: "qf", title: "1/4 决赛", venue: "波士顿", left: w(89), right: w(90) },
  { id: 98, round: "qf", title: "1/4 决赛", venue: "洛杉矶", left: w(93), right: w(94) },
  { id: 99, round: "qf", title: "1/4 决赛", venue: "迈阿密", left: w(91), right: w(92) },
  { id: 100, round: "qf", title: "1/4 决赛", venue: "堪萨斯城", left: w(95), right: w(96) },
  { id: 101, round: "sf", title: "半决赛", venue: "达拉斯", left: w(97), right: w(98) },
  { id: 102, round: "sf", title: "半决赛", venue: "亚特兰大", left: w(99), right: w(100) },
  { id: 104, round: "final", title: "决赛", venue: "纽约/新泽西", left: w(101), right: w(102) },
]

export const dataNote =
  "数据基于 2026-05-03 可检索的 FIFA 赛程页与近期小组名单索引。32 强中“最佳第三”的精确落位会按 FIFA 最终第三名组合规则变动。"
