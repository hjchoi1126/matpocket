import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function ShareNotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <ChefHat className="mb-4 h-12 w-12 text-gray-200" aria-hidden />
      <h1 className="text-lg font-bold text-gray-900">
        공유 리스트를 찾을 수 없습니다
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        비공개이거나 삭제된 리스트일 수 있어요.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
      >
        맛포켓 홈으로
      </Link>
    </div>
  );
}
