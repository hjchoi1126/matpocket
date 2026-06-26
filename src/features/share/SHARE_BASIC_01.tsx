"use client";

import { useState } from "react";
import { ChefHat, Copy, MapPin, MessageCircle, Share2 } from "lucide-react";
import {
  CopyShareLinkLogic1,
  KakaoShareLogic1,
} from "@/features/share/ShareLogic1";
import type { Place } from "@/types/place";
import type { ShareProfile } from "@/features/share/ShareLogic1";

type SHARE_BASIC_01Props = {
  profile: ShareProfile;
  places: Place[];
  shareUrl: string;
};

export default function SHARE_BASIC_01({
  profile,
  places,
  shareUrl,
}: SHARE_BASIC_01Props) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const HandleCopyLink = async () => {
    const result = await CopyShareLinkLogic1(shareUrl);
    setStatusMessage(
      result.error ? result.error : "링크가 복사되었습니다.",
    );
  };

  const HandleKakaoShare = async () => {
    const result = await KakaoShareLogic1({
      title: `${profile.display_name}님의 맛포켓 리스트`,
      description: `저장 맛집 ${places.length}곳을 확인해 보세요.`,
      shareUrl,
    });

    setStatusMessage(
      result.error
        ? result.error
        : "공유 창을 열었거나 링크를 복사했습니다.",
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-primary/10 to-white">
      <header className="px-4 pt-8 pb-5">
        <div className="flex items-center gap-2 text-primary">
          <ChefHat className="h-5 w-5" aria-hidden />
          <span className="text-sm font-semibold">맛포켓</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {profile.display_name}님의 맛포켓 리스트
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          게스트도 로그인 없이 열람할 수 있는 공개 맛집 모음이에요.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => void HandleKakaoShare()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] px-3 py-3 text-xs font-semibold text-gray-900"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            카카오톡 공유하기
          </button>
          <button
            type="button"
            onClick={() => void HandleCopyLink()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs font-semibold text-gray-700"
          >
            <Copy className="h-4 w-4" aria-hidden />
            링크 복사
          </button>
        </div>

        {statusMessage && (
          <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs text-primary">
            {statusMessage}
          </p>
        )}
      </header>

      <main className="flex-1 px-4 pb-8">
        {places.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 py-16 text-center">
            <Share2 className="mx-auto mb-3 h-10 w-10 text-gray-200" aria-hidden />
            <p className="text-sm text-gray-500">공개된 맛집이 아직 없습니다.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {places.map((place) => (
              <li
                key={place.id}
                className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm"
              >
                <h2 className="font-semibold text-gray-900">{place.place_name}</h2>
                {place.category && (
                  <p className="mt-1 text-xs text-gray-400">{place.category}</p>
                )}
                {place.address && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {place.address}
                  </p>
                )}
                {place.memo && (
                  <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    {place.memo}
                  </p>
                )}
                {place.tags.length > 0 && (
                  <p className="mt-2 text-xs text-primary">{place.tags.join(" ")}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
