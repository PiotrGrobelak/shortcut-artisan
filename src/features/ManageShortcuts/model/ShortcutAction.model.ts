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

export interface ActionParameters {
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
  parameters: ActionParameters;
}
