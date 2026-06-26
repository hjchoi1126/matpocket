"use client";

import { useRef, useState } from "react";
import { BadgeCheck, Loader2, Receipt } from "lucide-react";
import {
  VerifyReceiptWithOcrLogic1,
  type OcrResult,
} from "@/features/places/ReceiptLogic1";
import type { Place } from "@/types/place";

type ReceiptVerifyButtonProps = {
  placeId: number;
  placeName: string;
  receiptVerified?: boolean;
  onVerified?: (place: Place, ocr: OcrResult) => void;
};

export default function ReceiptVerifyButton({
  placeId,
  placeName,
  receiptVerified = false,
  onVerified,
}: ReceiptVerifyButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<OcrResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const HandleSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setIsVerifying(true);
    setErrorMessage(null);
    setOcrPreview(null);

    const result = await VerifyReceiptWithOcrLogic1(placeId, file);
    setIsVerifying(false);

    if (result.error || !result.place || !result.ocr) {
      setErrorMessage(result.error ?? "영수증 인증에 실패했습니다.");
      return;
    }

    setOcrPreview(result.ocr);
    onVerified?.(result.place, result.ocr);
  };

  if (receiptVerified) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
          <BadgeCheck className="h-4 w-4" aria-hidden />
          영수증 인증된 찐맛집
        </p>
        {ocrPreview && (
          <p className="mt-1 text-xs text-amber-700">
            {ocrPreview.visit_date} 방문 · {ocrPreview.store_name}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-700">
        영수증으로 방문 인증하기
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {placeName} 방문을 영수증으로 인증하면 발도장과 찐맛집 배지가
        부여됩니다.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void HandleSelectFile(event)}
      />
      <button
        type="button"
        disabled={isVerifying}
        onClick={() => inputRef.current?.click()}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isVerifying ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Receipt className="h-4 w-4" aria-hidden />
        )}
        {isVerifying ? "영수증 분석 중..." : "영수증 인증하기"}
      </button>
      {ocrPreview && (
        <p className="mt-2 text-xs text-green-700">
          인식 완료: {ocrPreview.store_name} · {ocrPreview.visit_date}
        </p>
      )}
      {errorMessage && (
        <p className="mt-2 text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
