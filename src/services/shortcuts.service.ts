import { apiClient } from "./api";
import { ShortcutAction } from "@/features/ManageShortcuts/model/ShortcutAction.model";

export interface Shortcut {
  id: string;
  key_combination: string;
  command_name: string;
  description?: string;
  enabled: boolean;
  actions: ShortcutAction[];
}

export interface CreateShortcutPayload {
  shortcut: string;
  name: string;
  description?: string;
  actions: ShortcutAction[];
}

export const ShortcutsService = {
  getAll: async (): Promise<Shortcut[]> => {
    return await apiClient.invoke<Shortcut[]>("get_shortcuts");
  },

  getById: async (id: string): Promise<Shortcut> => {
    return await apiClient.invoke<Shortcut>("get_shortcut_by_id", { id });
  },

  create: async (payload: CreateShortcutPayload): Promise<Shortcut> => {
    await apiClient.invoke<void>("save_shortcut", { payload });
    // Since save_shortcut doesn't return the created shortcut, we need to fetch all shortcuts
    const shortcuts = await ShortcutsService.getAll();
    return shortcuts[shortcuts.length - 1]; // Return the last shortcut (newly created one)
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
