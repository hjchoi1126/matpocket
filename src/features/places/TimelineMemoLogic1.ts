import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { CompressImageLogic1 } from "@/lib/CompressImageLogic1";
import { GetLocalUserId } from "@/lib/userId";
import type { PlaceTimelineMemo } from "@/types/timeline";

const TIMELINE_PHOTO_BUCKET = "timeline-photos";
const MAX_PHOTO_COUNT = 5;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const ACCEPTED_PHOTO_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
]);

function FormatTimelineMemoError(
  prefix: string,
  error: { message: string; code?: string },
): string {
  const message = error.message.toLowerCase();

  if (
    message.includes("image_urls") ||
    message.includes("column") ||
    error.code === "PGRST204"
  ) {
    return "DB 설정이 필요합니다. Supabase SQL Editor에서 011_timeline_memo_photos.sql을 실행해 주세요.";
  }

  if (message.includes("bucket not found")) {
    return "사진 저장소가 없습니다. Supabase SQL Editor에서 011_timeline_memo_photos.sql을 실행해 주세요.";
  }

  if (message.includes("row-level security") || message.includes("permission")) {
    return "DB 권한이 없습니다. Supabase SQL Editor에서 011·012 마이그레이션을 실행해 주세요.";
  }

  return `${prefix}: ${error.message}`;
}

function IsAcceptedPhotoFile(file: File): boolean {
  if (ACCEPTED_PHOTO_TYPES.has(file.type)) {
    return true;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_PHOTO_EXTENSIONS.has(extension);
}

function NormalizeTimelineMemo(memo: PlaceTimelineMemo): PlaceTimelineMemo {
  return {
    ...memo,
    image_urls: Array.isArray(memo.image_urls) ? memo.image_urls : [],
  };
}

function GetStoragePathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${TIMELINE_PHOTO_BUCKET}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return publicUrl.slice(index + marker.length);
}

export function ValidateTimelinePhotoFilesLogic1(
  files: File[],
): { error?: string } {
  if (files.length > MAX_PHOTO_COUNT) {
    return { error: `사진은 최대 ${MAX_PHOTO_COUNT}장까지 올릴 수 있어요.` };
  }

  for (const file of files) {
    if (!IsAcceptedPhotoFile(file)) {
      return { error: "JPG, PNG, WEBP 형식의 사진만 업로드할 수 있어요." };
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      return {
        error:
          "사진 용량을 자동으로 줄이지 못했어요. 다른 사진을 선택해 주세요.",
      };
    }
  }

  return {};
}

async function PrepareTimelinePhotoFilesLogic1(
  files: File[],
): Promise<{ files: File[]; error?: string }> {
  const preparedFiles: File[] = [];

  for (const file of files) {
    try {
      preparedFiles.push(await CompressImageLogic1(file));
    } catch {
      return {
        files: [],
        error:
          "사진을 자동으로 줄이지 못했어요. JPG·PNG 사진을 선택하거나 용량을 줄여 주세요.",
      };
    }
  }

  return { files: preparedFiles };
}

async function UploadTimelineMemoPhotosLogic1(
  placeId: number,
  files: File[],
): Promise<{ imageUrls: string[]; error?: string }> {
  if (files.length === 0) {
    return { imageUrls: [] };
  }

  const validation = ValidateTimelinePhotoFilesLogic1(files);

  if (validation.error) {
    return { imageUrls: [], error: validation.error };
  }

  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId() || "anonymous";
    const imageUrls: string[] = [];
    const uploadGroupId = Date.now();

    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const contentType =
        file.type ||
        (extension === "png"
          ? "image/png"
          : extension === "webp"
            ? "image/webp"
            : "image/jpeg");
      const path = `${userId}/${placeId}/${uploadGroupId}-${Math.random().toString(36).slice(2)}.${extension}`;

      const { error } = await supabase.storage
        .from(TIMELINE_PHOTO_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });

      if (error) {
        await DeleteTimelineMemoPhotosLogic1(imageUrls);
        return {
          imageUrls: [],
          error: FormatTimelineMemoError("사진 업로드에 실패했습니다", error),
        };
      }

      const { data } = supabase.storage
        .from(TIMELINE_PHOTO_BUCKET)
        .getPublicUrl(path);

      imageUrls.push(data.publicUrl);
    }

    return { imageUrls };
  } catch {
    return { imageUrls: [], error: "사진 업로드에 실패했습니다." };
  }
}

