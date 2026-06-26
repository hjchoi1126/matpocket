"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  JoinSharedFolderLogic1,
  LoadSharedFolderByTokenLogic1,
} from "@/features/folders/SharedFolderLogic1";
import type { Folder } from "@/types/folder";

export function useSharedFolderJoin01F(inviteToken: string) {
  const router = useRouter();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void LoadSharedFolderByTokenLogic1(inviteToken).then((result) => {
      setFolder(result.folder ?? null);
      setErrorMessage(result.error ?? null);
      setIsLoading(false);
    });
  }, [inviteToken]);

  const HandleJoin = useCallback(async () => {
    setIsJoining(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const result = await JoinSharedFolderLogic1(inviteToken);
    setIsJoining(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    if (result.alreadyJoined) {
      setStatusMessage("이미 참여 중인 공동 폴더예요. 공유저장소로 이동합니다.");
    } else {
      setStatusMessage("공동 폴더에 참여했어요! 공유저장소로 이동합니다.");
    }

    setFolder(result.folder ?? null);

    window.setTimeout(() => {
      router.push(
        result.folder ? `/shared?folder=${result.folder.id}` : "/shared",
      );
    }, 900);
  }, [inviteToken, router]);

  return {
    folder,
    isLoading,
    isJoining,
    statusMessage,
    errorMessage,
    HandleJoin,
  };
}
