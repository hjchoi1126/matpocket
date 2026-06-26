export type FolderRole = "owner" | "editor";

export type Folder = {
  id: number;
  user_id: string | null;
  name: string;
  created_at: string;
  is_shared: boolean;
  invite_token: string | null;
  role?: FolderRole;
};

export type FolderMember = {
  id: number;
  folder_id: number;
  user_id: string;
  display_name: string;
  role: FolderRole;
  joined_at: string;
};

export type FolderFilter = "all" | "unassigned" | number;
