export enum ActionType {
  OpenFolder = "OpenFolder",
  OpenFile = "OpenFile",

  OpenApplication = "OpenApplication",
  QuitApplication = "QuitApplication",
  HideApplication = "HideApplication",
  FocusApplication = "FocusApplication",

  MinimizeWindow = "MinimizeWindow",
  MaximizeWindow = "MaximizeWindow",

  RunShellScript = "RunShellScript",
}

export interface BaseParameters {
  path?: string;
  source_path?: string;
  target_path?: string;

  app_name?: string;

  key?: string;
  modifiers?: string[]; // ["cmd", "shift", etc.]

  window_width?: number;
  window_height?: number;
  window_x?: number;
  window_y?: number;

  script?: string;
}

export interface ShortcutAction {
  action_type: ActionType;
  parameters: BaseParameters;
}

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
