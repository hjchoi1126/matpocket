"use client";

import Link from "next/link";
import { Gamepad2, Sparkles } from "lucide-react";
import MainHeaderActions from "@/components/layout/MainHeaderActions";
import { PLAY_GAME_CARDS } from "@/features/play/PLAY_BASIC_01F";

export default function PLAY_BASIC_01() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-primary/5 via-white to-violet-50/40">
      <header className="shrink-0 border-b border-gray-100/80 bg-white/90 px-4 py-5 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-100 text-primary">
              <Gamepad2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Social Playground
              </p>
              <h1 className="text-lg font-bold text-gray-900">
                맛포켓 플레이그라운드 🎡
              </h1>
            </div>
          </div>
          <MainHeaderActions />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          단톡방에 공유하거나 술자리에서 바로 켜서 즐기는 맛집 소셜 게임
          오락실이에요.
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-4 pb-4">
          {PLAY_GAME_CARDS.map((game) => (
            <li key={game.id}>
              <article
                className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${game.accentClass}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm"
                      aria-hidden
                    >
                      {game.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-bold text-gray-900">
                        {game.title}
                      </h2>
                      <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link
                      href={game.href}
                      className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition-transform active:scale-95"
                    >
                      {game.ctaLabel}
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
