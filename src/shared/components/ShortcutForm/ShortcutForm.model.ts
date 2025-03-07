import {
  BaseParameters,
  ActionType,
} from "@/services/shortcuts/shortcuts.model";

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
