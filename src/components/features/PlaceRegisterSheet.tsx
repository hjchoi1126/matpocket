"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import HOME_REGISTER_01 from "@/features/home/HOME_REGISTER_01";
import { usePlaceRegister01F } from "@/features/places/PLACE_REGISTER_01F";
import type { Place } from "@/types/place";

type PlaceRegisterSheetProps = {
  onSaved?: (place: Place) => void | Promise<void>;
  triggerLabel?: string;
  triggerClassName?: string;
};

export default function PlaceRegisterSheet({
  onSaved,
  triggerLabel = "URL로 추가",
  triggerClassName = "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary",
}: PlaceRegisterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    form,
    customTag,
    setCustomTag,
    isScraping,
    isSaving,
    errorMessage,
    statusMessage,
    presetTags,
    folders,
    isLoadingFolders,
    lastSavedPlace,
    UpdateField,
    ToggleTag,
    AddCustomTag,
    HandleScrapeLink,
    HandleSavePlace,
    HandleFolderCreated,
    HandleReceiptVerified,
    ResetForm,
  } = usePlaceRegister01F({ onSaved });

  const HandleClose = () => {
    setIsOpen(false);
    ResetForm();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        <Link2 className="h-3.5 w-3.5" aria-hidden />
        {triggerLabel}
      </button>

      <HOME_REGISTER_01
        isOpen={isOpen}
        onClose={HandleClose}
        form={form}
        customTag={customTag}
        setCustomTag={setCustomTag}
        isScraping={isScraping}
        isSaving={isSaving}
        errorMessage={errorMessage}
        statusMessage={statusMessage}
        presetTags={presetTags}
        folders={folders}
        isLoadingFolders={isLoadingFolders}
        lastSavedPlace={lastSavedPlace}
        UpdateField={UpdateField}
        ToggleTag={ToggleTag}
        AddCustomTag={AddCustomTag}
        HandleScrapeLink={() => void HandleScrapeLink()}
        HandleSavePlace={() => void HandleSavePlace()}
        HandleFolderCreated={HandleFolderCreated}
        HandleReceiptVerified={HandleReceiptVerified}
      />
    </>
  );
}
