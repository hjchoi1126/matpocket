"use client";

import { useEffect, useState } from "react";
import { Copy, Link2, Share2, UserRound } from "lucide-react";
import MainHeaderActions from "@/components/layout/MainHeaderActions";
import {
  BuildShareUrlLogic1,
  CopyShareLinkLogic1,
  PublishShareListLogic1,
  UnpublishShareListLogic1,
} from "@/features/share/ShareLogic1";
import { GetLocalNickname, SetLocalNickname } from "@/lib/nickname";
import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalUserId } from "@/lib/userId";

export default function SettingsPage() {
  const [nickname, setNickname] = useState("맛집러");
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNickname(GetLocalNickname());
    setShareUrl(BuildShareUrlLogic1());

    async function LoadShareProfile() {
      try {
        const supabase = CreateSupabaseClient();
        const { data } = await supabase
          .from("share_profiles")
          .select("is_list_public, display_name")
          .eq("user_id", GetLocalUserId())
          .maybeSingle();

        if (data?.display_name) {
          setNickname(data.display_name);
        }
        setIsPublic(Boolean(data?.is_list_public));
      } catch {
        // 프로필이 없으면 비공개 상태 유지
      }
    }

    void LoadShareProfile();
  }, []);

  const HandleSaveNickname = async () => {
    SetLocalNickname(nickname);
    setStatusMessage("닉네임이 저장되었습니다.");
  };

  const HandleToggleShare = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    if (isPublic) {
      const result = await UnpublishShareListLogic1();
      setIsSaving(false);

      if (result.error) {
        setStatusMessage(result.error);
        return;
      }

      setIsPublic(false);
      setStatusMessage("리스트 공유를 해제했습니다.");
      return;
    }

    SetLocalNickname(nickname);
    const result = await PublishShareListLogic1();
    setIsSaving(false);

    if (result.error) {
      setStatusMessage(result.error);
      return;
    }

    setIsPublic(true);
    setShareUrl(result.shareUrl ?? BuildShareUrlLogic1());
    setStatusMessage("리스트가 공개되었습니다. 링크를 공유해 보세요.");
  };

  const HandleCopyShareLink = async () => {
    const result = await CopyShareLinkLogic1(shareUrl);
    setStatusMessage(result.error ?? "공유 링크가 복사되었습니다.");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-gray-900">설정</h1>
          <MainHeaderActions />
        </div>
      </header>

      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <UserRound className="h-4 w-4 text-primary" aria-hidden />
            프로필
          </h2>
          <label className="mt-3 block text-xs font-medium text-gray-500">
            공유 리스트에 표시될 닉네임
          </label>
          <div className="mt-2 flex gap-2">
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
            />
            <button
              type="button"
              onClick={() => void HandleSaveNickname()}
              className="rounded-xl bg-gray-900 px-3 py-2.5 text-xs font-semibold text-white"
            >
              저장
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Share2 className="h-4 w-4 text-primary" aria-hidden />
            맛집 리스트 공유
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            공개하면 게스트도 `/share/내ID` 링크로 맛집 리스트를 볼 수 있어요.
          </p>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => void HandleToggleShare()}
            className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold ${
              isPublic
                ? "border border-gray-200 bg-white text-gray-700"
                : "bg-primary text-white"
            }`}
          >
            {isSaving
              ? "처리 중..."
              : isPublic
                ? "리스트 공유 해제"
                : "내 맛집 리스트 공개하기"}
          </button>

          {isPublic && (
            <div className="mt-3 rounded-xl bg-gray-50 p-3">
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <Link2 className="h-3.5 w-3.5" aria-hidden />
                공유 링크
              </p>
              <p className="mt-1 break-all text-xs text-gray-700">{shareUrl}</p>
              <button
                type="button"
                onClick={() => void HandleCopyShareLink()}
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden />
                링크 복사
              </button>
            </div>
          )}
        </section>

        {statusMessage && (
          <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
            {statusMessage}
          </p>
        )}
      </main>
    </div>
  );
}