async function DeleteTimelineMemoPhotosLogic1(
  imageUrls: string[],
): Promise<void> {
  if (imageUrls.length === 0) {
    return;
  }

  try {
    const supabase = CreateSupabaseClient();
    const paths = imageUrls
      .map((url) => GetStoragePathFromPublicUrl(url))
      .filter((path): path is string => Boolean(path));

    if (paths.length === 0) {
      return;
    }

    await supabase.storage.from(TIMELINE_PHOTO_BUCKET).remove(paths);
  } catch {
    // 스토리지 삭제 실패는 메모 삭제를 막지 않음
  }
}

export async function LoadTimelineMemosLogic1(
  placeId: number,
): Promise<{ memos: PlaceTimelineMemo[]; error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
      .from("place_timeline_memos")
      .select("*")
      .eq("place_id", placeId)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        memos: [],
        error: FormatTimelineMemoError(
          "타임라인 메모를 불러오지 못했습니다",
          error,
        ),
      };
    }

    return {
      memos: (data ?? []).map((memo) =>
        NormalizeTimelineMemo(memo as PlaceTimelineMemo),
      ),
    };
  } catch {
    return { memos: [], error: "Supabase 연결에 실패했습니다." };
  }
}

export async function AddTimelineMemoLogic1(
  placeId: number,
  content: string,
  photoFiles: File[] = [],
): Promise<{ memo?: PlaceTimelineMemo; error?: string }> {
  const trimmed = content.trim();
  const preparedPhotos = await PrepareTimelinePhotoFilesLogic1(photoFiles);

  if (preparedPhotos.error) {
    return { error: preparedPhotos.error };
  }

  const validation = ValidateTimelinePhotoFilesLogic1(preparedPhotos.files);

  if (validation.error) {
    return { error: validation.error };
  }

  if (!trimmed && photoFiles.length === 0) {
    return { error: "메모 내용 또는 사진을 추가해 주세요." };
  }

  const insertContent = trimmed || " ";

  try {
    const supabase = CreateSupabaseClient();
    let imageUrls: string[] = [];

    if (preparedPhotos.files.length > 0) {
      const uploadResult = await UploadTimelineMemoPhotosLogic1(
        placeId,
        preparedPhotos.files,
      );

      if (uploadResult.error || uploadResult.imageUrls.length === 0) {
        return {
          error: uploadResult.error ?? "사진 업로드에 실패했습니다.",
        };
      }

      imageUrls = uploadResult.imageUrls;
    }

    const insertPayload: {
      place_id: number;
      user_id: string | null;
      content: string;
      image_urls?: string[];
    } = {
      place_id: placeId,
      user_id: GetLocalUserId() || null,
      content: insertContent,
    };

    if (imageUrls.length > 0) {
      insertPayload.image_urls = imageUrls;
    }

    const { data, error } = await supabase
      .from("place_timeline_memos")
      .insert(insertPayload)
      .select()
      .single();

    if (error || !data) {
      await DeleteTimelineMemoPhotosLogic1(imageUrls);
      return {
        error: FormatTimelineMemoError("메모 저장에 실패했습니다", error ?? {
          message: "unknown",
        }),
      };
    }

    return {
      memo: NormalizeTimelineMemo({
        ...(data as PlaceTimelineMemo),
        content: trimmed,
      }),
    };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export async function DeleteTimelineMemoLogic1(
  memoId: number,
  placeId: number,
  imageUrls: string[] = [],
): Promise<{ error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const { error } = await supabase
      .from("place_timeline_memos")
      .delete()
      .eq("id", memoId)
      .eq("place_id", placeId);

    if (error) {
      return { error: "메모 삭제에 실패했습니다." };
    }

    await DeleteTimelineMemoPhotosLogic1(imageUrls);

    return {};
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export function FormatTimelineDate(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
