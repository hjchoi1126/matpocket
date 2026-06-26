export type CurationMood =
  | "excited"
  | "tired"
  | "stressed"
  | "lethargic"
  | "happy"
  | "sad"
  | "hungry"
  | "romantic"
  | "celebratory";
export type CurationWith =
  | "solo"
  | "friends"
  | "boss"
  | "family"
  | "couple"
  | "date"
  | "kids";
export type CurationTaste =
  | "spicy"
  | "warm"
  | "sweet"
  | "light"
  | "crispy"
  | "meaty"
  | "noodle"
  | "seafood"
  | "cheesy";

export type CurationSelection = {
  mood: CurationMood;
  with: CurationWith;
  taste: CurationTaste;
};

export type CurationPrescription = {
  menu: string;
  comment: string;
  searchKeyword: string;
};

export const CURATION_MOOD_OPTIONS = [
  { id: "excited" as const, label: "🥳 신남" },
  { id: "happy" as const, label: "😊 기분 좋음" },
  { id: "tired" as const, label: "😮‍💨 지침/피곤" },
  { id: "stressed" as const, label: "😡 스트레스" },
  { id: "sad" as const, label: "😢 우울/속상" },
  { id: "lethargic" as const, label: "🫠 무기력" },
  { id: "hungry" as const, label: "🤤 배고픔 폭발" },
  { id: "romantic" as const, label: "💕 설렘" },
  { id: "celebratory" as const, label: "🎊 축하/기념" },
];

export const CURATION_WITH_OPTIONS = [
  { id: "solo" as const, label: "👤 혼밥" },
  { id: "friends" as const, label: "👥 친구/동료" },
  { id: "couple" as const, label: "💑 연인/데이트" },
  { id: "date" as const, label: "💌 소개팅/썸" },
  { id: "family" as const, label: "🏠 가족" },
  { id: "kids" as const, label: "👶 아이 동반" },
  { id: "boss" as const, label: "🧑‍💼 임원/회식" },
];

export const CURATION_TASTE_OPTIONS = [
  { id: "spicy" as const, label: "🌶️ 매콤" },
  { id: "warm" as const, label: "🍲 뜨끈/국물" },
  { id: "sweet" as const, label: "🍰 달달" },
  { id: "light" as const, label: "🌿 깔끔/가벼움" },
  { id: "crispy" as const, label: "🍗 바삯/튀김" },
  { id: "meaty" as const, label: "🥩 고기듬뿍" },
  { id: "noodle" as const, label: "🍜 면요리" },
  { id: "seafood" as const, label: "🦐 해산물" },
  { id: "cheesy" as const, label: "🧀 치즈/진한맛" },
];

type PrescriptionRule = {
  match: (selection: CurationSelection) => boolean;
  prescriptions: CurationPrescription[];
};

