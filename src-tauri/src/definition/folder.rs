use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub shortcut_ids: Vec<String>, // IDs of shortcuts in this folder
}

#[derive(Debug, Deserialize)]
pub struct FolderRequestPayload {
    pub name: String,
    pub icon: Option<String>,
    pub color: Option<String>,
}

impl Folder {
    pub fn new(payload: FolderRequestPayload) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            name: payload.name,
            icon: payload.icon,
            color: payload.color,
            shortcut_ids: Vec::new(),
        }
    }

    pub fn add_shortcut(&mut self, shortcut_id: String) {
        if !self.shortcut_ids.contains(&shortcut_id) {
            self.shortcut_ids.push(shortcut_id);
        }
    }

    pub fn remove_shortcut(&mut self, shortcut_id: &str) {
        self.shortcut_ids.retain(|id| id != shortcut_id);
    }
} 