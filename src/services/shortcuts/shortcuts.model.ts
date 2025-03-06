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
