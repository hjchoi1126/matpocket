import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalUserId } from "@/lib/userId";
import type { Folder } from "@/types/folder";

export async function LoadFoldersLogic1(): Promise<{
  folders: Folder[];
  error?: string;
}> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();

    let query = supabase
      .from("folders")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return { folders: [], error: "폴더 목록을 불러오지 못했습니다." };
    }

    return { folders: (data ?? []) as Folder[] };
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

    return { folder: data as Folder };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}
