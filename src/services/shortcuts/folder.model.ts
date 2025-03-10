export interface Folder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  shortcut_ids: string[];
}

export interface FolderPayload {
  name: string;
  icon?: string;
  color?: string;
}
