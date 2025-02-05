use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]

pub struct Shortcut {
    pub id: String,
    pub key_combination: String,
    pub command_name: String,
}

#[derive(Debug, Deserialize)]
pub struct ShortcutParams {
    pub shortcut: String,
    pub name: String,
}
