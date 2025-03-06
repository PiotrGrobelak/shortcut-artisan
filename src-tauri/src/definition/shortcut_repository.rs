use super::shortcut::Shortcut;
use crate::config::AppConfig;

pub struct ShortcutRepository;

impl ShortcutRepository {
    pub fn new() -> Result<Self, String> {
        Ok(Self)
    }

    pub fn save(&self, shortcut: &Shortcut) -> Result<(), String> {
        log::debug!("Saving shortcut: {:?}", shortcut);
        
        let config = AppConfig::global()
            .lock()
            .expect("Failed to lock config during save.");
        
        let file_path = &config.settings_file;
        
      
        let content = match std::fs::read_to_string(file_path) {
            Ok(content) => content,
            Err(e) => {
                log::error!("Failed to read shortcuts file: {}", e);
                "[]".to_string()
            }
        };
        
        let mut shortcuts: Vec<Shortcut> = match serde_json::from_str(&content) {
            Ok(shortcuts) => shortcuts,
            Err(e) => {
                log::error!("Failed to parse shortcuts JSON: {}", e);
                Vec::new()
            }
        };
        
       
        shortcuts.retain(|s| s.id != shortcut.id);
        
      
        shortcuts.push(shortcut.clone());
        
        let json = match serde_json::to_string_pretty(&shortcuts) {
            Ok(json) => json,
            Err(e) => return Err(e.to_string()),
        };
        
        match std::fs::write(file_path, json) {
            Ok(_) => {
                log::debug!("Shortcut saved successfully");
                Ok(())
            },
            Err(e) => Err(e.to_string()),
        }
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

    pub fn get_all(&self) -> Result<Vec<Shortcut>, String> {
        log::debug!("Fetching all shortcuts from repository");
        let config = AppConfig::global()
            .lock()
            .expect("Failed to lock config during retrieval.");
        
        let file_path = &config.settings_file;
        log::trace!("Reading shortcuts from file: {}", file_path.display());
        
        let content = match std::fs::read_to_string(file_path) {
            Ok(content) => content,
            Err(e) => {
                log::error!("Failed to read shortcuts file: {}", e);
                return Err(e.to_string());
            }
        };

        match serde_json::from_str::<Vec<Shortcut>>(&content) {
            Ok(shortcuts) => {
                log::debug!("Successfully loaded {} shortcuts", shortcuts.len());
                Ok(shortcuts)
            }
            Err(e) => {
                log::error!("Failed to parse shortcuts JSON: {}", e);
                Ok(Vec::new())
            }
        }
    }

    pub fn get_by_id(&self, id: &str) -> Result<Shortcut, String> {
        log::debug!("Fetching shortcut with id: {}", id);
        let config = AppConfig::global()
            .lock()
            .expect("Failed to lock config during retrieval.");
        
        let file_path = &config.settings_file;
        log::trace!("Reading shortcuts from file: {}", file_path.display());
        
        let content = match std::fs::read_to_string(file_path) {
            Ok(content) => content,
            Err(e) => {
                log::error!("Failed to read shortcuts file: {}", e);
                return Err(e.to_string());
            }
        };

        match serde_json::from_str::<Vec<Shortcut>>(&content) {
            Ok(shortcuts) => {
                if let Some(shortcut) = shortcuts.iter().find(|s| s.id == id) {
                    log::debug!("Successfully found shortcut with id: {}", id);
                    Ok(shortcut.clone())
                } else {
                    let error_msg = format!("Shortcut with id {} not found", id);
                    log::error!("{}", error_msg);
                    Err(error_msg)
                }
            }
            Err(e) => {
                log::error!("Failed to parse shortcuts JSON: {}", e);
                Err(e.to_string())
            }
        }
    }
}

