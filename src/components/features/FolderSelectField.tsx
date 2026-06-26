"use client";

import { useState } from "react";
import { FolderPlus, Loader2, Plus } from "lucide-react";
import { CreateFolderLogic1 } from "@/features/folders/FolderLogic1";
import type { Folder } from "@/types/folder";

const NEW_FOLDER_VALUE = "__new_folder__";

type FolderSelectFieldProps = {
  folders: Folder[];
  value: number | null;
  isLoading?: boolean;
  onChange: (folderId: number | null) => void;
  onFolderCreated: (folder: Folder) => void;
};

export default function FolderSelectField({
  folders,
  value,
  isLoading = false,
  onChange,
  onFolderCreated,
}: FolderSelectFieldProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const HandleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;

    if (selected === NEW_FOLDER_VALUE) {
      setShowNewFolderInput(true);
      return;
    }

    setShowNewFolderInput(false);
    onChange(selected ? Number(selected) : null);
  };

  const HandleCreateFolder = async () => {
    setIsCreating(true);
    setCreateError(null);

    const result = await CreateFolderLogic1(newFolderName);
    setIsCreating(false);

    if (result.error || !result.folder) {
      setCreateError(result.error ?? "폴더 생성에 실패했습니다.");
      return;
    }

    onFolderCreated(result.folder);
    onChange(result.folder.id);
    setNewFolderName("");
    setShowNewFolderInput(false);
  };

  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
        <FolderPlus className="h-3.5 w-3.5" aria-hidden />
        저장 폴더
      </label>
      <select
        value={showNewFolderInput ? NEW_FOLDER_VALUE : (value?.toString() ?? "")}
        disabled={isLoading}
        onChange={HandleSelectChange}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white disabled:opacity-50"
      >
        <option value="">폴더 없이 저장</option>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
            {folder.is_shared ? `👥 ${folder.name}` : folder.name}
          </option>
        ))}
        <option value={NEW_FOLDER_VALUE}>+ 새 폴더 추가</option>
      </select>

      {showNewFolderInput && (
        <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="mb-2 text-xs font-medium text-gray-600">새 폴더 이름</p>
          <div className="flex gap-2">
            <input
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void HandleCreateFolder();
                }
              }}
              placeholder="예: 회식 후보, 데이트 맛집"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              disabled={isCreating || !newFolderName.trim()}
              onClick={() => void HandleCreateFolder()}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-3.5 w-3.5" aria-hidden />
              )}
              추가
            </button>
          </div>
          {createError && (
            <p className="mt-2 text-xs text-red-600">{createError}</p>
          )}
        </div>
      )}
    </div>
  );
}
