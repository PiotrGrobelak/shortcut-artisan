use crate::config::AppConfig;
use crate::definition::shortcut::{Shortcut, ShortcutParams};
use crate::execution::ExecutionFacade;
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

use super::shortcut_repository::ShortcutRepository;
use uuid::Uuid;

pub struct DefinitionFacade {
    app_handle: AppHandle,
    shortcut_repository: ShortcutRepository,
}

impl DefinitionFacade {
    pub fn new(app_handle: AppHandle) -> Result<Self, String> {
        let shortcut_repository = ShortcutRepository::new()?;
        Ok(Self {
            app_handle,
            shortcut_repository,
        })
    }

    pub async fn save_shortcut(&self, shortcut: ShortcutParams) -> Result<(), String> {
        log::info!("Saving shortcut through facade: {}", shortcut.name);

        let shortcut = Shortcut {
            id: Uuid::new_v4().to_string(),
            key_combination: shortcut.shortcut.clone(),
            command_name: shortcut.name.clone(),
        };

        self.shortcut_repository
            .save(&shortcut)
            .expect("Failed to save shortcut");

        let execution_facade = ExecutionFacade::new(self.app_handle.clone());

        let tauri_shortcut = execution_facade
            .parse_shortcut(&shortcut.key_combination)
            .expect("Failed to create shortcut");

        execution_facade
            .register_system_shortcut(tauri_shortcut)
            .await?;

        Ok(())
    }

    pub fn get_current_shortcut(&self) -> Result<Shortcut, String> {
        self.shortcut_repository.get_current()
    }

    pub async fn delete_shortcut(&self, id: &str) -> Result<(), String> {
        if let Ok(shortcut) = self.shortcut_repository.get_current() {
            if shortcut.id == id {
                let execution_facade = ExecutionFacade::new(self.app_handle.clone());

                if let Some(tauri_shortcut) =
                    execution_facade.parse_shortcut(&shortcut.key_combination)
                {
                    if self
                        .app_handle
                        .global_shortcut()
                        .is_registered(tauri_shortcut)
                    {
                        self.app_handle
                            .global_shortcut()
                            .unregister(tauri_shortcut)
                            .map_err(|e| e.to_string())?;
                    }
                } else {
                    log::error!("Failed to parse shortcut for deletion");
                }
            }
        }

        self.shortcut_repository.delete(id)
    }
}
