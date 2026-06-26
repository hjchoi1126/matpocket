import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalUserId } from "@/lib/userId";
import { GetMemberFolderIdsLogic1 } from "@/features/folders/SharedFolderLogic1";
import type { Folder } from "@/types/folder";

function NormalizeFolderRow(
  folder: Folder,
  role?: Folder["role"],
): Folder {
  return {
    ...folder,
    is_shared: Boolean(folder.is_shared),
    invite_token: folder.invite_token ?? null,
    role,
  };
}

export async function LoadFoldersLogic1(): Promise<{
  folders: Folder[];
  error?: string;
}> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();

    if (!userId) {
      return { folders: [] };
    }

    const [ownedResult, membershipsResult, memberFolderIds] = await Promise.all([
      supabase
        .from("folders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("folder_members")
        .select("folder_id, role")
        .eq("user_id", userId),
      GetMemberFolderIdsLogic1(userId),
    ]);

    if (ownedResult.error) {
      return { folders: [], error: "폴더 목록을 불러오지 못했습니다." };
    }

    const roleMap = new Map<number, Folder["role"]>(
      (membershipsResult.data ?? []).map((row) => [
        row.folder_id as number,
        row.role as Folder["role"],
      ]),
    );

    const folderMap = new Map<number, Folder>();

    (ownedResult.data ?? []).forEach((folder) => {
      const normalized = folder as Folder;
      folderMap.set(
        normalized.id,
        NormalizeFolderRow(
          normalized,
          normalized.is_shared ? (roleMap.get(normalized.id) ?? "owner") : undefined,
        ),
      );
    });

    const joinedOnlyIds = memberFolderIds.filter((folderId) => !folderMap.has(folderId));

    if (joinedOnlyIds.length > 0) {
      const { data: joinedFolders, error: joinedError } = await supabase
        .from("folders")
        .select("*")
        .in("id", joinedOnlyIds)
        .order("created_at", { ascending: false });

      if (joinedError) {
        // 공동 폴더 조회 실패 시에도 내 폴더는 표시
        return { folders: Array.from(folderMap.values()) };
      }

      (joinedFolders ?? []).forEach((folder) => {
        const normalized = folder as Folder;
        folderMap.set(
          normalized.id,
          NormalizeFolderRow(normalized, roleMap.get(normalized.id) ?? "editor"),
        );
      });
    }

    const folders = Array.from(folderMap.values()).sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    );

    return { folders };
  } catch {
    return { folders: [], error: "Supabase 연결에 실패했습니다." };
  }
}

export async function CreateFolderLogic1(
  name: string,
): Promise<{ folder?: Folder; error?: string }> {
  const trimmed = name.trim();

  if (!trimmed) {
    return { error: "폴더 이름을 입력해 주세요." };
  }

  try {
    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
      .from("folders")
      .insert({
        user_id: GetLocalUserId() || null,
        name: trimmed,
      })
      .select()
      .single();

    if (error) {
      return { error: "폴더 생성에 실패했습니다." };
    }

    return { folder: NormalizeFolderRow(data as Folder) };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}