const PRESCRIPTION_RULES: PrescriptionRule[] = [
  {
    match: (s) => s.mood === "stressed" && s.with === "solo" && s.taste === "spicy",
    prescriptions: [
      {
        menu: "매운 닭발",
        comment: "혼자 땀 뻘뻘 흘리며 스트레스 날려버리세요!",
        searchKeyword: "매운 닭발",
      },
      {
        menu: "엽기떡볶이",
        comment: "불맛에 화도 같이 날려버리는 혼밥 처방전입니다.",
        searchKeyword: "엽기떡볶이",
      },
    ],
  },
  {
    match: (s) => s.mood === "tired" && s.with === "friends" && s.taste === "warm",
    prescriptions: [
      {
        menu: "곱창전골",
        comment: "든든한 국물로 오늘 하루 보양할 때가 됐습니다.",
        searchKeyword: "곱창전골",
      },
      {
        menu: "삼계탕",
        comment: "친구들과 나눠 먹기 좋은 뜨끈한 보양식 처방!",
        searchKeyword: "삼계탕",
      },
    ],
  },
  {
    match: (s) => s.with === "boss" && s.taste === "light",
    prescriptions: [
      {
        menu: "일식 코스 요리",
        comment: "격식 있고 깔끔한 자리로 점수 따기 좋은 메뉴입니다.",
        searchKeyword: "일식 코스",
      },
      {
        menu: "한정식",
        comment: "무르지 않고 품격 있는 회식 자리에 딱 맞아요.",
        searchKeyword: "한정식",
      },
    ],
  },
  {
    match: (s) => s.mood === "excited" && s.taste === "spicy",
    prescriptions: [
      {
        menu: "마라탕",
        comment: "텐션 그대로 화끈하게 올려줄 마라의 매직!",
        searchKeyword: "마라탕",
      },
      {
        menu: "불닭발",
        comment: "신나는 기분엔 매운맛이 제격이죠!",
        searchKeyword: "불닭발",
      },
    ],
  },
  {
    match: (s) => s.mood === "excited" && s.taste === "sweet",
    prescriptions: [
      {
        menu: "츄러스 & 아이스크림",
        comment: "기분 좋은 날엔 달콤한 게 정답이에요!",
        searchKeyword: "디저트 카페",
      },
      {
        menu: "팥빙수",
        comment: "신남을 시원하고 달콤하게 밀어 넣어 드립니다.",
        searchKeyword: "팥빙수",
      },
    ],
  },
  {
    match: (s) => s.mood === "tired" && s.taste === "warm",
    prescriptions: [
      {
        menu: "설렁탕",
        comment: "지친 몸을 감싸주는 따뜻한 국물 한 그릇!",
        searchKeyword: "설렁탕",
      },
      {
        menu: "칼국수",
        comment: "피곤할 땐 면과 국물이 최고의 회복제예요.",
        searchKeyword: "칼국수",
      },
    ],
  },
  {
    match: (s) => s.mood === "lethargic" && s.taste === "spicy",
    prescriptions: [
      {
        menu: "라면 + 공기밥",
        comment: "무기력을 깨워줄 화끈한 자극, 가볍게 시작해 보세요!",
        searchKeyword: "라면 맛집",
      },
      {
        menu: "제육볶음",
        comment: "매콤한 기름기로 에너지 충전 처방전입니다.",
        searchKeyword: "제육볶음",
      },
    ],
  },
  {
    match: (s) => s.mood === "lethargic" && s.taste === "sweet",
    prescriptions: [
      {
        menu: "브런치 플레이트",
        comment: "달콤한 브런치로 느긋하게 기분 전환해 보세요.",
        searchKeyword: "브런치",
      },
      {
        menu: "마카롱 세트",
        comment: "작은 달콤함이 무기력을 살짝 깨워줄 거예요.",
        searchKeyword: "마카롱",
      },
    ],
  },
  {
    match: (s) => s.with === "solo" && s.taste === "warm",
    prescriptions: [
      {
        menu: "오뎅탕",
        comment: "혼자 먹기 좋은 따끈한 국물, 부담 없이 든든해요.",
        searchKeyword: "오뎅탕",
      },
      {
        menu: "순두부찌개",
        comment: "혼밥의 정석! 밥 한 공기는 기본이죠.",
        searchKeyword: "순두부찌개",
      },
    ],
  },
  {
    match: (s) => s.with === "solo" && s.taste === "light",
    prescriptions: [
      {
        menu: "초밥",
        comment: "혼자 조용히 즐기기 좋은 깔끔한 한 끼!",
        searchKeyword: "초밥",
      },
      {
        menu: "포케",
        comment: "가볍지만 든든한 혼밥 메뉴로 추천드려요.",
        searchKeyword: "포케",
      },
    ],
  },
  {
    match: (s) => s.with === "family" && s.taste === "warm",
    prescriptions: [
      {
        menu: "감자탕",
        comment: "가족과 나눠 먹기 좋은 든든한 국물 요리!",
        searchKeyword: "감자탕",
      },
      {
        menu: "부대찌개",
        comment: "온 가족이 모여 먹기 좋은 푸짐한 찌개 처방.",
        searchKeyword: "부대찌개",
      },
    ],
  },
  {
    match: (s) => s.with === "family" && s.taste === "light",
    prescriptions: [
      {
        menu: "백반 정식",
        comment: "온 가족이 편하게 즐기는 깔끔한 한 상!",
        searchKeyword: "백반",
      },
      {
        menu: "쌈밥",
        comment: "건강하고 담백하게 가족 식사하기 좋아요.",
        searchKeyword: "쌈밥",
      },
    ],
  },
  {
    match: (s) => s.with === "friends" && s.taste === "spicy",
    prescriptions: [
      {
        menu: "닭갈비",
        comment: "친구들과 셰어하기 좋은 화끈한 메뉴!",
        searchKeyword: "닭갈비",
      },
      {
        menu: "마라샹궈",
        comment: "매운맛 좋아하는 친구들과 가면 대박이에요.",
        searchKeyword: "마라샹궈",
      },
    ],
  },
  {
    match: (s) => s.with === "friends" && s.taste === "sweet",
    prescriptions: [
      {
        menu: "케이크 & 커피",
        comment: "수다 떨기 좋은 달콤한 카페 타임 처방!",
        searchKeyword: "케이크 카페",
      },
      {
        menu: "와플",
        comment: "친구들과 나눠 먹기 좋은 달콤한 디저트!",
        searchKeyword: "와플",
      },
    ],
  },
  {
    match: (s) => s.mood === "sad" && s.taste === "warm",
    prescriptions: [
      {
        menu: "콩나물국밥",
        comment: "속상한 마음을 따뜻한 국물로 감싸 주는 처방입니다.",
        searchKeyword: "콩나물국밥",
      },
      {
        menu: "육개장",
        comment: "얼큰한 국물로 오늘의 무거운 기분을 녹여 보세요.",
        searchKeyword: "육개장",
      },
    ],
  },
  {
    match: (s) => s.mood === "happy" && s.taste === "sweet",
    prescriptions: [
      {
        menu: "수플레 팬케이크",
        comment: "기분 좋은 날, 달콤함을 한껏 업그레이드!",
        searchKeyword: "팬케이크",
      },
      {
        menu: "티라미수",
        comment: "행복한 기분에 딱 맞는 달콤한 리워드 메뉴예요.",
        searchKeyword: "티라미수",
      },
    ],
  },
  {
    match: (s) => s.mood === "hungry" && s.taste === "meaty",
    prescriptions: [
      {
        menu: "삼겹살",
        comment: "배고픔 폭발엔 고기가 답! 오늘은 실컷 드세요.",
        searchKeyword: "삼겹살",
      },
      {
        menu: "양념갈비",
        comment: "허기진 날엔 푸짐한 고기 한 상이 최고예요.",
        searchKeyword: "양념갈비",
      },
    ],
  },
  {
    match: (s) => s.mood === "romantic" && s.with === "couple",
    prescriptions: [
      {
        menu: "파스타 & 와인",
        comment: "설레는 분위기에 어울리는 로맨틱 디너 처방!",
        searchKeyword: "파스타",
      },
      {
        menu: "스테이크",
        comment: "특별한 날, 둘만의 분위기를 살려 줄 메뉴예요.",
        searchKeyword: "스테이크",
      },
    ],
  },
  {
    match: (s) => s.mood === "celebratory" && s.with === "friends",
    prescriptions: [
      {
        menu: "보쌈 + 막걸리",
        comment: "축하할 일엔 푸짐하게! 분위기 띄우기 좋아요.",
        searchKeyword: "보쌈",
      },
      {
        menu: "족발",
        comment: "기념일엔 나눠 먹기 좋은 든든한 축하 메뉴!",
        searchKeyword: "족발",
      },
    ],
  },
  {
    match: (s) => s.with === "couple" && s.taste === "sweet",
    prescriptions: [
      {
        menu: "마카롱 & 티",
        comment: "달콤한 디저트 데이트로 분위기 살려 보세요.",
        searchKeyword: "마카롱",
      },
      {
        menu: "크로와상 샌드",
        comment: "연인과 가볍게 즐기기 좋은 달콤한 브런치!",
        searchKeyword: "브런치",
      },
    ],
  },
  {
    match: (s) => s.with === "date" && s.taste === "light",
    prescriptions: [
      {
        menu: "샤브샤브",
        comment: "부담 없이 대화하기 좋은 깔끔한 데이트 메뉴!",
        searchKeyword: "샤브샤브",
      },
      {
        menu: "연어 덮밥",
        comment: "첫 만남에도 실패 없는 담백한 한 끼예요.",
        searchKeyword: "연어덮밥",
      },
    ],
  },
  {
    match: (s) => s.with === "kids" && s.taste === "crispy",
    prescriptions: [
      {
        menu: "돈까스",
        comment: "아이도 어른도 좋아하는 바삯한 국민 메뉴!",
        searchKeyword: "돈까스",
      },
      {
        menu: "치킨",
        comment: "아이 동반 식사에 실패 없는 바삯한 선택!",
        searchKeyword: "치킨",
      },
    ],
  },
  {
    match: (s) => s.with === "kids" && s.taste === "warm",
    prescriptions: [
      {
        menu: "우동",
        comment: "아이 입맛에도 부드럽고 따뜻한 메뉴예요.",
        searchKeyword: "우동",
      },
      {
        menu: "순두부찌개",
        comment: "맵지 않게 즐기기 좋은 가족 외식 메뉴!",
        searchKeyword: "순두부찌개",
      },
    ],
  },
  {
    match: (s) => s.taste === "crispy",
    prescriptions: [
      {
        menu: "치킨",
        comment: "바삯한 식감이 땡길 땐 역시 이거죠!",
        searchKeyword: "치킨",
      },
      {
        menu: "튀김 정식",
        comment: "튀김 옷에 행복이 바삭하게 튀겨져 있어요.",
        searchKeyword: "튀김",
      },
    ],
  },
  {
    match: (s) => s.taste === "meaty",
    prescriptions: [
      {
        menu: "소고기 구이",
        comment: "고기 듬뿍! 오늘은 단백질로 충전하세요.",
        searchKeyword: "소고기 구이",
      },
      {
        menu: "수육",
        comment: "푸짐한 고기 한 점이 주는 만족감, 최고예요.",
        searchKeyword: "수육",
      },
    ],
  },
  {
    match: (s) => s.taste === "noodle",
    prescriptions: [
      {
        menu: "라멘",
        comment: "면 요리가 당길 땐 진한 국물 라멘이 정답!",
        searchKeyword: "라멘",
      },
      {
        menu: "짜장면",
        comment: "면 + 소스의 조합, 실패 없는 클래식이에요.",
        searchKeyword: "짜장면",
      },
    ],
  },
  {
    match: (s) => s.taste === "seafood",
    prescriptions: [
      {
        menu: "회",
        comment: "싱싱한 해산물로 오늘 기분 전환해 보세요!",
        searchKeyword: "회",
      },
      {
        menu: "해물탕",
        comment: "바다 향 가득, 해산물이 땡기는 날의 처방!",
        searchKeyword: "해물탕",
      },
    ],
  },
  {
    match: (s) => s.taste === "cheesy",
    prescriptions: [
      {
        menu: "치즈 피자",
        comment: "치즈 늘어나는 순간, 기분도 같이 올라가요!",
        searchKeyword: "피자",
      },
      {
        menu: "까보나라",
        comment: "진한 치즈 풍미로 만족감 충전 처방!",
        searchKeyword: "까보나라",
      },
    ],
  },
  {
    match: (s) => s.mood === "romantic",
    prescriptions: [
      {
        menu: "리조또",
        comment: "은은한 분위기에 어울리는 부드러운 한 끼!",
        searchKeyword: "리조또",
      },
    ],
  },
  {
    match: (s) => s.mood === "celebratory",
    prescriptions: [
      {
        menu: "랍스터 요리",
        comment: "축하할 날엔 평소보다 한 단계 위의 메뉴로!",
        searchKeyword: "랍스터",
      },
    ],
  },
  {
    match: (s) => s.mood === "hungry",
    prescriptions: [
      {
        menu: "뷔페",
        comment: "배고픔 폭발엔 다양하게 즐길 수 있는 뷔페!",
        searchKeyword: "뷔페",
      },
    ],
  },
  {
    match: (s) => s.mood === "sad",
    prescriptions: [
      {
        menu: "카레",
        comment: "든든하게 먹으며 오늘을 조금 더 편하게 보내요.",
        searchKeyword: "카레",
      },
    ],
  },
  {
    match: (s) => s.mood === "happy",
    prescriptions: [
      {
        menu: "타코",
        comment: "기분 좋은 날, 색다른 맛으로 기분 더 업!",
        searchKeyword: "타코",
      },
    ],
  },
  {
    match: (s) => s.with === "couple",
    prescriptions: [
      {
        menu: "이탈리안",
        comment: "둘이 함께 즐기기 좋은 데이트 코스 메뉴!",
        searchKeyword: "이탈리안",
      },
    ],
  },
  {
    match: (s) => s.with === "date",
    prescriptions: [
      {
        menu: "분위기 좋은 카페 브런치",
        comment: "부담 없이 대화하기 좋은 데이트 메뉴예요.",
        searchKeyword: "브런치 카페",
      },
    ],
  },
  {
    match: (s) => s.with === "kids",
    prescriptions: [
      {
        menu: "떡볶이 + 튀김",
        comment: "아이와 함께 즐기기 좋은 편한 메뉴!",
        searchKeyword: "떡볶이",
      },
    ],
  },
  {
    match: (s) => s.taste === "spicy",
    prescriptions: [
      {
        menu: "떡볶이",
        comment: "매콤한 유혹, 오늘은 이걸로 결정!",
        searchKeyword: "떡볶이",
      },
    ],
  },
  {
    match: (s) => s.taste === "warm",
    prescriptions: [
      {
        menu: "국밥",
        comment: "뜨끈한 국물이 주는 위로, 오늘의 처방입니다.",
        searchKeyword: "국밥",
      },
    ],
  },
  {
    match: (s) => s.taste === "sweet",
    prescriptions: [
      {
        menu: "크로플",
        comment: "달콤함이 필요한 날, 이걸로 충전하세요!",
        searchKeyword: "크로플",
      },
    ],
  },
  {
    match: (s) => s.taste === "light",
    prescriptions: [
      {
        menu: "샐러드 보울",
        comment: "가볍지만 만족스러운 깔끔한 한 끼!",
        searchKeyword: "샐러드",
      },
    ],
  },
];

