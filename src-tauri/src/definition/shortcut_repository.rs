use super::shortcut::Shortcut;
use crate::config::AppConfig;

pub struct ShortcutRepository;

impl ShortcutRepository {
    pub fn new() -> Result<Self, String> {
        Ok(Self)
    }

    pub fn save(&self, shortcut: &Shortcut) -> Result<(), String> {
        let config = AppConfig::global()
            .lock()
            .expect("Failed to lock config during save.");
        let file_path = &config.settings_file;

        let content = std::fs::read_to_string(file_path).map_err(|e| e.to_string())?;

        let mut shortcuts: Vec<Shortcut> = serde_json::from_str(&content).unwrap_or_default();

        shortcuts.push(shortcut.clone());

        let json = serde_json::to_string(&shortcuts).map_err(|e| e.to_string())?;

        std::fs::write(file_path, json).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn get_current(&self) -> Result<Shortcut, String> {
        let config = AppConfig::global()
            .lock()
            .expect("Failed to lock config during retrieval.");
        let content = std::fs::read_to_string(&config.settings_file).map_err(|e| e.to_string())?;

        serde_json::from_str(&content).map_err(|e| e.to_string())
    }

    pub fn delete(&self, id: &str) -> Result<(), String> {
        let config = AppConfig::global()
            .lock()
            .expect("Failed to lock config during deletion.");
        let file_path = &config.settings_file;

        let content = std::fs::read_to_string(file_path).map_err(|e| e.to_string())?;

        let mut shortcuts: Vec<Shortcut> =
            serde_json::from_str(&content).map_err(|e| e.to_string())?;

        if let Some(index) = shortcuts.iter().position(|s| s.id == id) {
            shortcuts.remove(index);

            let json = serde_json::to_string(&shortcuts).map_err(|e| e.to_string())?;

            std::fs::write(file_path, json).map_err(|e| e.to_string())?;

            Ok(())
        } else {
            Err(format!("Shortcut with id {} not found", id))
        }
    }
}
