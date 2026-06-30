"use client";

import GeoNotifierHeaderButton from "@/components/features/GeoNotifierHeaderButton";
import PlaceRegisterSheet from "@/components/features/PlaceRegisterSheet";
import type { Place } from "@/types/place";

type MainHeaderActionsProps = {
  showUrlRegister?: boolean;
  onUrlSaved?: (place: Place) => void | Promise<void>;
};

export default function MainHeaderActions({
  showUrlRegister = false,
  onUrlSaved,
}: MainHeaderActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {showUrlRegister && onUrlSaved && (
        <PlaceRegisterSheet onSaved={onUrlSaved} />
      )}
      <GeoNotifierHeaderButton />
    </div>
  );
}
