use chrono::Utc;
use log;
use once_cell::sync::OnceCell;
use std::path::PathBuf;
use std::sync::Mutex;

static CONFIG: OnceCell<Mutex<AppConfig>> = OnceCell::new();

pub struct AppConfig {
    pub data_dir: PathBuf,
    pub settings_file: PathBuf,
}

impl AppConfig {
    pub fn global() -> &'static Mutex<AppConfig> {
        CONFIG.get().unwrap_or_else(|| {
            log::error!("Config not initialized");
            panic!("Config not initialized")
        })
    }

    pub fn init() -> Result<(), String> {
        let home_dir = dirs::home_dir().ok_or_else(|| {
            log::error!("Failed to get home directory");
            "Failed to get home directory".to_string()
        })?;
        let data_dir = home_dir.join(".shortcut-artisan");
        let settings_file = data_dir.join("settings.json");

        if !data_dir.exists() {
            std::fs::create_dir_all(&data_dir).map_err(|e| {
                log::error!("Failed to create config directory: {}", e);
                format!("Failed to create config directory: {}", e)
            })?;
        }

        if !settings_file.exists() {
            std::fs::File::create(&settings_file).map_err(|e| {
                log::error!("Failed to create settings file: {}", e);
                format!("Failed to create settings file: {}", e)
            })?;

            let current_time = Utc::now().to_rfc3339();

            let initial_settings = format!(
                r#"{{
  "version": "1.0.0",
  "lastUpdated": "{0}",
  "user": {{
    "id": "default-user",
    "preferences": {{
      "theme": "light",
      "fontSize": "medium",
      "language": "en-US",
      "notifications": {{
        "enabled": true,
        "sound": true,
        "desktop": true
      }},
      "layout": {{
        "sidebarPosition": "left",
        "compactView": false
      }}
    }}
  }},
  "shortcuts": {{
    "folders": [],
    "favorites": [],
    "recent": []
  }},
  "features": {{
    "enabledExperiments": [],
    "betaFeatures": false,
    "maxShortcutsPerFolder": 50,
    "maxFolders": 10
  }},
  "security": {{
    "keepLogged": true
  }}
}}"#,
                current_time
            );

            std::fs::write(&settings_file, initial_settings).map_err(|e| {
                log::error!("Failed to initialize settings file: {}", e);
                format!("Failed to initialize settings file: {}", e)
            })?;
        }

        let config = AppConfig {
            data_dir,
            settings_file,
        };

        CONFIG.set(Mutex::new(config)).map_err(|_| {
            log::error!("Failed to set global config");
            "Failed to set global config".to_string()
        })?;

        Ok(())
    }
}

pub mod commands;
pub use commands::get_raw_settings;
