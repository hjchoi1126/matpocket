import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

type PlayGamePlaceholder01Props = {
  emoji: string;
  title: string;
  description: string;
};

export default function PLAY_GAME_PLACEHOLDER_01({
  emoji,
  title,
  description,
}: PlayGamePlaceholder01Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <Link
          href="/play"
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          플레이그라운드
        </Link>
        <h1 className="text-lg font-bold text-gray-900">
          {emoji} {title}
        </h1>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm ring-1 ring-gray-100">
          {emoji}
        </div>
        <p className="mt-5 text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-500">
          {description}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
          <Construction className="h-4 w-4" aria-hidden />
          게임 콘텐츠 준비 중이에요
        </div>
        <Link
          href="/play"
          className="mt-8 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
        >
          플레이그라운드로 돌아가기
        </Link>
      </main>
    </div>
  );
}
