import { apiClient } from "../api";
import { Folder, FolderPayload } from "./folder.model";

export const FolderService = {
  getAll: async (): Promise<Folder[]> => {
    return await apiClient.invoke<Folder[]>("get_folders");
  },

  getById: async (id: string): Promise<Folder> => {
    return await apiClient.invoke<Folder>("get_folder_by_id", { id });
  },

  create: async (payload: FolderPayload): Promise<Folder> => {
    return await apiClient.invoke<Folder>("create_folder", { payload });
  },

  update: async (id: string, payload: FolderPayload): Promise<Folder> => {
    return await apiClient.invoke<Folder>("update_folder", { id, payload });
  },

  delete: async (id: string): Promise<void> => {
    console.log("Deleting folder", id);
    return await apiClient.invoke<void>("delete_folder", { id });
  },
};
