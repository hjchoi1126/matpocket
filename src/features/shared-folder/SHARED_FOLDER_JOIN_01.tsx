"use client";

import Link from "next/link";
import { Loader2, Users } from "lucide-react";
import { useSharedFolderJoin01F } from "@/features/shared-folder/SHARED_FOLDER_JOIN_01F";

type SharedFolderJoin01Props = {
  inviteToken: string;
};

export default function SHARED_FOLDER_JOIN_01({
  inviteToken,
}: SharedFolderJoin01Props) {
  const {
    folder,
    isLoading,
    isJoining,
    statusMessage,
    errorMessage,
    HandleJoin,
  } = useSharedFolderJoin01F(inviteToken);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">공동 폴더 초대</h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        {isLoading ? (
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
        ) : folder ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Users className="h-8 w-8" aria-hidden />
            </div>
            <p className="mt-5 text-sm font-semibold text-gray-900">
              {folder.name}
            </p>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-500">
              이 폴더에 참여하면 친구와 함께 맛집을 추가하고 수정할 수 있어요.
            </p>
            <button
              type="button"
              disabled={isJoining}
              onClick={() => void HandleJoin()}
              className="mt-6 w-full max-w-xs rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isJoining ? "참여 중..." : "공동 폴더 참여하기"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              {errorMessage ?? "초대 링크를 확인할 수 없습니다."}
            </p>
            <Link
              href="/shared"
              className="mt-6 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700"
            >
              공유저장소로 돌아가기
            </Link>
          </>
        )}

        {statusMessage && (
          <p className="mt-4 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
            {statusMessage}
          </p>
        )}

        {errorMessage && folder && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </main>
    </div>
  );
}
