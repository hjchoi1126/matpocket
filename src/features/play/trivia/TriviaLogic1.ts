export type TriviaQuestion = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
};

export type TriviaAnswer = "a" | "b";

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: "tangsoo",
    question: "탕수육은?",
    optionA: "부먹 🍖",
    optionB: "찍먹 🥢",
  },
  {
    id: "waiting",
    question: "인기 맛집 웨이팅, 최대 몇 분까지 OK?",
    optionA: "30분 이내 ⏱️",
    optionB: "1시간도 OK 🔥",
  },
  {
    id: "spicy",
    question: "매운 음식 선호도는?",
    optionA: "맵찔이 🥛",
    optionB: "불닭도 OK 🌶️",
  },
  {
    id: "solo",
    question: "혼밥에 대한 생각은?",
    optionA: "완전 편함 👤",
    optionB: "누군가랑 먹고 싶음 👥",
  },
  {
    id: "dessert",
    question: "식사 후 디저트는?",
    optionA: "무조건 먹는다 🍰",
    optionB: "배불러서 패스 😌",
  },
  {
    id: "photo",
    question: "맛집 가면 사진은?",
    optionA: "먼저 인증샷 📸",
    optionB: "맛부터 봄 🍽️",
  },
];

export function CalculateSyncRateLogic1(
  answersA: Record<string, TriviaAnswer>,
  answersB: Record<string, TriviaAnswer>,
  questions: TriviaQuestion[],
): { syncRate: number; matchCount: number; total: number } {
  let matchCount = 0;

  questions.forEach((question) => {
    if (answersA[question.id] === answersB[question.id]) {
      matchCount += 1;
    }
  });

  const total = questions.length;
  const syncRate = total === 0 ? 0 : Math.round((matchCount / total) * 100);

  return { syncRate, matchCount, total };
}

export function GetSyncCommentLogic1(syncRate: number): string {
  if (syncRate >= 90) {
    return "천생연분 미식 케미! 오늘 메뉴 고를 때 싸울 일 없어요.";
  }
  if (syncRate >= 70) {
    return "꽤 잘 맞는 편! 서로 양보하면 완벽한 식사 메이트.";
  }
  if (syncRate >= 50) {
    return "반반 궁합! 메뉴는 가위바위보로 정해볼까요?";
  }
  return "취향이 확실히 다르네요. 오늘은 각자 먹고 싶은 걸 시키세요!";
}
