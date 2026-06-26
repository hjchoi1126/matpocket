import { UpdatePlaceLogic1 } from "@/features/places/PlaceDetailLogic1";
import type { Place } from "@/types/place";

export type OcrResult = {
  store_name: string;
  visit_date: string;
  confidence: number;
};

export async function ParseReceiptLogic1(
  file: File,
): Promise<{ result?: OcrResult; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as OcrResult & { error?: string };

    if (!response.ok) {
      return { error: data.error ?? "영수증 분석에 실패했습니다." };
    }

    return { result: data };
  } catch {
    return { error: "영수증 업로드 중 오류가 발생했습니다." };
  }
}

export async function VerifyReceiptLogic1(
  placeId: number,
): Promise<{ place?: Place; error?: string }> {
  return UpdatePlaceLogic1(placeId, {
    visited: true,
    receipt_verified: true,
    receipt_verified_at: new Date().toISOString(),
  });
}

export async function VerifyReceiptWithOcrLogic1(
  placeId: number,
  file: File,
): Promise<{ place?: Place; ocr?: OcrResult; error?: string }> {
  const parseResult = await ParseReceiptLogic1(file);

  if (parseResult.error || !parseResult.result) {
    return { error: parseResult.error };
  }

  const verifyResult = await VerifyReceiptLogic1(placeId);

  if (verifyResult.error || !verifyResult.place) {
    return { error: verifyResult.error };
  }

  return { place: verifyResult.place, ocr: parseResult.result };
}
