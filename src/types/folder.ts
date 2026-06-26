export type Folder = {
  id: number;
  user_id: string | null;
  name: string;
  created_at: string;
};

export type FolderFilter = "all" | "unassigned" | number;
