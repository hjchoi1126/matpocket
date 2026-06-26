"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pill, Search, X } from "lucide-react";
import {
  CURATION_MOOD_OPTIONS,
  CURATION_TASTE_OPTIONS,
  CURATION_WITH_OPTIONS,
  GetCurationShuffleMenusLogic1,
  RecommendCurationLogic1,
  type CurationMood,
  type CurationPrescription,
  type CurationSelection,
  type CurationTaste,
  type CurationWith,
} from "@/features/home/CurationLogic1";

type CurationModalProps = {
  isOpen: boolean;
  nickname: string;
  onClose: () => void;
};

type CurationStep = "form" | "shuffling" | "result";

export default function CurationModal({
  isOpen,
  nickname,
  onClose,
}: CurationModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<CurationStep>("form");
  const [mood, setMood] = useState<CurationMood | null>(null);
  const [withWho, setWithWho] = useState<CurationWith | null>(null);
  const [taste, setTaste] = useState<CurationTaste | null>(null);
  const [shuffleText, setShuffleText] = useState("");
  const [prescription, setPrescription] = useState<CurationPrescription | null>(
    null,
  );

  const isFormComplete = mood != null && withWho != null && taste != null;

  useEffect(() => {
    if (!isOpen) {
      setStep("form");
      setMood(null);
      setWithWho(null);
      setTaste(null);
      setShuffleText("");
      setPrescription(null);
    }
  }, [isOpen]);

  const HandlePrescribe = () => {
    if (!isFormComplete || !mood || !withWho || !taste) return;

    const selection: CurationSelection = {
      mood,
      with: withWho,
      taste,
    };
    const result = RecommendCurationLogic1(selection);
    const shuffleMenus = GetCurationShuffleMenusLogic1();

    setStep("shuffling");
    setPrescription(null);

    let tick = 0;
    const maxTicks = 16;

    const intervalId = window.setInterval(() => {
      const randomMenu =
        shuffleMenus[tick % shuffleMenus.length] ?? shuffleMenus[0] ?? "맛집";
      setShuffleText(randomMenu);
      tick += 1;

      if (tick >= maxTicks) {
        window.clearInterval(intervalId);
        setShuffleText(result.menu);
        setPrescription(result);
        setStep("result");
      }
    }, 110);
  };

  const HandleSearchNearby = () => {
    if (!prescription) return;

    const params = new URLSearchParams({
      tab: "search",
      q: prescription.searchKeyword,
    });

    onClose();
    router.push(`/map?${params.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[min(90dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-lg font-bold text-gray-900">
              오늘의 미식 처방전 💊
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {step === "form" && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">
                오늘 기분과 상황을 골라주시면, 딱 맞는 메뉴를 처방해 드릴게요.
              </p>

              <ChipSection
                title="오늘의 기분 (Mood)"
                options={CURATION_MOOD_OPTIONS}
                selectedId={mood}
                onSelect={setMood}
              />
              <ChipSection
                title="식사 메이트 (With)"
                options={CURATION_WITH_OPTIONS}
                selectedId={withWho}
                onSelect={setWithWho}
              />
              <ChipSection
                title="지금 당기는 맛 (Taste)"
                options={CURATION_TASTE_OPTIONS}
                selectedId={taste}
                onSelect={setTaste}
              />

              <button
                type="button"
                disabled={!isFormComplete}
                onClick={HandlePrescribe}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                <Pill className="h-4 w-4" aria-hidden />
                처방전 받기
              </button>
            </div>
          )}

          {(step === "shuffling" || step === "result") && (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-orange-100 text-3xl">
                💊
              </div>

              <p className="mt-5 text-xs font-semibold tracking-wide text-primary uppercase">
                {step === "shuffling"
                  ? "처방전 작성 중..."
                  : `${nickname}님을 위한 오늘의 미식 처방전`}
              </p>

              <div
                className={`mt-4 rounded-2xl border px-4 py-8 ${
                  step === "shuffling"
                    ? "border-primary/20 bg-primary/5"
                    : "border-primary/30 bg-gradient-to-br from-primary/10 to-orange-50"
                }`}
              >
                <p
                  className={`text-2xl font-bold text-gray-900 ${
                    step === "shuffling" ? "animate-pulse" : ""
                  }`}
                >
                  {shuffleText || "..."}
                </p>
                {step === "result" && prescription && (
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">
                    {prescription.comment}
                  </p>
                )}
              </div>

              {step === "shuffling" && (
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  오늘의 메뉴를 고르는 중...
                </p>
              )}

              {step === "result" && prescription && (
                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    onClick={HandleSearchNearby}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
                  >
                    <Search className="h-4 w-4" aria-hidden />
                    가까운 이 메뉴 맛집 검색하기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setPrescription(null);
                    }}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600"
                  >
                    다시 처방받기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type ChipOption<T extends string> = {
  id: T;
  label: string;
};

function ChipSection<T extends string>({
  title,
  options,
  selectedId,
  onSelect,
}: {
  title: string;
  options: ChipOption<T>[];
  selectedId: T | null;
  onSelect: (id: T) => void;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold text-gray-700">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
