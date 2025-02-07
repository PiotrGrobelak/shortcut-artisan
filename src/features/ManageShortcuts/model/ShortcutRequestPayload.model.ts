import type { ShortcutAction } from "./ShortcutAction.model";

export interface ShortcutRequestPayload {
  shortcut: string;
  name: string;
  description?: string;
  actions: ShortcutAction[];
}
