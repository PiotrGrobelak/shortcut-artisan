use super::shortcut::Shortcut;
use std::fs::{self, File, Permissions};
use std::io::Write;
use std::os::unix::fs::PermissionsExt;
use std::path::PathBuf;

pub struct ShortcutRepository {
    base_path: PathBuf,
}

impl ShortcutRepository {
    pub fn new() -> Result<Self, String> {
        let home_dir = dirs::home_dir().ok_or("Failed to get home directory")?;
        let base_path = home_dir.join(".shortcut-artisan");

        fs::create_dir_all(&base_path).map_err(|e| e.to_string())?;
        fs::set_permissions(&base_path, Permissions::from_mode(0o755))
            .map_err(|e| e.to_string())?;

        Ok(Self { base_path })
    }

    pub fn save(&self, shortcut: &Shortcut) -> Result<(), String> {
        let file_path = self.base_path.join("settings.json");
        log::info!("Saving shortcut: {:?}", shortcut.command_name);

        if !file_path.exists() {
            return Err("No shortcut file found".to_string());
        }

        let json = serde_json::to_string(&shortcut).map_err(|e| e.to_string())?;
        let mut file = File::create(file_path).map_err(|e| e.to_string())?;
        file.write_all(json.as_bytes()).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn get_current(&self) -> Result<Shortcut, String> {
        let file_path = self.base_path.join("settings.json");

        if !file_path.exists() {
            return Err("No shortcut file found".to_string());
        }

        let content = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    }

    pub fn delete(&self, id: &str) -> Result<(), String> {
        let current = self.get_current()?;

        if current.id == id {
            let file_path = self.base_path.join("settings.json");
            fs::remove_file(file_path).map_err(|e| e.to_string())?;
        }

        Ok(())
    }
}
