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

export const actionParameterRequirements = {
  [ActionType.OpenFolder]: { required: ["path"] },
  [ActionType.OpenFile]: { required: ["path"] },
  [ActionType.OpenApplication]: { required: ["app_name"] },
  [ActionType.QuitApplication]: { required: ["app_name"] },
  [ActionType.HideApplication]: { required: ["app_name"] },
  [ActionType.FocusApplication]: { required: ["app_name"] },
  [ActionType.MinimizeWindow]: { required: ["window_width", "window_height"] },
  [ActionType.MaximizeWindow]: { required: ["window_width", "window_height"] },
  [ActionType.RunShellScript]: { required: ["script"] },
} satisfies Record<ActionType, { required: (keyof BaseParameters)[] }>;

export type ActionParameters = BaseParameters;

export interface ShortcutAction {
  action_type: ActionType;
  parameters: ActionParameters;
}

export type ValidateParameters<T extends ActionType> = {
  action_type: T;
  parameters: Pick<
    BaseParameters,
    (typeof actionParameterRequirements)[T]["required"][number]
  > &
    Partial<
      Omit<
        BaseParameters,
        (typeof actionParameterRequirements)[T]["required"][number]
      >
    >;
};
