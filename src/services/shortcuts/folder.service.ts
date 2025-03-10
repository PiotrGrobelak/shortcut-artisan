import { invoke } from "@tauri-apps/api";
import { Folder, FolderPayload } from "./folder.model";

export class FolderService {
  static async getAll(): Promise<Folder[]> {
    try {
      return await invoke<Folder[]>("get_folders");
    } catch (error) {
      console.error("Error fetching folders:", error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Folder> {
    try {
      return await invoke<Folder>("get_folder_by_id", { id });
    } catch (error) {
      console.error(`Error fetching folder with id ${id}:`, error);
      throw error;
    }
  }

  static async create(payload: FolderPayload): Promise<Folder> {
    try {
      return await invoke<Folder>("create_folder", { payload });
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }

  static async update(id: string, payload: FolderPayload): Promise<Folder> {
    try {
      return await invoke<Folder>("update_folder", { id, payload });
    } catch (error) {
      console.error(`Error updating folder with id ${id}:`, error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await invoke<void>("delete_folder", { id });
    } catch (error) {
      console.error(`Error deleting folder with id ${id}:`, error);
      throw error;
    }
  }
}
