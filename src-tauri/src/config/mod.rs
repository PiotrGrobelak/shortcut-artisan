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
        CONFIG.get().expect("Config not initialized")
    }

    pub fn init() -> Result<(), String> {
        let home_dir = dirs::home_dir().ok_or("Failed to get home directory")?;
        let data_dir = home_dir.join(".shortcut-artisan");
        let settings_file = data_dir.join("settings.json");

        if !data_dir.exists() {
            std::fs::create_dir_all(&data_dir)
                .map_err(|e| format!("Failed to create config directory: {}", e))?;
        }

        if !settings_file.exists() {
            std::fs::File::create(&settings_file)
                .map_err(|e| format!("Failed to create settings file: {}", e))?;

            std::fs::write(&settings_file, "[]")
                .map_err(|e| format!("Failed to initialize settings file: {}", e))?;
        }

        let config = AppConfig {
            data_dir,
            settings_file,
        };

        CONFIG
            .set(Mutex::new(config))
            .map_err(|_| "Failed to set global config")?;

        Ok(())
    }
}

pub mod commands;
pub use commands::get_raw_settings;
