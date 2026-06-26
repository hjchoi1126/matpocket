"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, LogOut, Trash2, Users } from "lucide-react";
import {
  BuildFolderInviteUrlLogic1,
  DeleteSharedFolderLogic1,
  LeaveSharedFolderLogic1,
  LoadFolderMembersLogic1,
} from "@/features/folders/SharedFolderLogic1";
import type { Folder, FolderMember } from "@/types/folder";

type SharedFolderPanelProps = {
  folder: Folder;
  onChanged: () => void;
};

export default function SharedFolderPanel({
  folder,
  onChanged,
}: SharedFolderPanelProps) {
  const [members, setMembers] = useState<FolderMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = folder.role === "owner";

  const inviteUrl = folder.invite_token
    ? BuildFolderInviteUrlLogic1(folder.invite_token)
    : "";

  useEffect(() => {
    void LoadFolderMembersLogic1(folder.id).then((result) => {
      setMembers(result.members);
      setIsLoading(false);
    });
  }, [folder.id]);

  const HandleCopyInvite = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyMessage("초대 링크를 복사했어요!");
    } catch {
      setCopyMessage("링크 복사에 실패했습니다.");
    }
  };

  const HandleDeleteFolder = async () => {
    const confirmed = window.confirm(
      `"${folder.name}" 공동 폴더를 삭제할까요?\n폴더 안 맛집은 삭제되지 않고 미분류로 남습니다.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setActionError(null);
    setActionMessage(null);

    const result = await DeleteSharedFolderLogic1(folder.id);
    setIsDeleting(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setActionMessage("공동 폴더를 삭제했습니다.");
    onChanged();
  };

  const HandleLeaveFolder = async () => {
    const confirmed = window.confirm(
      `"${folder.name}" 공동 폴더에서 나갈까요?`,
    );

    if (!confirmed) return;

    setIsLeaving(true);
    setActionError(null);
    setActionMessage(null);

    const result = await LeaveSharedFolderLogic1(folder.id);
    setIsLeaving(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setActionMessage("공동 폴더에서 나갔습니다.");
    onChanged();
  };

  return (
    <section className="mb-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-violet-600" aria-hidden />
        <h2 className="text-sm font-semibold text-gray-900">공동 편집 폴더</h2>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">
        멤버가 같은 폴더에 맛집을 추가하고 수정할 수 있어요. 아래 링크를
        친구에게 보내 초대하세요.
      </p>

      {inviteUrl && isOwner && (
        <div className="mt-3 rounded-xl bg-white p-3">
          <p className="text-[11px] font-medium text-gray-500">초대 링크</p>
          <p className="mt-1 break-all text-xs text-gray-700">{inviteUrl}</p>
          <button
            type="button"
            onClick={() => void HandleCopyInvite()}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden />
            링크 복사
          </button>
        </div>
      )}

      <div className="mt-4">
        <p className="text-[11px] font-medium text-gray-500">참여 멤버</p>
        {isLoading ? (
          <div className="mt-2 flex justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-violet-500" aria-hidden />
          </div>
        ) : (
          <ul className="mt-2 space-y-2">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs"
              >
                <span className="font-medium text-gray-900">
                  {member.display_name}
                </span>
                <span className="text-gray-500">
                  {member.role === "owner" ? "방장" : "멤버"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {isOwner ? (
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => void HandleDeleteFolder()}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            )}
            폴더 삭제
          </button>
        ) : (
          <button
            type="button"
            disabled={isLeaving}
            onClick={() => void HandleLeaveFolder()}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 disabled:opacity-50"
          >
            {isLeaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <LogOut className="h-3.5 w-3.5" aria-hidden />
            )}
            폴더 나가기
          </button>
        )}
      </div>

      {copyMessage && (
        <p className="mt-3 text-xs font-medium text-violet-700">{copyMessage}</p>
      )}
      {actionMessage && (
        <p className="mt-3 text-xs font-medium text-violet-700">{actionMessage}</p>
      )}
      {actionError && (
        <p className="mt-3 text-xs font-medium text-red-600">{actionError}</p>
      )}
    </section>
  );
}
