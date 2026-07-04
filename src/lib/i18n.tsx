import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "zh" | "zh-CN" | "ja" | "ko" | "es";
const KEY = "fahy.lang";

export const LANGUAGES: {
  code: Lang;
  label: string;
  native: string;
  flag: string;
  coin: string;
}[] = [
  {
    code: "en",
    label: "English",
    native: "English",
    flag: "🇬🇧",
    coin: "Peach Blossom Coins",
  },
  {
    code: "zh",
    label: "Traditional Chinese",
    native: "繁體中文",
    flag: "🇹🇼",
    coin: "桃源幣",
  },
  {
    code: "zh-CN",
    label: "Simplified Chinese",
    native: "简体中文",
    flag: "🇨🇳",
    coin: "桃源币",
  },
  {
    code: "ja",
    label: "Japanese",
    native: "日本語",
    flag: "🇯🇵",
    coin: "桃源コイン",
  },
  {
    code: "ko",
    label: "Korean",
    native: "한국어",
    flag: "🇰🇷",
    coin: "복숭아꽃 코인",
  },
  {
    code: "es",
    label: "Spanish",
    native: "Español",
    flag: "🇪🇸",
    coin: "Monedas Flor de Durazno",
  },
];

const COIN_BY_LANG: Record<Lang, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.coin]),
) as Record<Lang, string>;

export type TranslationMap = Partial<Record<Lang, string>> & { en: string };

/**
 * Full UI dictionary. Every visible string in the app is keyed here so the
 * entire page translates when the user switches language. Add a new entry
 * here before referencing it via k("...") in a component.
 */
