"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CalculateSyncRateLogic1,
  GetSyncCommentLogic1,
  TRIVIA_QUESTIONS,
  type TriviaAnswer,
} from "@/features/play/trivia/TriviaLogic1";

type TriviaPhase = "setup" | "playerA" | "playerB" | "result";

export function usePlayTrivia01F() {
  const [playerA, setPlayerA] = useState("나");
  const [playerB, setPlayerB] = useState("친구");
  const [phase, setPhase] = useState<TriviaPhase>("setup");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answersA, setAnswersA] = useState<Record<string, TriviaAnswer>>({});
  const [answersB, setAnswersB] = useState<Record<string, TriviaAnswer>>({});

  const currentQuestion = TRIVIA_QUESTIONS[questionIndex] ?? null;

  const result = useMemo(
    () => CalculateSyncRateLogic1(answersA, answersB, TRIVIA_QUESTIONS),
    [answersA, answersB],
  );

  const syncComment = useMemo(
    () => GetSyncCommentLogic1(result.syncRate),
    [result.syncRate],
  );

  const HandleStart = useCallback(() => {
    setPhase("playerA");
    setQuestionIndex(0);
    setAnswersA({});
    setAnswersB({});
  }, []);

  const HandleAnswer = useCallback(
    (answer: TriviaAnswer) => {
      if (!currentQuestion) return;

      if (phase === "playerA") {
        setAnswersA((prev) => ({ ...prev, [currentQuestion.id]: answer }));
        setPhase("playerB");
        return;
      }

      if (phase === "playerB") {
        const nextAnswersB = { ...answersB, [currentQuestion.id]: answer };
        setAnswersB(nextAnswersB);

        const nextIndex = questionIndex + 1;
        if (nextIndex >= TRIVIA_QUESTIONS.length) {
          setPhase("result");
          return;
        }

        setQuestionIndex(nextIndex);
        setPhase("playerA");
      }
    },
    [answersB, currentQuestion, phase, questionIndex],
  );

  const HandleReset = useCallback(() => {
    setPhase("setup");
    setQuestionIndex(0);
    setAnswersA({});
    setAnswersB({});
  }, []);

  return {
    playerA,
    setPlayerA,
    playerB,
    setPlayerB,
    phase,
    questionIndex,
    currentQuestion,
    totalQuestions: TRIVIA_QUESTIONS.length,
    result,
    syncComment,
    answersA,
    answersB,
    HandleStart,
    HandleAnswer,
    HandleReset,
  };
}
