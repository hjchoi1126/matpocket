import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalNickname } from "@/lib/nickname";
import { GetLocalUserId } from "@/lib/userId";
import type { Folder, FolderMember } from "@/types/folder";

function NormalizeFolder(
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

export function BuildFolderInviteUrlLogic1(inviteToken: string) {
  if (typeof window === "undefined") {
    return `/shared/join/${inviteToken}`;
  }

  return `${window.location.origin}/shared/join/${inviteToken}`;
}

export async function GetMemberFolderIdsLogic1(
  userId?: string,
): Promise<number[]> {
  const resolvedUserId = userId ?? GetLocalUserId();

  if (!resolvedUserId) {
    return [];
  }

  try {
    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
      .from("folder_members")
      .select("folder_id")
      .eq("user_id", resolvedUserId);

    if (error) {
      return [];
    }

    return (data ?? []).map((row) => row.folder_id as number);
  } catch {
    return [];
  }
}

export async function IsFolderMemberLogic1(
  folderId: number,
  userId?: string,
): Promise<boolean> {
  const resolvedUserId = userId ?? GetLocalUserId();

  if (!resolvedUserId) {
    return false;
  }

  try {
    const supabase = CreateSupabaseClient();
    const { data } = await supabase
      .from("folder_members")
      .select("id")
      .eq("folder_id", folderId)
      .eq("user_id", resolvedUserId)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

export async function CanEditPlaceInFolderLogic1(
  folderId: number | null,
  placeUserId: string | null,
  userId?: string,
): Promise<boolean> {
  const resolvedUserId = userId ?? GetLocalUserId();

  if (!resolvedUserId) {
    return false;
  }

  if (placeUserId === resolvedUserId) {
    return true;
  }

  if (!folderId) {
    return false;
  }

  return IsFolderMemberLogic1(folderId, resolvedUserId);
}

export async function CreateSharedFolderLogic1(
  name: string,
): Promise<{ folder?: Folder; error?: string }> {
  const trimmed = name.trim();

  if (!trimmed) {
    return { error: "공동 폴더 이름을 입력해 주세요." };
  }

  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();
    const displayName = GetLocalNickname();

    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .insert({
        user_id: userId || null,
        name: trimmed,
        is_shared: true,
      })
      .select()
      .single();

    if (folderError || !folder) {
      return { error: "공동 폴더 생성에 실패했습니다." };
    }

    const { error: memberError } = await supabase.from("folder_members").insert({
      folder_id: folder.id,
      user_id: userId,
      display_name: displayName,
      role: "owner",
    });

    if (memberError) {
      return { error: "공동 폴더 멤버 등록에 실패했습니다." };
    }

    return {
      folder: NormalizeFolder(folder as Folder, "owner"),
    };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export async function JoinSharedFolderLogic1(
  inviteToken: string,
): Promise<{
  folder?: Folder;
  alreadyJoined?: boolean;
  error?: string;
}> {
  const trimmed = inviteToken.trim();

  if (!trimmed) {
    return { error: "초대 코드가 없습니다." };
  }

  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();
    const displayName = GetLocalNickname();

    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("invite_token", trimmed)
      .eq("is_shared", true)
      .maybeSingle();

    if (folderError || !folder) {
      return { error: "유효하지 않거나 만료된 초대 링크입니다." };
    }

    const { data: existingMember } = await supabase
      .from("folder_members")
      .select("id, role")
      .eq("folder_id", folder.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMember) {
      return {
        folder: NormalizeFolder(folder as Folder, existingMember.role as Folder["role"]),
        alreadyJoined: true,
      };
    }

    const { error: joinError } = await supabase.from("folder_members").insert({
      folder_id: folder.id,
      user_id: userId,
      display_name: displayName,
      role: "editor",
    });

    if (joinError) {
      return { error: "공동 폴더 참여에 실패했습니다." };
    }

    return {
      folder: NormalizeFolder(folder as Folder, "editor"),
    };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export async function LoadFolderMembersLogic1(
  folderId: number,
): Promise<{ members: FolderMember[]; error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
      .from("folder_members")
      .select("*")
      .eq("folder_id", folderId)
      .order("joined_at", { ascending: true });

    if (error) {
      return { members: [], error: "멤버 목록을 불러오지 못했습니다." };
    }

    return { members: (data ?? []) as FolderMember[] };
  } catch {
    return { members: [], error: "Supabase 연결에 실패했습니다." };
  }
}

export async function LoadSharedFolderByTokenLogic1(
  inviteToken: string,
): Promise<{ folder?: Folder; error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("invite_token", inviteToken)
      .eq("is_shared", true)
      .maybeSingle();

    if (error || !data) {
      return { error: "공동 폴더를 찾을 수 없습니다." };
    }

    return { folder: NormalizeFolder(data as Folder) };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

async function GetFolderMemberRoleLogic1(
  folderId: number,
  userId?: string,
): Promise<Folder["role"] | null> {
  const resolvedUserId = userId ?? GetLocalUserId();

  if (!resolvedUserId) {
    return null;
  }

  try {
    const supabase = CreateSupabaseClient();
    const { data } = await supabase
      .from("folder_members")
      .select("role")
      .eq("folder_id", folderId)
      .eq("user_id", resolvedUserId)
      .maybeSingle();

    return (data?.role as Folder["role"] | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function DeleteSharedFolderLogic1(
  folderId: number,
): Promise<{ error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const role = await GetFolderMemberRoleLogic1(folderId);

    if (role !== "owner") {
      return { error: "방장만 공동 폴더를 삭제할 수 있습니다." };
    }

    const { error } = await supabase.from("folders").delete().eq("id", folderId);

    if (error) {
      return { error: "공동 폴더 삭제에 실패했습니다." };
    }

    return {};
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export async function LeaveSharedFolderLogic1(
  folderId: number,
): Promise<{ error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();
    const role = await GetFolderMemberRoleLogic1(folderId, userId);

    if (!role) {
      return { error: "참여 중인 폴더가 아닙니다." };
    }

    if (role === "owner") {
      return { error: "방장은 나가기 대신 폴더 삭제를 사용해 주세요." };
    }

    const { error } = await supabase
      .from("folder_members")
      .delete()
      .eq("folder_id", folderId)
      .eq("user_id", userId);

    if (error) {
      return { error: "공동 폴더 나가기에 실패했습니다." };
    }

    return {};
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}
