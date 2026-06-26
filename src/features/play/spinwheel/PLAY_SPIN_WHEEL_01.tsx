"use client";

import { Loader2, Plus, X } from "lucide-react";
import PlayGameHeader from "@/components/play/PlayGameHeader";
import { usePlaySpinWheel01F } from "@/features/play/spinwheel/PLAY_SPIN_WHEEL_01F";
import { GetSpinWheelColorLogic1 } from "@/features/play/spinwheel/SpinWheelLogic1";

function BuildWheelSegmentPath(
  index: number,
  total: number,
  radius: number,
): string {
  const sliceAngle = (2 * Math.PI) / total;
  const startAngle = index * sliceAngle - Math.PI / 2;
  const endAngle = startAngle + sliceAngle;
  const x1 = radius + radius * Math.cos(startAngle);
  const y1 = radius + radius * Math.sin(startAngle);
  const x2 = radius + radius * Math.cos(endAngle);
  const y2 = radius + radius * Math.sin(endAngle);
  const largeArc = sliceAngle > Math.PI ? 1 : 0;

  return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export default function PLAY_SPIN_WHEEL_01() {
  const {
    items,
    newItem,
    setNewItem,
    rotation,
    isSpinning,
    winner,
    statusMessage,
    UpdateItem,
    RemoveItem,
    AddItem,
    HandleSpin,
  } = usePlaySpinWheel01F();

  const activeItems = items.map((item) => item.trim()).filter(Boolean);
  const wheelSize = 280;
  const radius = wheelSize / 2;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-amber-50/40">
      <PlayGameHeader
        emoji="🎡"
        title="돌려돌려돌림판"
        subtitle="항목을 자유롭게 넣고 돌림판을 돌려 당첨 결과를 확인해 보세요."
      />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-gray-900">
            돌림판 항목
          </p>
          <p className="mb-3 text-xs text-gray-500">
            항목을 수정·추가·삭제할 수 있어요. (최소 2개, 최대 12개)
          </p>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={`wheel-item-${index}`} className="flex gap-2">
                <span
                  className="mt-2.5 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: GetSpinWheelColorLogic1(index) }}
                  aria-hidden
                />
                <input
                  value={item}
                  disabled={isSpinning}
                  onChange={(event) => UpdateItem(index, event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={isSpinning || items.length <= 2}
                  onClick={() => RemoveItem(index)}
                  aria-label={`${item} 삭제`}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-gray-500 disabled:opacity-40"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              value={newItem}
              disabled={isSpinning}
              onChange={(event) => setNewItem(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  AddItem();
                }
              }}
              placeholder="새 항목 추가 (예: 디저트 담당)"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white disabled:opacity-60"
            />
            <button
              type="button"
              disabled={isSpinning}
              onClick={AddItem}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              추가
            </button>
          </div>
        </section>

        <div className="relative mx-auto mt-6 flex w-full max-w-xs justify-center">
          <div
            className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1"
            aria-hidden
          >
            <div className="h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-gray-900" />
          </div>

          <div
            className="rounded-full bg-white p-2 shadow-lg ring-4 ring-amber-100"
            style={{
              width: wheelSize + 16,
              height: wheelSize + 16,
            }}
          >
            <svg
              width={wheelSize}
              height={wheelSize}
              viewBox={`0 0 ${wheelSize} ${wheelSize}`}
              className="block origin-center transition-transform duration-[4200ms] ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {activeItems.map((label, index) => {
                const sliceAngle = 360 / activeItems.length;
                const labelAngle = index * sliceAngle + sliceAngle / 2 - 90;
                const labelRadius = radius * 0.62;
                const labelX =
                  radius + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
                const labelY =
                  radius + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

                return (
                  <g key={`segment-${index}`}>
                    <path
                      d={BuildWheelSegmentPath(index, activeItems.length, radius)}
                      fill={GetSpinWheelColorLogic1(index)}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      fill="#ffffff"
                      fontSize={activeItems.length > 8 ? "9" : "11"}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${labelAngle + 90}, ${labelX}, ${labelY})`}
                    >
                      {label.length > 6 ? `${label.slice(0, 5)}…` : label}
                    </text>
                  </g>
                );
              })}
              <circle cx={radius} cy={radius} r="18" fill="#ffffff" />
              <circle cx={radius} cy={radius} r="12" fill="#F59E0B" />
            </svg>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-amber-600">
            {isSpinning ? "돌림판이 돌아가는 중..." : "당첨 결과"}
          </p>
          <p
            className={`mt-2 text-2xl font-bold text-gray-900 ${
              isSpinning ? "animate-pulse" : ""
            }`}
          >
            {winner || "돌림판을 돌려보세요"}
          </p>
        </div>

        {statusMessage && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {statusMessage}
          </p>
        )}

        <button
          type="button"
          disabled={isSpinning || activeItems.length < 2}
          onClick={HandleSpin}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSpinning ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <span aria-hidden>🎡</span>
          )}
          {isSpinning ? "돌리는 중..." : "돌림판 돌리기"}
        </button>
      </main>
    </div>
  );
}
