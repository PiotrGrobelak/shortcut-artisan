use std::fs;
use std::path::PathBuf;

use serde_json::{json, Value};

use super::shortcut::Shortcut;
use crate::config::AppConfig;

pub struct ShortcutRepository {
    config_path: PathBuf,
}

impl ShortcutRepository {
    pub fn new() -> Result<Self, String> {
        let config = AppConfig::global()
            .lock()
            .expect("Failed to lock config during save.");

        let config_path = &config.settings_file;

        if !config_path.exists() {
            return Err("Settings file does not exist. Initialize config first.".to_string());
        }

        Ok(Self {
            config_path: config_path.clone(),
        })
    }

    fn read_settings(&self) -> Result<Value, String> {
        let content = fs::read_to_string(&self.config_path)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;

        let parsed: Value = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings file: {}", e))?;

        if !parsed.is_object() {
            return Err("Settings file has invalid structure".to_string());
        }

        Ok(parsed)
    }

    fn write_settings(&self, settings: &Value) -> Result<(), String> {
        let content = serde_json::to_string_pretty(settings)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;

        fs::write(&self.config_path, content)
            .map_err(|e| format!("Failed to write settings file: {}", e))
    }

    pub fn save(&self, shortcut: &Shortcut) -> Result<(), String> {
        log::debug!("Saving shortcut: {:?}", shortcut);

        let mut settings = self.read_settings()?;

        if !settings.get("shortcuts").is_some() {
            return Err("Shortcuts structure not found in settings".to_string());
        }

        let shortcuts = settings["shortcuts"]
            .as_array_mut()
            .ok_or_else(|| "Shortcuts is not an array".to_string())?;

        let existing_index = shortcuts
            .iter()
            .position(|s| s.get("id").and_then(|id| id.as_str()) == Some(&shortcut.id));

        if let Some(index) = existing_index {
            shortcuts.remove(index);
        }

        shortcuts.push(
            serde_json::to_value(shortcut)
                .map_err(|e| format!("Failed to serialize shortcut: {}", e))?,
        );

        settings["lastUpdated"] = json!(chrono::Utc::now().to_rfc3339());

        self.write_settings(&settings)?;
        log::debug!("Shortcut saved successfully");
        Ok(())
    }

    pub fn delete(&self, id: &str) -> Result<(), String> {
        log::debug!("Deleting shortcut with id: {}", id);

        let mut settings = self.read_settings()?;

        if let Some(shortcuts) = settings["shortcuts"].as_array_mut() {
            let len_before = shortcuts.len();
            shortcuts.retain(|s| s.get("id").and_then(|id| id.as_str()) != Some(id));

            if len_before == shortcuts.len() {
                return Err(format!("Shortcut with ID {} not found", id));
            }

            settings["lastUpdated"] = json!(chrono::Utc::now().to_rfc3339());

            self.write_settings(&settings)?;
            log::debug!("Shortcut deleted successfully");
            return Ok(());
        }

        Err("Shortcuts array not found in settings".to_string())
    }

    pub fn get_all(&self) -> Result<Vec<Shortcut>, String> {
        log::debug!("Fetching all shortcuts from repository");

        let settings = self.read_settings()?;

        if !settings.get("shortcuts").is_some() {
            return Err("Shortcuts structure not found in settings".to_string());
        }

        let shortcuts = settings["shortcuts"]
            .as_array()
            .ok_or_else(|| "Shortcuts is not an array".to_string())?;

        let mut result = Vec::new();
        for shortcut_value in shortcuts {
            match serde_json::from_value::<Shortcut>(shortcut_value.clone()) {
                Ok(shortcut) => result.push(shortcut),
                Err(e) => log::error!("Failed to parse shortcut: {}", e),
            }
        }

        log::debug!("Successfully loaded {} shortcuts", result.len());
        Ok(result)
    }

    pub fn get_shortcuts_by_folder_id(&self, folder_id: &str) -> Result<Vec<Shortcut>, String> {
        let settings = self.read_settings()?;

        if !settings.get("shortcuts").is_some() {
            return Err("Shortcuts structure not found in settings".to_string());
        }

        let shortcuts = settings["shortcuts"]
            .as_array()
            .ok_or_else(|| "Shortcuts is not an array".to_string())?;

        let mut result = Vec::new();
        for shortcut_value in shortcuts {
            if let Some(shortcut_folder_id) =
                shortcut_value.get("folder_id").and_then(|id| id.as_str())
            {
                if folder_id == shortcut_folder_id {
                    match serde_json::from_value::<Shortcut>(shortcut_value.clone()) {
                        Ok(shortcut) => result.push(shortcut),
                        Err(e) => log::error!("Failed to parse shortcut: {}", e),
                    }
                }
            }
        }

        log::info!("Successfully loaded {} shortcuts", result.len());
        Ok(result)
    }

    pub fn get_by_id(&self, id: &str) -> Result<Shortcut, String> {
        let settings = self.read_settings()?;

        if !settings.get("shortcuts").is_some() {
            return Err(format!("Shortcut with id {} not found", id));
        }

        let shortcuts = settings["shortcuts"]
            .as_array()
            .ok_or_else(|| "Shortcuts is not an array".to_string())?;

        for shortcut_value in shortcuts {
            if let Some(shortcut_id) = shortcut_value.get("id").and_then(|id| id.as_str()) {
                if shortcut_id == id {
                    log::info!("Found shortcut with id: {}", shortcut_id);
                    return serde_json::from_value::<Shortcut>(shortcut_value.clone())
                        .map_err(|e| format!("Failed to parse shortcut: {}", e));
                }
            }
        }

        Err(format!("Shortcut with id {} not found", id))
    }
}
