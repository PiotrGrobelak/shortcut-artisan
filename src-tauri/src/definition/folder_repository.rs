use std::fs;
use std::path::PathBuf;

use log::error;
use serde_json::{json, Value};

use crate::config::AppConfig;
use super::folder::Folder;

pub struct FolderRepository {
    config_path: PathBuf,
}

impl FolderRepository {
    pub fn new() -> Result<Self, String> {
        let config = AppConfig::global()
            .lock()
            .expect("Failed to lock config during save.");
        
        let config_path = &config.settings_file;    

        if !config_path.exists() {
            let default_settings = json!({
                "version": "1.0.0",
                "lastUpdated": chrono::Utc::now().to_rfc3339(),
                "shortcuts": {
                    "folders": []
                }
            });

            fs::write(
                &config_path,
                serde_json::to_string_pretty(&default_settings).unwrap(),
            )
            .map_err(|e| format!("Failed to create settings file: {}", e))?;
        }

        Ok(Self { config_path: config_path.clone() })
    }

    fn read_settings(&self) -> Result<Value, String> {
        let content = fs::read_to_string(&self.config_path)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;
        
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse settings file: {}", e))
    }

    fn write_settings(&self, settings: &Value) -> Result<(), String> {
        let content = serde_json::to_string_pretty(settings)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;
        
        fs::write(&self.config_path, content)
            .map_err(|e| format!("Failed to write settings file: {}", e))
    }

    pub fn get_all_folders(&self) -> Result<Vec<Folder>, String> {
        let settings = self.read_settings()?;
        
        // Ensure shortcuts.folders path exists
        if !settings.get("shortcuts").and_then(|s| s.get("folders")).is_some() {
            error!("Invalid settings format: shortcuts.folders not found");
            return Ok(Vec::new());
        }

        let folders = settings["shortcuts"]["folders"]
            .as_array()
            .ok_or_else(|| "Folders is not an array".to_string())?;

        let mut result = Vec::new();
        for folder_value in folders {
            match serde_json::from_value::<Folder>(folder_value.clone()) {
                Ok(folder) => result.push(folder),
                Err(e) => error!("Failed to parse folder: {}", e),
            }
        }

        Ok(result)
    }

    pub fn get_folder_by_id(&self, id: &str) -> Result<Folder, String> {
        let folders = self.get_all_folders()?;
        
        folders
            .into_iter()
            .find(|f| f.id == id)
            .ok_or_else(|| format!("Folder with ID {} not found", id))
    }

    pub fn save_folder(&self, folder: &Folder) -> Result<(), String> {
        let mut settings = self.read_settings()?;

        if !settings.get("shortcuts").is_some() {
            settings["shortcuts"] = json!({});
        }
        if !settings["shortcuts"].get("folders").is_some() {
            settings["shortcuts"]["folders"] = json!([]);
        }

        let folders = settings["shortcuts"]["folders"]
            .as_array_mut()
            .ok_or_else(|| "Folders is not an array".to_string())?;
        
        let existing_index = folders
            .iter()
            .position(|f| f.get("id").and_then(|id| id.as_str()) == Some(&folder.id));
        
        if let Some(index) = existing_index {
            folders[index] = serde_json::to_value(folder)
                .map_err(|e| format!("Failed to serialize folder: {}", e))?;
        } else {
            folders.push(serde_json::to_value(folder)
                .map_err(|e| format!("Failed to serialize folder: {}", e))?);
        }
        
        settings["lastUpdated"] = json!(chrono::Utc::now().to_rfc3339());
        
        self.write_settings(&settings)
    }

    pub fn delete_folder(&self, id: &str) -> Result<(), String> {
        let mut settings = self.read_settings()?;
        
        if let Some(folders) = settings["shortcuts"]["folders"].as_array_mut() {
            let len_before = folders.len();
            folders.retain(|f| f.get("id").and_then(|id| id.as_str()) != Some(id));
            
            if len_before == folders.len() {
                return Err(format!("Folder with ID {} not found", id));
            }
            
            settings["lastUpdated"] = json!(chrono::Utc::now().to_rfc3339());
            
            self.write_settings(&settings)?;
            return Ok(());
        }
        
        Err("Folders array not found in settings".to_string())
    }

    pub fn add_shortcut_to_folder(&self, folder_id: &str, shortcut_id: &str) -> Result<(), String> {
        let mut folder = self.get_folder_by_id(folder_id)?;
        folder.add_shortcut(shortcut_id.to_string());
        self.save_folder(&folder)
    }

    pub fn remove_shortcut_from_folder(&self, folder_id: &str, shortcut_id: &str) -> Result<(), String> {
        let mut folder = self.get_folder_by_id(folder_id)?;
        folder.remove_shortcut(shortcut_id);
        self.save_folder(&folder)
    }
} 