const FALLBACK_PRESCRIPTIONS: CurationPrescription[] = [
  {
    menu: "김치찌개",
    comment: "어떤 날이든 실패 없는 맛포켓 기본 처방전!",
    searchKeyword: "김치찌개",
  },
  {
    menu: "비빔밥",
    comment: "고민이 길수록 단순하게, 비비면 답이 나와요.",
    searchKeyword: "비빔밥",
  },
];

export function BuildCurationKeyLogic1(selection: CurationSelection): string {
  return `${selection.mood}-${selection.with}-${selection.taste}`;
}

export function RecommendCurationLogic1(
  selection: CurationSelection,
): CurationPrescription {
  for (const rule of PRESCRIPTION_RULES) {
    if (rule.match(selection)) {
      const index = Math.floor(Math.random() * rule.prescriptions.length);
      return rule.prescriptions[index]!;
    }
  }

  const fallbackIndex = Math.floor(Math.random() * FALLBACK_PRESCRIPTIONS.length);
  return FALLBACK_PRESCRIPTIONS[fallbackIndex]!;
}

export function GetCurationShuffleMenusLogic1(): string[] {
  return [
    "마라탕",
    "초밥",
    "닭발",
    "삼계탕",
    "파스타",
    "떡볶이",
    "곱창전골",
    "브런치",
    "포케",
    "칼국수",
    "일식 코스",
    "크로플",
    "삼겹살",
    "돈까스",
    "라멘",
    "해물탕",
    "피자",
    "짜장면",
    "스테이크",
    "회",
  ];
}
