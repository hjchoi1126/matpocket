"use client";

import { Heart } from "lucide-react";
import PlayGameHeader from "@/components/play/PlayGameHeader";
import { usePlayTrivia01F } from "@/features/play/trivia/PLAY_TRIVIA_01F";
import { TRIVIA_QUESTIONS } from "@/features/play/trivia/TriviaLogic1";

export default function PLAY_TRIVIA_01() {
  const {
    playerA,
    setPlayerA,
    playerB,
    setPlayerB,
    phase,
    questionIndex,
    currentQuestion,
    totalQuestions,
    result,
    syncComment,
    answersA,
    answersB,
    HandleStart,
    HandleAnswer,
    HandleReset,
  } = usePlayTrivia01F();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-violet-50/40">
      <PlayGameHeader
        emoji="🧩"
        title="미식 취향 싱크로율 테스트"
        subtitle="폰을 넘기며 두 사람의 취향 궁합을 확인해 보세요!"
      />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {phase === "setup" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                첫 번째 사람
              </label>
              <input
                value={playerA}
                onChange={(event) => setPlayerA(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
              <label className="mb-1 mt-3 block text-xs font-medium text-gray-500">
                두 번째 사람
              </label>
              <input
                value={playerB}
                onChange={(event) => setPlayerB(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>
            <p className="text-center text-xs text-gray-500">
              총 {totalQuestions}문항 · 탕수육부터 웨이팅 성향까지!
            </p>
            <button
              type="button"
              onClick={HandleStart}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
            >
              테스트 시작 🚀
            </button>
          </div>
        )}

        {(phase === "playerA" || phase === "playerB") && currentQuestion && (
          <div className="space-y-4">
            <p className="text-center text-xs font-semibold text-violet-600">
              {questionIndex + 1} / {totalQuestions} ·{" "}
              {phase === "playerA" ? playerA : playerB}님 차례
            </p>
            {phase === "playerB" && (
              <p className="rounded-xl bg-violet-100 px-3 py-2 text-center text-xs text-violet-800">
                폰을 {playerB}님에게 넘겨 주세요!
              </p>
            )}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-center text-base font-bold text-gray-900">
                {currentQuestion.question}
              </p>
              <div className="mt-5 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => HandleAnswer("a")}
                  className="rounded-xl border-2 border-gray-100 bg-gray-50 py-4 text-sm font-semibold text-gray-800 transition-colors hover:border-primary"
                >
                  {currentQuestion.optionA}
                </button>
                <button
                  type="button"
                  onClick={() => HandleAnswer("b")}
                  className="rounded-xl border-2 border-gray-100 bg-gray-50 py-4 text-sm font-semibold text-gray-800 transition-colors hover:border-primary"
                >
                  {currentQuestion.optionB}
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-violet-100 to-purple-50 p-6 text-center shadow-sm">
              <Heart className="mx-auto h-8 w-8 text-violet-500" aria-hidden />
              <p className="mt-3 text-xs font-semibold text-violet-700">
                {playerA} × {playerB} 싱크로율
              </p>
              <p className="mt-2 text-5xl font-bold text-gray-900">
                {result.syncRate}%
              </p>
              <p className="mt-3 text-sm text-gray-600">{syncComment}</p>
              <p className="mt-2 text-xs text-gray-500">
                {result.matchCount} / {result.total} 문항 일치
              </p>
            </div>

            <ul className="space-y-2">
              {TRIVIA_QUESTIONS.map((question) => {
                const match = answersA[question.id] === answersB[question.id];
                const pick =
                  answersA[question.id] === "a"
                    ? question.optionA
                    : question.optionB;

                return (
                  <li
                    key={question.id}
                    className="rounded-xl bg-white px-4 py-3 text-xs shadow-sm"
                  >
                    <p className="font-medium text-gray-900">{question.question}</p>
                    <p className="mt-1 text-gray-500">{pick}</p>
                    <p
                      className={`mt-1 font-semibold ${
                        match ? "text-green-600" : "text-rose-500"
                      }`}
                    >
                      {match ? "취향 일치 ✅" : "취향 불일치 ❌"}
                    </p>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={HandleReset}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
            >
              다시 테스트하기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
