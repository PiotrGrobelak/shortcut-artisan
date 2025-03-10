use crate::definition::shortcut::{Shortcut, ShortcutRequestPayload};
use crate::execution::ExecutionFacade;
use tauri::AppHandle;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

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

    pub async fn save_shortcut(&self, shortcut: ShortcutRequestPayload) -> Result<Shortcut, String> {
        log::info!("Saving shortcut through facade: {}", shortcut.name);

        let shortcut = Shortcut {
            id: Uuid::new_v4().to_string(),
            key_combination: shortcut.shortcut.clone(),
            command_name: shortcut.name.clone(),
            description: shortcut.description.clone(),
            enabled: true, // TODO: Implement enabled
            actions: shortcut.actions.clone(),
            scope: None, // TODO: Implement scope
        };

        self.shortcut_repository
            .save(&shortcut)
            .expect("Failed to save shortcut");

        let execution_facade = ExecutionFacade::new(self.app_handle.clone());

        let tauri_shortcut = match execution_facade.parse_shortcut(&shortcut.key_combination) {
            Some(shortcut) => shortcut,
            None => {
                log::error!(
                    "Failed to parse shortcut combination: '{}'. Please check the key combination format.", 
                    shortcut.key_combination
                );
                return Err("Invalid shortcut combination".to_string());
            }
        };

        let _ = execution_facade.register_system_shortcut(tauri_shortcut);

        Ok(shortcut)
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

    pub fn get_all_shortcuts(&self) -> Result<Vec<Shortcut>, String> {
        self.shortcut_repository.get_all()
    }

    pub fn get_shortcut_by_id(&self, id: &str) -> Result<Shortcut, String> {
        self.shortcut_repository.get_by_id(id)
    }

    pub async fn update_shortcut(
        &self,
        id: &str,
        payload: ShortcutRequestPayload,
    ) -> Result<Shortcut, String> {
        let existing = self.get_shortcut_by_id(id)?;
        
        let updated_shortcut = Shortcut {
            id: existing.id.clone(),
            key_combination: payload.shortcut,
            command_name: payload.name,
            description: payload.description,
            enabled: true,
            actions: payload.actions,
            scope: None,
        };
        
        self.shortcut_repository.save(&updated_shortcut)?;
        
        Ok(updated_shortcut)
    }
}


