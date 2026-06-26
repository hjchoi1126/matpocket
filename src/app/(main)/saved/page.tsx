import { Suspense } from "react";
import SAVED_BASIC_01 from "@/features/saved/SAVED_BASIC_01";

export default function SavedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-gray-400">
          불러오는 중...
        </div>
      }
    >
      <SAVED_BASIC_01 />
    </Suspense>
  );
}
