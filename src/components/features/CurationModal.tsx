"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Loader2,
  Pill,
  Search,
  Sparkles,
  Users,
  Utensils,
  X,
} from "lucide-react";
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

  const selectedCount = [mood, withWho, taste].filter(Boolean).length;
  const isFormComplete = selectedCount === 3;

  const selectedLabels = useMemo(() => {
    return {
      mood: CURATION_MOOD_OPTIONS.find((item) => item.id === mood)?.label,
      with: CURATION_WITH_OPTIONS.find((item) => item.id === withWho)?.label,
      taste: CURATION_TASTE_OPTIONS.find((item) => item.id === taste)?.label,
    };
  }, [mood, taste, withWho]);

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
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="flex max-h-[min(92dvh,760px)] w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-white/60">
        <div className="relative shrink-0 overflow-hidden px-5 pb-5 pt-5">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-100 via-violet-50 to-amber-50"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/50 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-6 left-8 h-20 w-20 rounded-full bg-primary/10 blur-2xl"
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-primary shadow-sm ring-1 ring-white">
                <Pill className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-600">
                  Matpocket Rx
                </p>
                <h2 className="text-lg font-bold text-gray-900">
                  오늘의 미식 처방전
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  기분 · 메이트 · 맛을 고르면 딱 맞는 메뉴를 처방해 드려요.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/80 p-1.5 text-gray-500 shadow-sm ring-1 ring-white hover:bg-white"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {step === "form" && (
            <div className="relative mt-4">
              <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-gray-600">
                <span>선택 진행률</span>
                <span className="text-violet-700">{selectedCount}/3</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/70 ring-1 ring-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${(selectedCount / 3) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-white to-rose-50/30 px-4 py-4 sm:px-5">
          {step === "form" && (
            <div className="space-y-4 pb-2">
              <ChipSection
                title="오늘의 기분"
                subtitle="지금 마음은 어떤가요?"
                icon={Heart}
                accent="rose"
                options={CURATION_MOOD_OPTIONS}
                selectedId={mood}
                onSelect={setMood}
              />
              <ChipSection
                title="식사 메이트"
                subtitle="누구와 함께 먹나요?"
                icon={Users}
                accent="violet"
                options={CURATION_WITH_OPTIONS}
                selectedId={withWho}
                onSelect={setWithWho}
              />
              <ChipSection
                title="지금 당기는 맛"
                subtitle="입맛이 가는 방향은?"
                icon={Utensils}
                accent="amber"
                options={CURATION_TASTE_OPTIONS}
                selectedId={taste}
                onSelect={setTaste}
              />

              {selectedCount > 0 && (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-white/80 px-3 py-3">
                  <p className="mb-2 text-[11px] font-semibold text-violet-700">
                    나의 선택 요약
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLabels.mood && (
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 ring-1 ring-rose-100">
                        {selectedLabels.mood}
                      </span>
                    )}
                    {selectedLabels.with && (
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-100">
                        {selectedLabels.with}
                      </span>
                    )}
                    {selectedLabels.taste && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-100">
                        {selectedLabels.taste}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!isFormComplete}
                onClick={HandlePrescribe}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gray-900 via-violet-950 to-gray-900 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/10 transition-transform active:scale-[0.99] disabled:opacity-45"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                처방전 받기
              </button>
            </div>
          )}

          {(step === "shuffling" || step === "result") && (
            <div className="pb-2 pt-1 text-center">
              <div className="relative mx-auto w-full max-w-sm">
                <div
                  className="absolute -left-2 top-8 h-16 w-16 rounded-full bg-rose-200/40 blur-2xl"
                  aria-hidden
                />
                <div
                  className="absolute -right-2 bottom-10 h-16 w-16 rounded-full bg-violet-200/40 blur-2xl"
                  aria-hidden
                />

                <div className="relative overflow-hidden rounded-[24px] border border-violet-100 bg-white shadow-lg">
                  <div className="border-b border-dashed border-violet-100 bg-gradient-to-r from-violet-50 via-white to-rose-50 px-5 py-4 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">
                      {step === "shuffling" ? "Prescribing" : "Prescription"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {step === "shuffling"
                        ? "오늘의 메뉴를 고르는 중..."
                        : `${nickname}님을 위한 처방`}
                    </p>
                  </div>

                  <div className="px-5 py-8">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-100 text-2xl shadow-inner">
                      💊
                    </div>

                    <p
                      className={`text-2xl font-bold tracking-tight text-gray-900 ${
                        step === "shuffling" ? "animate-pulse" : ""
                      }`}
                    >
                      {shuffleText || "..."}
                    </p>

                    {step === "result" && prescription && (
                      <p className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-600">
                        {prescription.comment}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-dashed border-violet-100 px-5 py-3 text-left">
                    <p className="text-[10px] text-gray-400">
                      Matpocket Gourmet Clinic
                    </p>
                  </div>
                </div>
              </div>

              {step === "shuffling" && (
                <p className="mt-5 inline-flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-500" aria-hidden />
                  처방전 작성 중...
                </p>
              )}

              {step === "result" && prescription && (
                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    onClick={HandleSearchNearby}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3.5 text-sm font-semibold text-white shadow-md"
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
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600"
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

type ChipAccent = "rose" | "violet" | "amber";

const CHIP_ACCENT_STYLES: Record<
  ChipAccent,
  { card: string; icon: string; selected: string; idle: string }
> = {
  rose: {
    card: "border-rose-100 bg-gradient-to-br from-rose-50/80 to-white",
    icon: "bg-rose-100 text-rose-600",
    selected:
      "bg-rose-500 text-white shadow-md shadow-rose-200 ring-2 ring-rose-200",
    idle: "bg-white text-gray-700 ring-1 ring-rose-100 hover:bg-rose-50 hover:ring-rose-200",
  },
  violet: {
    card: "border-violet-100 bg-gradient-to-br from-violet-50/80 to-white",
    icon: "bg-violet-100 text-violet-600",
    selected:
      "bg-violet-600 text-white shadow-md shadow-violet-200 ring-2 ring-violet-200",
    idle: "bg-white text-gray-700 ring-1 ring-violet-100 hover:bg-violet-50 hover:ring-violet-200",
  },
  amber: {
    card: "border-amber-100 bg-gradient-to-br from-amber-50/80 to-white",
    icon: "bg-amber-100 text-amber-700",
    selected:
      "bg-amber-500 text-white shadow-md shadow-amber-200 ring-2 ring-amber-200",
    idle: "bg-white text-gray-700 ring-1 ring-amber-100 hover:bg-amber-50 hover:ring-amber-200",
  },
};

function ChipSection<T extends string>({
  title,
  subtitle,
  icon: Icon,
  accent,
  options,
  selectedId,
  onSelect,
}: {
  title: string;
  subtitle: string;
  icon: typeof Heart;
  accent: ChipAccent;
  options: ChipOption<T>[];
  selectedId: T | null;
  onSelect: (id: T) => void;
}) {
  const styles = CHIP_ACCENT_STYLES[accent];

  return (
    <section className={`rounded-2xl border p-3.5 shadow-sm ${styles.card}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="text-[11px] text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = selectedId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 sm:px-3 sm:py-2 sm:text-xs ${
                isSelected ? styles.selected : styles.idle
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
