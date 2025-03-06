import { apiClient } from "../api";
import { Shortcut, CreateShortcutPayload } from "./shortcuts.model";

export const ShortcutsService = {
  getAll: async (): Promise<Shortcut[]> => {
    return await apiClient.invoke<Shortcut[]>("get_shortcuts");
  },

  getById: async (id: string): Promise<Shortcut> => {
    return await apiClient.invoke<Shortcut>("get_shortcut_by_id", { id });
  },

  create: async (payload: CreateShortcutPayload): Promise<Shortcut> => {
    return await apiClient.invoke<Shortcut>("save_shortcut", { payload });
  },

  update: async (
    id: string,
    payload: CreateShortcutPayload
  ): Promise<Shortcut> => {
    return await apiClient.invoke<Shortcut>("update_shortcut", { id, payload });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.invoke("delete_shortcut", { id });
  },
};
