use crate::definition::shortcut::{Shortcut, ShortcutParams};
use crate::execution::execution_facade::ExecutionFacade;
use serde::{Deserialize, Serialize};
use std::fs::{self, File, Permissions};
use std::io::Write;
use std::os::unix::fs::PermissionsExt;
use tauri::plugin::TauriPlugin;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Runtime;
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut as TauriShortcut, ShortcutState,
};

use uuid::Uuid;

pub struct DefinitionFacade {
    app_handle: AppHandle,
}

impl DefinitionFacade {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    pub async fn save_shortcut(&self, shortcut: ShortcutParams) -> Result<(), String> {
        log::info!("Saving shortcut through facade: {}", shortcut.name);

        let shortcut = Shortcut {
            id: Uuid::new_v4().to_string(),
            key_combination: shortcut.shortcut.clone(),
            command_name: shortcut.name.clone(),
        };

        self.save_to_disk(&shortcut)?;

        let tauri_shortcut = ExecutionFacade::parse_shortcut(&shortcut.key_combination)
            .expect("Failed to create shortcut");

        self.register_system_shortcut(tauri_shortcut).await?;

        Ok(())
    }

    fn save_to_disk(&self, shortcut: &Shortcut) -> Result<(), String> {
        let home_dir = dirs::home_dir().ok_or("Failed to get home directory")?;
        let dir_path = home_dir.join(".shortcut-artisan");

        fs::create_dir_all(&dir_path).map_err(|e| e.to_string())?;
        fs::set_permissions(&dir_path, Permissions::from_mode(0o755)).map_err(|e| e.to_string())?;

        let file_path = dir_path.join("settings.json");
        log::info!("New shortcut save: {:?}", shortcut.command_name);

        let json = serde_json::to_string(&shortcut).map_err(|e| e.to_string())?;

        let mut file = File::create(file_path).map_err(|e| e.to_string())?;

        file.write_all(json.as_bytes()).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub async fn register_system_shortcut(
        &self,
        tauri_shortcut: TauriShortcut,
    ) -> Result<(), String> {
        if self
            .app_handle
            .global_shortcut()
            .is_registered(tauri_shortcut)
        {
            log::info!("Unregistering existing shortcut: {}", tauri_shortcut);
            self.app_handle
                .global_shortcut()
                .unregister(tauri_shortcut)
                .map_err(|e| e.to_string())
                .expect("Failed to unregister shortcut");
        }

        match self
            .app_handle
            .global_shortcut()
            .register(tauri_shortcut)
            .map_err(|e| e.to_string())
        {
            Ok(_) => {
                log::info!("Successfully registered shortcut: {} ", tauri_shortcut,);
                Ok(())
            }
            Err(e) => {
                log::error!("Failed to register shortcut: {} ", tauri_shortcut,);
                Err(e)
            }
        }
    }
}
