import { invoke } from "@tauri-apps/api/core";

/**
 * Base API client for Tauri invoke calls
 */
export const apiClient = {
  /**
   * Generic method to invoke Tauri commands
   * @param command The command name to invoke
   * @param args Optional arguments for the command
   * @returns Promise with the command result
   */
  invoke: async <T>(
    command: string,
    args?: Record<string, unknown>
  ): Promise<T> => {
    try {
      return await invoke<T>(command, args);
    } catch (error) {
      console.error(`API error in command ${command}:`, error);
      throw error;
    }
  },
};