export const DICT = {
  // Brand & generic
  "app.name": {
    en: "The Fahy Hub",
    zh: "花墟仔中心",
    "zh-CN": "花墟仔中心",
    ja: "Fahyハブ",
    ko: "Fahy 허브",
    es: "El Hub de Fahy",
  },
  "common.go_now": {
    en: "Go Now",
    zh: "立即前往",
    "zh-CN": "立即前往",
    ja: "今すぐ行く",
    ko: "지금 가기",
    es: "Ir ahora",
  },
  "common.scan": {
    en: "Scan",
    zh: "掃描",
    "zh-CN": "扫描",
    ja: "スキャン",
    ko: "스캔",
    es: "Escanear",
  },
  "common.locked": {
    en: "Locked",
    zh: "未解鎖",
    "zh-CN": "未解锁",
    ja: "ロック中",
    ko: "잠김",
    es: "Bloqueado",
  },
  "common.unlocked": {
    en: "Unlocked",
    zh: "已解鎖",
    "zh-CN": "已解锁",
    ja: "解放済み",
    ko: "잠금 해제",
    es: "Desbloqueado",
  },

  // Nav
  "nav.hub": {
    en: "Hub",
    zh: "中心",
    "zh-CN": "中心",
    ja: "ハブ",
    ko: "허브",
    es: "Hub",
  },
  "nav.eco": {
    en: "Eco",
    zh: "生態",
    "zh-CN": "生态",
    ja: "エコ",
    ko: "에코",
    es: "Eco",
  },
  "nav.path": {
    en: "Path",
    zh: "工藝",
    "zh-CN": "工艺",
    ja: "パス",
    ko: "장인",
    es: "Ruta",
  },
  "nav.coin": {
    en: "Coin",
    zh: "錢包",
    "zh-CN": "钱包",
    ja: "コイン",
    ko: "코인",
    es: "Cartera",
  },
  "nav.report": {
    en: "Report",
    zh: "回報",
    "zh-CN": "回报",
    ja: "通報",
    ko: "신고",
    es: "Reportar",
  },
  "nav.tasks": {
    en: "Tasks",
    zh: "任務",
    "zh-CN": "任务",
    ja: "タスク",
    ko: "작업",
    es: "Tareas",
  },

  // Leaderboard
  "leaderboard.title": {
    en: "Leaderboard",
    zh: "排行榜",
    "zh-CN": "排行榜",
    ja: "リーダーボード",
    ko: "리더보드",
    es: "Clasificación",
  },
  "leaderboard.desc": {
    en: "Updated every hour",
    zh: "每小時更新",
    "zh-CN": "每小时更新",
    ja: "毎時間更新",
    ko: "매시간 업데이트",
    es: "Actualizado cada hora",
  },
  "leaderboard.score": {
    en: "Points",
    zh: "積分",
    "zh-CN": "积分",
    ja: "ポイント",
    ko: "포인트",
    es: "Puntos",
  },
  "leaderboard.rank": {
    en: "Rank",
    zh: "排名",
    "zh-CN": "排名",
    ja: "ランク",
    ko: "순위",
    es: "Rango",
  },

  // Tasks
  "tasks.title": {
    en: "Daily Tasks",
    zh: "每日任務",
    "zh-CN": "每日任务",
    ja: "デイリータスク",
    ko: "일일 과제",
    es: "Tareas Diarias",
  },
  "tasks.desc": {
    en: "Complete tasks to earn coins",
    zh: "完成任務以獲得獎勵",
    "zh-CN": "完成任务以获得奖励",
    ja: "タスク完了でコイン獲得",
    ko: "작업을 완료하여 코인 획득",
    es: "Completa tareas por monedas",
  },
  "tasks.collect": {
    en: "Collect",
    zh: "領取",
    "zh-CN": "领取",
    ja: "受け取る",
    ko: "수집",
    es: "Recoger",
  },
  "tasks.collected": {
    en: "Collected",
    zh: "已領取",
    "zh-CN": "已领取",
    ja: "受け取り済み",
    ko: "수집됨",
    es: "Recogido",
  },
  "tasks.task1": {
    en: "Walk 5000 steps",
    zh: "步行 5000 步",
    "zh-CN": "步行 5000 步",
    ja: "5000歩あるく",
    ko: "5000보 걷기",
    es: "Caminar 5000 pasos",
  },
  "tasks.task2": {
    en: "Visit Heritage Wall",
    zh: "造訪歷史古牆",
    "zh-CN": "造访历史古墙",
    ja: "歴史的な壁を訪れる",
    ko: "유산 벽 방문",
    es: "Visitar el muro",
  },
  "tasks.task3": {
    en: "Report an issue",
    zh: "回報一個問題",
    "zh-CN": "回报一个问题",
    ja: "問題を報告する",
    ko: "문제 신고",
    es: "Reportar problema",
  },

  // Dashboard
  "home.district": {
    en: "Daan District",
    zh: "大安區",
    "zh-CN": "大安区",
    ja: "大安区",
    ko: "다안구",
    es: "Distrito Daan",
  },
  "home.greeting": {
    en: "Morning, Neighbor!",
    zh: "早安，鄰居！",
    "zh-CN": "早安，邻居！",
    ja: "おはよう、ご近所さん！",
    ko: "안녕, 이웃!",
    es: "¡Buenos días, vecino!",
  },
  "home.metric.aqi": {
    en: "AQI",
    zh: "空氣品質",
    "zh-CN": "空气质量",
    ja: "AQI",
    ko: "공기질",
    es: "ICA",
  },
  "home.metric.aqi_status": {
    en: "Excellent",
    zh: "極佳",
    "zh-CN": "极佳",
    ja: "とても良い",
    ko: "최상",
    es: "Excelente",
  },
  "home.metric.crowd": {
    en: "Crowd",
    zh: "人流",
    "zh-CN": "人流",
    ja: "人出",
    ko: "혼잡도",
    es: "Gente",
  },
  "home.metric.crowd_value": {
    en: "Low",
    zh: "稀少",
    "zh-CN": "稀少",
    ja: "少ない",
    ko: "낮음",
    es: "Bajo",
  },
  "home.metric.crowd_status": {
    en: "Quiet Path",
    zh: "靜謐小徑",
    "zh-CN": "静谧小径",
    ja: "静かな道",
    ko: "조용한 길",
    es: "Ruta tranquila",
  },
  "home.metric.noise": {
    en: "Noise",
    zh: "噪音",
    "zh-CN": "噪音",
    ja: "騒音",
    ko: "소음",
    es: "Ruido",
  },
  "home.metric.noise_status": {
    en: "Serene",
    zh: "寧靜",
    "zh-CN": "宁静",
    ja: "穏やか",
    ko: "고요함",
    es: "Sereno",
  },
  "home.rec.tag": {
    en: "Fahy's Recommendation",
    zh: "Fahy 推薦",
    "zh-CN": "Fahy 推荐",
    ja: "Fahyのおすすめ",
    ko: "Fahy 추천",
    es: "Recomendación de Fahy",
  },
  "home.rec.body": {
    en: "The West Alley is unusually quiet right now. Perfect time for a Silent Listening session.",
    zh: "西巷此刻特別安靜，正適合一場「靜謐聆聽」。",
    "zh-CN": "西巷此刻特别安静，正适合一场「静谧聆听」。",
    ja: "西の路地は今、とても静か。「サイレント・リスニング」に最適です。",
    ko: "지금 서쪽 골목이 유난히 조용해요. 사일런트 리스닝하기 딱 좋아요.",
    es: "El Callejón Oeste está inusualmente tranquilo. Perfecto para una sesión de Escucha Silenciosa.",
  },
  "home.rec.highlight": {
    en: "Silent Listening",
    zh: "靜謐聆聽",
    "zh-CN": "静谧聆听",
    ja: "サイレント・リスニング",
    ko: "사일런트 리스닝",
    es: "Escucha Silenciosa",
  },
  "home.challenge": {
    en: "32×32 Challenge",
    zh: "32×32 挑戰",
    "zh-CN": "32×32 挑战",
    ja: "32×32 チャレンジ",
    ko: "32×32 챌린지",
    es: "Reto 32×32",
  },
  "home.collected": {
    en: "12 / 32 Collected",
    zh: "已收集 12 / 32",
    "zh-CN": "已收集 12 / 32",
    ja: "12 / 32 収集済み",
    ko: "12 / 32 수집",
    es: "12 / 32 recogidos",
  },
  "home.species.winter_camellia": {
    en: "Winter Camellia",
    zh: "冬季山茶",
    "zh-CN": "冬季山茶",
    ja: "冬の椿",
    ko: "겨울 동백",
    es: "Camelia de invierno",
  },
  "home.species.banyan_sparrow": {
    en: "Banyan Sparrow",
    zh: "榕樹麻雀",
    "zh-CN": "榕树麻雀",
    ja: "ガジュマルのスズメ",
    ko: "반얀 참새",
    es: "Gorrión del baniano",
  },
  "home.species.locked_visit": {
    en: "Visit wall",
    zh: "造訪牆面",
    "zh-CN": "造访墙面",
    ja: "壁を訪れる",
    ko: "벽 방문",
    es: "Visita el muro",
  },
  "home.species.locked_scan": {
    en: "Scan area",
    zh: "掃描區域",
    "zh-CN": "扫描区域",
    ja: "エリアをスキャン",
    ko: "지역 스캔",
    es: "Escanea la zona",
  },
  "home.species.locked_name": {
    en: "Locked Node",
    zh: "未解鎖節點",
    "zh-CN": "未解锁节点",
    ja: "未解放ノード",
    ko: "잠긴 노드",
    es: "Nodo bloqueado",
  },
  "home.species.node": {
    en: "Node",
    zh: "節點",
    "zh-CN": "节点",
    ja: "ノード",
    ko: "노드",
    es: "Nodo",
  },
  "home.tile.wallet": {
    en: "WALLET",
    zh: "錢包",
    "zh-CN": "钱包",
    ja: "ウォレット",
    ko: "지갑",
    es: "CARTERA",
  },
  "home.tile.peach_coins": {
    en: "Peach Coins",
    zh: "桃源幣",
    "zh-CN": "桃源币",
    ja: "桃源コイン",
    ko: "복숭아꽃 코인",
    es: "Monedas Durazno",
  },
  "home.tile.artisan_path": {
    en: "Artisan Path",
    zh: "工藝之路",
    "zh-CN": "工艺之路",
    ja: "職人の道",
    ko: "장인의 길",
    es: "Ruta Artesanal",
  },
  "home.tile.badges": {
    en: "{n} Badges",
    zh: "{n} 個徽章",
    "zh-CN": "{n} 个徽章",
    ja: "{n} 個のバッジ",
    ko: "{n} 개 배지",
    es: "{n} insignias",
  },
  "home.report_btn": {
    en: "Report & Restore",
    zh: "回報與修復",
    "zh-CN": "回报与修复",
    ja: "報告して直す",
    ko: "신고하고 복원하기",
    es: "Reportar y Restaurar",
  },
  "home.bloom": {
    en: "Bloom",
    zh: "盛開",
    "zh-CN": "盛开",
    ja: "満開",
    ko: "만개",
    es: "Floración",
  },
  "home.cocreator.tag": {
    en: "Regional Co-Creator",
    zh: "地區共創者",
    "zh-CN": "地区共创者",
    ja: "地域コ・クリエイター",
    ko: "지역 공동 창작자",
    es: "Co-Creador Regional",
  },
  "home.cocreator.body": {
    en: "You're in the top 8% this month",
    zh: "您本月名列前 8%",
    "zh-CN": "您本月名列前 8%",
    ja: "今月の上位 8% に入っています",
    ko: "이번 달 상위 8%입니다",
    es: "Estás en el top 8% este mes",
  },

  // Ecosystem
  "eco.tag": {
    en: "Ecosystem",
    zh: "生態系統",
    "zh-CN": "生态系统",
    ja: "エコシステム",
    ko: "생태계",
    es: "Ecosistema",
  },
  "eco.title": {
    en: "32×32 Challenge",
    zh: "32×32 挑戰",
    "zh-CN": "32×32 挑战",
    ja: "32×32 チャレンジ",
    ko: "32×32 챌린지",
    es: "Reto 32×32",
  },
  "eco.guide": {
    en: "Tap a glowing node on the map to track its habitat!",
    zh: "點選地圖上發光的節點即可追蹤該物種的棲地！",
    "zh-CN": "点击地图上发光的节点即可追踪该物种的栖地！",
    ja: "マップ上の光るノードをタップして生息地を追跡しよう！",
    ko: "지도에서 빛나는 노드를 탭해 서식지를 추적하세요!",
    es: "¡Toca un nodo brillante en el mapa para rastrear su hábitat!",
  },
  "eco.legend.final": {
    en: "Final Evo",
    zh: "終極演化",
    "zh-CN": "终极演化",
    ja: "最終進化",
    ko: "최종 진화",
    es: "Evol. Final",
  },
  "eco.action.track": {
    en: "Track",
    zh: "追蹤",
    "zh-CN": "追踪",
    ja: "追跡",
    ko: "추적",
    es: "Rastrear",
  },
  "eco.action.qr": {
    en: "Habitat QR",
    zh: "棲地 QR",
    "zh-CN": "栖地 QR",
    ja: "生息地QR",
    ko: "서식지 QR",
    es: "QR de hábitat",
  },
  "eco.action.listen": {
    en: "Listen",
    zh: "聆聽",
    "zh-CN": "聆听",
    ja: "聴く",
    ko: "듣기",
    es: "Escuchar",
  },
  "eco.action.silent": {
    en: "Silent Mode",
    zh: "靜謐模式",
    "zh-CN": "静谧模式",
    ja: "サイレント",
    ko: "사일런트 모드",
    es: "Modo Silencio",
  },
  "eco.book": {
    en: "Collection Book",
    zh: "圖鑑",
    "zh-CN": "图鉴",
    ja: "コレクションブック",
    ko: "도감",
    es: "Libro de colección",
  },
  "eco.bud": {
    en: "Bud",
    zh: "花苞",
    "zh-CN": "花苞",
    ja: "つぼみ",
    ko: "꽃봉오리",
    es: "Capullo",
  },
  "eco.bloom": {
    en: "Bloom",
    zh: "盛開",
    "zh-CN": "盛开",
    ja: "満開",
    ko: "만개",
    es: "Floración",
  },
  "eco.final": {
    en: "Final",
    zh: "終極",
    "zh-CN": "终极",
    ja: "最終",
    ko: "최종",
    es: "Final",
  },
  "eco.listening.tag": {
    en: "Silent Listening",
    zh: "靜謐聆聽",
    "zh-CN": "静谧聆听",
    ja: "サイレント・リスニング",
    ko: "사일런트 리스닝",
    es: "Escucha Silenciosa",
  },
  "eco.listening.detected": {
    en: "Sparrow detected · 4.2 kHz",
    zh: "偵測到麻雀 · 4.2 kHz",
    "zh-CN": "侦测到麻雀 · 4.2 kHz",
    ja: "スズメを検出 · 4.2 kHz",
    ko: "참새 감지 · 4.2 kHz",
    es: "Gorrión detectado · 4.2 kHz",
  },
  "eco.listening.hint": {
    en: "Stay still. Fahy is identifying the species around you.",
    zh: "請保持安靜，Fahy 正在辨識附近的物種。",
    "zh-CN": "请保持安静，Fahy 正在识别附近的物种。",
    ja: "静かにしてね。Fahyが周りの生き物を判定中です。",
    ko: "조용히 있어 주세요. Fahy가 주변 종을 식별하는 중입니다.",
    es: "Quédate quieto. Fahy está identificando las especies a tu alrededor.",
  },

  // Culture
  "culture.tag": {
    en: "Culture",
    zh: "文化",
    "zh-CN": "文化",
    ja: "カルチャー",
    ko: "문화",
    es: "Cultura",
  },
  "culture.title": {
    en: "Artisan Path",
    zh: "工藝之路",
    "zh-CN": "工艺之路",
    ja: "職人の道",
    ko: "장인의 길",
    es: "Ruta Artesanal",
  },
  "culture.guide": {
    en: "Visit a Certification Center and scan their card to earn a badge.",
    zh: "前往認證據點，掃描他們的卡片即可獲得徽章。",
    "zh-CN": "前往认证据点，扫描他们的卡片即可获得徽章。",
    ja: "認定スポットを訪れ、カードをスキャンしてバッジを獲得しよう。",
    ko: "인증 거점을 방문해 카드를 스캔하면 배지를 받을 수 있어요.",
    es: "Visita un Centro de Certificación y escanea su tarjeta para ganar una insignia.",
  },
  "culture.passport": {
    en: "Artisan Passport",
    zh: "工藝護照",
    "zh-CN": "工艺护照",
    ja: "職人パスポート",
    ko: "장인 여권",
    es: "Pasaporte Artesano",
  },
  "culture.badges_progress": {
    en: "{a} / {b} badges",
    zh: "{a} / {b} 個徽章",
    "zh-CN": "{a} / {b} 个徽章",
    ja: "{a} / {b} 個のバッジ",
    ko: "{a} / {b} 개 배지",
    es: "{a} / {b} insignias",
  },
  "culture.centers": {
    en: "Certification Centers",
    zh: "認證據點",
    "zh-CN": "认证据点",
    ja: "認定スポット",
    ko: "인증 거점",
    es: "Centros de Certificación",
  },
  "culture.away": {
    en: "away",
    zh: "外",
    "zh-CN": "外",
    ja: "先",
    ko: "거리",
    es: "de distancia",
  },
  "culture.oral": {
    en: "Digital Oral History",
    zh: "數位口述歷史",
    "zh-CN": "数字口述历史",
    ja: "デジタル・オーラル・ヒストリー",
    ko: "디지털 구술 역사",
    es: "Historia Oral Digital",
  },
  "culture.oral.tea": {
    en: "Lin's 40 Years of Tea",
    zh: "林師傅的四十年茶事",
    "zh-CN": "林师傅的四十年茶事",
    ja: "林さんの茶歴40年",
    ko: "린 사부의 40년 차 이야기",
    es: "Los 40 años de té de Lin",
  },
  "culture.oral.tea_meta": {
    en: "2:14 · Unlocked",
    zh: "2:14 · 已解鎖",
    "zh-CN": "2:14 · 已解锁",
    ja: "2:14 · 解放済み",
    ko: "2:14 · 잠금 해제",
    es: "2:14 · Desbloqueado",
  },
  "culture.oral.indigo": {
    en: "Indigo at Midnight",
    zh: "午夜的藍染",
    "zh-CN": "午夜的蓝染",
    ja: "真夜中の藍染め",
    ko: "한밤의 쪽빛 염색",
    es: "Índigo a medianoche",
  },
  "culture.oral.indigo_meta": {
    en: "Scan card to unlock",
    zh: "掃描卡片以解鎖",
    "zh-CN": "扫描卡片以解锁",
    ja: "カードをスキャンで解放",
    ko: "카드 스캔하여 잠금 해제",
    es: "Escanea la tarjeta para desbloquear",
  },
  "culture.badge.tea_master": {
    en: "Tea Master",
    zh: "茶師",
    "zh-CN": "茶师",
    ja: "茶師",
    ko: "차 장인",
    es: "Maestro del té",
  },
  "culture.badge.indigo": {
    en: "Indigo Dye",
    zh: "藍染",
    "zh-CN": "蓝染",
    ja: "藍染め",
    ko: "쪽빛 염색",
    es: "Tinte índigo",
  },
  "culture.badge.bamboo": {
    en: "Bamboo",
    zh: "竹編",
    "zh-CN": "竹编",
    ja: "竹細工",
    ko: "대나무",
    es: "Bambú",
  },
  "culture.badge.paper": {
    en: "Paper",
    zh: "造紙",
    "zh-CN": "造纸",
    ja: "和紙",
    ko: "한지",
    es: "Papel",
  },
  "culture.badge.pottery": {
    en: "Pottery",
    zh: "陶藝",
    "zh-CN": "陶艺",
    ja: "陶芸",
    ko: "도예",
    es: "Cerámica",
  },
  "culture.badge.iron": {
    en: "Iron Work",
    zh: "鐵工",
    "zh-CN": "铁工",
    ja: "鉄工",
    ko: "철 공예",
    es: "Forja",
  },
  "culture.badge.carving": {
    en: "Carving",
    zh: "雕刻",
    "zh-CN": "雕刻",
    ja: "彫刻",
    ko: "조각",
    es: "Tallado",
  },
  "culture.badge.lantern": {
    en: "Lantern",
    zh: "燈籠",
    "zh-CN": "灯笼",
    ja: "提灯",
    ko: "등불",
    es: "Farol",
  },
  "culture.shop.lin": {
    en: "Lin's Tea House",
    zh: "林家茶屋",
    "zh-CN": "林家茶屋",
    ja: "林の茶屋",
    ko: "린의 찻집",
    es: "Casa de Té Lin",
  },
  "culture.shop.old": {
    en: "Old Town Indigo",
    zh: "舊城藍染坊",
    "zh-CN": "旧城蓝染坊",
    ja: "旧市街の藍染工房",
    ko: "구도심 쪽빛 공방",
    es: "Índigo del Casco Viejo",
  },
  "culture.shop.bamboo": {
    en: "Bamboo & Co.",
    zh: "竹編工坊",
    "zh-CN": "竹编工坊",
    ja: "竹工房&Co.",
    ko: "대나무 공방",
    es: "Bambú & Co.",
  },
  "culture.shop.paper": {
    en: "Hui Paper Crafts",
    zh: "卉紙藝閣",
    "zh-CN": "卉纸艺阁",
    ja: "紙芸閣",
    ko: "종이 공방",
    es: "Hui Artesanías de Papel",
  },
  "culture.shop.lantern": {
    en: "Shing Kee Lanterns",
    zh: "盛記燈籠",
    "zh-CN": "盛记灯笼",
    ja: "提灯工房",
    ko: "전통 등불 공방",
    es: "Faroles Shing Kee",
  },

  // Wallet
  "wallet.tag": {
    en: "Circular Economy",
    zh: "循環經濟",
    "zh-CN": "循环经济",
    ja: "循環型経済",
    ko: "순환 경제",
    es: "Economía Circular",
  },
  "wallet.title": {
    en: "Peach Blossom Wallet",
    zh: "桃源錢包",
    "zh-CN": "桃源钱包",
    ja: "桃源ウォレット",
    ko: "복숭아꽃 지갑",
    es: "Cartera Flor de Durazno",
  },
  "wallet.balance": {
    en: "Balance",
    zh: "餘額",
    "zh-CN": "余额",
    ja: "残高",
    ko: "잔액",
    es: "Saldo",
  },
  "wallet.redeem_qr": {
    en: "Redeem with QR",
    zh: "以 QR 兌換",
    "zh-CN": "以 QR 兑换",
    ja: "QRで交換",
    ko: "QR로 교환",
    es: "Canjear con QR",
  },
  "wallet.tracker.tag": {
    en: "Coffee-to-Flowers Tracker",
    zh: "咖啡換花追蹤器",
    "zh-CN": "咖啡换花追踪器",
    ja: "コーヒー→花トラッカー",
    ko: "커피→꽃 트래커",
    es: "Rastreador Café-a-Flores",
  },
  "wallet.tracker.saved": {
    en: "CO₂ saved this month",
    zh: "本月減少 CO₂",
    "zh-CN": "本月减少 CO₂",
    ja: "今月削減した CO₂",
    ko: "이번 달 절감한 CO₂",
    es: "CO₂ ahorrado este mes",
  },
  "wallet.tracker.vs": {
    en: "+18% vs last",
    zh: "比上月增加 18%",
    "zh-CN": "比上月增加 18%",
    ja: "前月比 +18%",
    ko: "지난달 대비 +18%",
    es: "+18% vs anterior",
  },
  "wallet.tracker.goal": {
    en: "68% to monthly bloom goal",
    zh: "達成本月盛開目標 68%",
    "zh-CN": "达成本月盛开目标 68%",
    ja: "今月の満開目標まで68%",
    ko: "월간 만개 목표의 68%",
    es: "68% hacia la meta mensual",
  },
  "wallet.rewards": {
    en: "Seasonal Rewards",
    zh: "季節獎勵",
    "zh-CN": "季节奖励",
    ja: "季節の特典",
    ko: "시즌 보상",
    es: "Recompensas de temporada",
  },
  "wallet.spring_drop": {
    en: "Spring drop",
    zh: "春季登場",
    "zh-CN": "春季登场",
    ja: "春のドロップ",
    ko: "봄 신상",
    es: "Edición primavera",
  },
  "wallet.reward.tea": {
    en: "Spring Tea Box",
    zh: "春茶禮盒",
    "zh-CN": "春茶礼盒",
    ja: "春の茶ボックス",
    ko: "봄 차 박스",
    es: "Caja de té de primavera",
  },
  "wallet.reward.blind": {
    en: "Blind Box: Fahy v3",
    zh: "盲盒：Fahy v3",
    "zh-CN": "盲盒：Fahy v3",
    ja: "ブラインドボックス：Fahy v3",
    ko: "블라인드 박스: Fahy v3",
    es: "Caja sorpresa: Fahy v3",
  },
  "wallet.reward.cam": {
    en: "Camellia Seedling",
    zh: "山茶幼苗",
    "zh-CN": "山茶幼苗",
    ja: "椿の苗",
    ko: "동백 묘목",
    es: "Plantón de camelia",
  },
  "wallet.reward.coaster": {
    en: "Indigo Coaster",
    zh: "藍染杯墊",
    "zh-CN": "蓝染杯垫",
    ja: "藍染めコースター",
    ko: "쪽빛 컵받침",
    es: "Posavasos índigo",
  },

  // Report
  "report.tag": {
    en: "Governance",
    zh: "社區治理",
    "zh-CN": "社区治理",
    ja: "ガバナンス",
    ko: "거버넌스",
    es: "Gobernanza",
  },
  "report.title": {
    en: "Eco-Debt Reporter",
    zh: "生態回報員",
    "zh-CN": "生态回报员",
    ja: "エコ債務レポーター",
    ko: "에코 부채 리포터",
    es: "Reportero Eco-Deuda",
  },
  "report.guide": {
    en: "One photo helps the whole neighborhood. You'll earn {coins} per verified report.",
    zh: "一張照片就能幫助整個社區。每則驗證通過的回報可獲得 {coins}。",
    "zh-CN": "一张照片就能帮助整个社区。每则验证通过的回报可获得 {coins}。",
    ja: "1枚の写真が街全体を助けます。承認された通報ごとに {coins} を獲得できます。",
    ko: "사진 한 장이 동네 전체를 도와요. 승인된 신고마다 {coins} 을 받게 돼요.",
    es: "Una foto ayuda a todo el barrio. Ganarás {coins} por cada reporte verificado.",
  },
  "report.cta.title": {
    en: "Report & Restore",
    zh: "回報與修復",
    "zh-CN": "回报与修复",
    ja: "報告して直す",
    ko: "신고하고 복원하기",
    es: "Reportar y Restaurar",
  },
  "report.cta.sub": {
    en: "Snap, geo-tag, send to the community",
    zh: "拍照、定位、傳送給社區",
    "zh-CN": "拍照、定位、传送给社区",
    ja: "撮って、位置をつけて、コミュニティへ送信",
    ko: "찍고, 위치 태그하고, 커뮤니티로 전송",
    es: "Captura, geoetiqueta, envía a la comunidad",
  },
  "report.capture": {
    en: "Tap to capture",
    zh: "點擊拍照",
    "zh-CN": "点击拍照",
    ja: "タップして撮影",
    ko: "탭하여 촬영",
    es: "Toca para capturar",
  },
  "report.cat.trash": {
    en: "Trash",
    zh: "垃圾",
    "zh-CN": "垃圾",
    ja: "ゴミ",
    ko: "쓰레기",
    es: "Basura",
  },
  "report.cat.decay": {
    en: "Plant decay",
    zh: "植物枯萎",
    "zh-CN": "植物枯萎",
    ja: "植物の枯れ",
    ko: "식물 고사",
    es: "Decaimiento vegetal",
  },
  "report.cat.other": {
    en: "+ Other",
    zh: "+ 其他",
    "zh-CN": "+ 其他",
    ja: "+ その他",
    ko: "+ 기타",
    es: "+ Otro",
  },
  "report.recent": {
    en: "Recent in your block",
    zh: "您街區的最新通報",
    "zh-CN": "您街区的最新通报",
    ja: "あなたの街区の最新",
    ko: "내 동네 최근 신고",
    es: "Recientes en tu barrio",
  },
  "report.status.restored": {
    en: "Restored",
    zh: "已修復",
    "zh-CN": "已修复",
    ja: "修復済み",
    ko: "복원 완료",
    es: "Restaurado",
  },
  "report.status.review": {
    en: "In review",
    zh: "審核中",
    "zh-CN": "审核中",
    ja: "確認中",
    ko: "검토 중",
    es: "En revisión",
  },
  "report.where.heritage": {
    en: "Heritage Wall",
    zh: "歷史古牆",
    "zh-CN": "历史古墙",
    ja: "歴史的な壁",
    ko: "유산 벽",
    es: "Muro patrimonial",
  },
  "report.where.lane24": {
    en: "Lane 24 fern",
    zh: "24 巷蕨類",
    "zh-CN": "24 巷蕨类",
    ja: "24番路地のシダ",
    ko: "24번 골목 양치류",
    es: "Helecho del Callejón 24",
  },
  "report.where.west": {
    en: "West Alley",
    zh: "西巷",
    "zh-CN": "西巷",
    ja: "西の路地",
    ko: "서쪽 골목",
    es: "Callejón Oeste",
  },
  "report.sent": {
    en: "Sent to community",
    zh: "已送至社區",
    "zh-CN": "已送至社区",
    ja: "コミュニティへ送信しました",
    ko: "커뮤니티로 전송됨",
    es: "Enviado a la comunidad",
  },
  "report.added": {
    en: "{coins} added to your wallet.",
    zh: "{coins} 已加入您的錢包。",
    "zh-CN": "{coins} 已加入您的钱包。",
    ja: "{coins} がウォレットに追加されました。",
    ko: "{coins} 이 지갑에 추가되었어요.",
    es: "{coins} añadidos a tu cartera.",
  },

  // Settings
  "settings.tag": {
    en: "Preferences",
    zh: "偏好設定",
    "zh-CN": "偏好设定",
    ja: "環境設定",
    ko: "환경설정",
    es: "Preferencias",
  },
  "settings.title": {
    en: "Settings",
    zh: "設定",
    "zh-CN": "设置",
    ja: "設定",
    ko: "설정",
    es: "Ajustes",
  },
  "settings.language": {
    en: "Language",
    zh: "語言",
    "zh-CN": "语言",
    ja: "言語",
    ko: "언어",
    es: "Idioma",
  },
  "settings.preview": {
    en: "Currency preview",
    zh: "貨幣預覽",
    "zh-CN": "货币预览",
    ja: "通貨プレビュー",
    ko: "통화 미리보기",
    es: "Vista previa de moneda",
  },

  // Fahy guide messages (mascot)
  "fahy.label": {
    en: "Fahy",
    zh: "花仔",
    "zh-CN": "花仔",
    ja: "Fahy",
    ko: "Fahy",
    es: "Fahy",
  },
} as const;

