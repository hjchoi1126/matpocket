export type CurationMood = "excited" | "tired" | "stressed" | "lethargic";
export type CurationWith = "solo" | "friends" | "boss" | "family";
export type CurationTaste = "spicy" | "warm" | "sweet" | "light";

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
  { id: "tired" as const, label: "😮‍💨 지침/피곤" },
  { id: "stressed" as const, label: "😡 스트레스" },
  { id: "lethargic" as const, label: "🫠 무기력" },
];

export const CURATION_WITH_OPTIONS = [
  { id: "solo" as const, label: "👤 혼밥" },
  { id: "friends" as const, label: "👥 친구/동료" },
  { id: "boss" as const, label: "🧑‍💼 임원/회식" },
  { id: "family" as const, label: "🏠 가족" },
];

export const CURATION_TASTE_OPTIONS = [
  { id: "spicy" as const, label: "🌶️ 매콤" },
  { id: "warm" as const, label: "🍲 뜨끈/국물" },
  { id: "sweet" as const, label: "🍰 달달" },
  { id: "light" as const, label: "🌿 깔끔/헤비하지 않음" },
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
  ];
}
