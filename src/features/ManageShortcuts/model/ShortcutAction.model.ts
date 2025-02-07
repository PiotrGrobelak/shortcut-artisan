export enum ActionType {
  // File & Folder Actions
  OpenFolder,
  OpenFile,

  // Application Control
  OpenApplication,
  QuitApplication,
  HideApplication,
  FocusApplication,

  // Window Management
  MinimizeWindow,
  MaximizeWindow,

  // Script Execution
  RunShellScript,
}

export interface ActionParameters {
  // File & Path Parameters
  path?: string;
  source_path?: string;
  target_path?: string;

  // Application Parameters
  app_name?: string;

  // Keyboard Parameters
  key?: string;
  modifiers?: string[]; // ["cmd", "shift", etc.]

  // Window Parameters
  window_width?: number;
  window_height?: number;
  window_x?: number;
  window_y?: number;

  // Script Parameters
  script?: string;
}

export interface ShortcutAction {
  action_type: ActionType;
  parameters: ActionParameters;
}