export type DictKey = keyof typeof DICT;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  formatCoins: (n: number | string) => string;
  /** Backward-compatible 2-arg form: (en, zh). zh covers all Chinese variants unless overridden by tr(). */
  t: (en: string, zh: string) => string;
  /** Full-map translator: tr({ en: "...", ja: "...", ko: "...", es: "..." }) */
  tr: (map: TranslationMap) => string;
  /** Dictionary-key translator with optional {placeholder} substitution. */
  k: (key: DictKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

function isLang(v: string | null): v is Lang {
  return !!v && LANGUAGES.some((l) => l.code === v);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (isLang(saved)) {
        setLangState(saved);
        return;
      }
      // Auto-detect from navigator
      const nav = navigator.language || "en";
      if (nav.startsWith("zh-CN") || nav.startsWith("zh-Hans"))
        setLangState("zh-CN");
      else if (nav.startsWith("zh")) setLangState("zh");
      else if (nav.startsWith("ja")) setLangState("ja");
      else if (nav.startsWith("ko")) setLangState("ko");
      else if (nav.startsWith("es")) setLangState("es");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch {}
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  };

  const formatCoins = (n: number | string) => `${n} ${COIN_BY_LANG[lang]}`;

  const t = (en: string, zh: string) => {
    if (lang === "zh" || lang === "zh-CN") return zh;
    return en;
  };

  const tr = (map: TranslationMap) => {
    if (map[lang]) return map[lang]!;
    // Fallbacks: zh-CN → zh, any chinese → zh, otherwise en
    if (lang === "zh-CN" && map.zh) return map.zh;
    if (lang === "zh" && map["zh-CN"]) return map["zh-CN"]!;
    return map.en;
  };

  const k = (key: DictKey, vars?: Record<string, string | number>) => {
    const entry = DICT[key] as TranslationMap;
    let str = tr(entry);
    if (vars) {
      for (const [name, val] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${name}\\}`, "g"), String(val));
      }
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, formatCoins, t, tr, k }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
