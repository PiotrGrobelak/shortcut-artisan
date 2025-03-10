use serde::{Deserialize, Serialize};

use super::action::{ActionScope, ShortcutAction};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Shortcut {
    pub id: String,
    pub key_combination: String,
    pub command_name: String,
    pub description: Option<String>,
    pub enabled: bool,
    pub actions: Vec<ShortcutAction>,
    pub scope: Option<ActionScope>,
    pub folder_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ShortcutRequestPayload {
    pub shortcut: String,
    pub name: String,
    pub description: Option<String>,
    pub actions: Vec<ShortcutAction>,
    pub folder_id: Option<String>,
}
