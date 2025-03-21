import { apiClient } from "../api";
import { Shortcut, ShortcutPayload } from "./shortcut.model";

export const ShortcutsService = {
  getAllByFolderId: async (folderId: string): Promise<Shortcut[]> => {
    return await apiClient.invoke<Shortcut[]>("get_shortcuts_by_folder_id", {
      folderId,
    });
  },

  getById: async (id: string): Promise<Shortcut> => {
    return await apiClient.invoke<Shortcut>("get_shortcut_by_id", { id });
  },

  create: async (payload: ShortcutPayload): Promise<Shortcut> => {
    return await apiClient.invoke<Shortcut>("create_shortcut", { payload });
  },

  update: async (id: string, payload: ShortcutPayload): Promise<Shortcut> => {
    return await apiClient.invoke<Shortcut>("update_shortcut", { id, payload });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.invoke("delete_shortcut", { id });
  },
};
