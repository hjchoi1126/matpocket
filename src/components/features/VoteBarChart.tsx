"use client";

import type { VoteOption } from "@/types/vote";

type VoteBarChartProps = {
  options: VoteOption[];
  totalVotes: number;
  selectedOptionId?: number | null;
  onSelect?: (optionId: number) => void;
  disabled?: boolean;
};

export default function VoteBarChart({
  options,
  totalVotes,
  selectedOptionId,
  onSelect,
  disabled = false,
}: VoteBarChartProps) {
  const maxVotes = Math.max(...options.map((option) => option.vote_count), 1);

  return (
    <ul className="space-y-3">
      {options.map((option) => {
        const percentage =
          totalVotes > 0
            ? Math.round((option.vote_count / totalVotes) * 100)
            : 0;
        const barWidth = Math.max(
          (option.vote_count / maxVotes) * 100,
          option.vote_count > 0 ? 8 : 0,
        );
        const isSelected = selectedOptionId === option.id;

        return (
          <li key={option.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(option.id)}
              className={`w-full rounded-2xl border p-3 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-gray-100 bg-white hover:border-primary/30"
              } disabled:cursor-default disabled:opacity-80`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {option.place_name}
                  </p>
                  {option.place_address && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {option.place_address}
                    </p>
                  )}
                  {option.category && (
                    <p className="mt-1 text-[11px] text-gray-400">
                      {option.category}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-primary">
                    {option.vote_count}표
                  </p>
                  <p className="text-[11px] text-gray-400">{percentage}%</p>
                </div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
