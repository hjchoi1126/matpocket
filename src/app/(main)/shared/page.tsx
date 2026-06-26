import { Suspense } from "react";
import SHARED_BASIC_01 from "@/features/shared/SHARED_BASIC_01";

export default function SharedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-gray-400">
          불러오는 중...
        </div>
      }
    >
      <SHARED_BASIC_01 />
    </Suspense>
  );
}
