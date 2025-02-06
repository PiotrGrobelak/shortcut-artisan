use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ShortcutAction {
    pub action_type: ActionType,
    pub parameters: ActionParameters,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ActionType {
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActionParameters {
    // File & Path Parameters
    pub path: Option<String>,
    pub source_path: Option<String>,
    pub target_path: Option<String>,

    // Application Parameters
    pub app_name: Option<String>,

    // Keyboard Parameters
    pub key: Option<String>,
    pub modifiers: Option<Vec<String>>, // ["cmd", "shift", etc.]

    // Window Parameters
    pub window_width: Option<i32>,
    pub window_height: Option<i32>,
    pub window_x: Option<i32>,
    pub window_y: Option<i32>,

    // Script Parameters
    pub script: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActionScope {
    pub app_name: Option<String>,
    pub app_bundle_id: Option<String>,
    pub window_title: Option<String>,
}
