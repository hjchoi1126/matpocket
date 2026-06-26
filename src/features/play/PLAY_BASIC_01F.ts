export type PlayGameCard = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  accentClass: string;
};

export const PLAY_GAME_CARDS: PlayGameCard[] = [
  {
    id: "ladder",
    emoji: "🪜",
    title: "사다리 타기",
    description:
      "참가자와 결과 항목을 정한 뒤, 사다리타기로 당첨자를 뽑는 복불복 게임",
    href: "/play/ladder",
    ctaLabel: "시작하기 🎲",
    accentClass: "from-sky-50 to-cyan-50 ring-sky-100",
  },
  {
    id: "spinwheel",
    emoji: "🎡",
    title: "돌려돌려 돌림판",
    description:
      "항목을 직접 넣고 돌림판을 돌려 오늘의 당첨자·벌칙·면제를 뽑는 게임",
    href: "/play/spinwheel",
    ctaLabel: "시작하기 🎲",
    accentClass: "from-amber-50 to-yellow-50 ring-amber-100",
  },
  {
    id: "roulette",
    emoji: "💣",
    title: "밥값 독박 폭탄 룰렛",
    description:
      "오늘 점심값 독박 투커, 혹은 2차 쏠 사람을 정하는 짜릿한 복불복 게임!",
    href: "/play/roulette",
    ctaLabel: "시작하기 🎲",
    accentClass: "from-rose-50 to-red-50 ring-rose-100",
  },
  {
    id: "worldcup",
    emoji: "🏆",
    title: "장소 월드컵 (토너먼트)",
    description:
      "내가 저장한 후보지들로 토너먼트를 열어 팀원들의 진짜 표심을 확인하세요!",
    href: "/play/worldcup",
    ctaLabel: "방 개설하기 🚀",
    accentClass: "from-amber-50 to-orange-50 ring-amber-100",
  },
  {
    id: "trivia",
    emoji: "🧩",
    title: "미식 취향 싱크로율 테스트",
    description:
      "오늘 만난 사람과 탕수육 부먹/찍먹부터 웨이팅 성향까지 궁합을 맞춰보세요!",
    href: "/play/trivia",
    ctaLabel: "방 개설하기 🚀",
    accentClass: "from-violet-50 to-purple-50 ring-violet-100",
  },
];
