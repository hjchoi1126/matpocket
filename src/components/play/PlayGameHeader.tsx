import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PlayGameHeaderProps = {
  emoji: string;
  title: string;
  subtitle?: string;
};

export default function PlayGameHeader({
  emoji,
  title,
  subtitle,
}: PlayGameHeaderProps) {
  return (
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
      {subtitle && (
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{subtitle}</p>
      )}
    </header>
  );
}
