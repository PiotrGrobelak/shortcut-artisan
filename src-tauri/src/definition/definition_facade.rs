use crate::definition::shortcut::{Shortcut, ShortcutRequestPayload};
use crate::execution::ExecutionFacade;
use tauri::AppHandle;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

use super::shortcut_repository::ShortcutRepository;
use crate::definition::folder::{Folder, FolderRequestPayload};
use crate::definition::folder_repository::FolderRepository;
use uuid::Uuid;

pub struct DefinitionFacade {
    app_handle: AppHandle,
    shortcut_repository: ShortcutRepository,
    folder_repository: FolderRepository,
}

impl DefinitionFacade {
    pub fn new(app_handle: AppHandle) -> Result<Self, String> {
        let shortcut_repository = ShortcutRepository::new()?;
        let folder_repository = FolderRepository::new()?;

        Ok(Self {
            app_handle,
            shortcut_repository,
            folder_repository,
        })
    }

    pub async fn save_shortcut(
        &self,
        shortcut: ShortcutRequestPayload,
    ) -> Result<Shortcut, String> {
        log::info!("Saving shortcut through facade: {}", shortcut.name);

        let shortcut_id = Uuid::new_v4().to_string();
        let shortcut_obj = Shortcut {
            id: shortcut_id.clone(),
            key_combination: shortcut.shortcut.clone(),
            command_name: shortcut.name.clone(),
            description: shortcut.description.clone(),
            enabled: true,
            actions: shortcut.actions.clone(),
            scope: None,
            folder_id: shortcut.folder_id.clone(),
        };

        self.shortcut_repository
            .save(&shortcut_obj)
            .expect("Failed to save shortcut");

        if let Some(folder_id) = &shortcut.folder_id {
            if let Err(e) = self
                .folder_repository
                .add_shortcut_to_folder(folder_id, &shortcut_id)
            {
                log::error!("Failed to add shortcut to folder: {}", e);
            }
        }

        let execution_facade = ExecutionFacade::new(self.app_handle.clone());

        let tauri_shortcut = match execution_facade.parse_shortcut(&shortcut_obj.key_combination) {
            Some(shortcut) => shortcut,
            None => {
                log::error!(
                    "Failed to parse shortcut combination: '{}'. Please check the key combination format.", 
                    shortcut_obj.key_combination
                );
                return Err("Invalid shortcut combination".to_string());
            }
        };

        let _ = execution_facade.register_system_shortcut(tauri_shortcut);

        Ok(shortcut_obj)
    }

    pub fn get_shortcut_by_id(&self, id: &str) -> Result<Shortcut, String> {
        self.shortcut_repository.get_by_id(id)
    }

    pub fn get_shortcuts_by_folder_id(&self, folder_id: &str) -> Result<Vec<Shortcut>, String> {
        self.shortcut_repository
            .get_shortcuts_by_folder_id(folder_id)
    }

    pub async fn delete_shortcut(&self, id: &str) -> Result<(), String> {
        if let Ok(shortcut) = self.shortcut_repository.get_by_id(id) {
            let execution_facade = ExecutionFacade::new(self.app_handle.clone());

            if let Some(tauri_shortcut) = execution_facade.parse_shortcut(&shortcut.key_combination)
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

        self.shortcut_repository.delete(id)
    }

    pub fn get_all_shortcuts(&self) -> Result<Vec<Shortcut>, String> {
        self.shortcut_repository.get_all()
    }

    pub async fn update_shortcut(
        &self,
        id: &str,
        payload: ShortcutRequestPayload,
    ) -> Result<Shortcut, String> {
        let existing = self.get_shortcut_by_id(id)?;

        if existing.folder_id != payload.folder_id {
            if let Some(old_folder_id) = &existing.folder_id {
                if let Err(e) = self
                    .folder_repository
                    .remove_shortcut_from_folder(old_folder_id, id)
                {
                    log::warn!("Failed to remove shortcut from old folder: {}", e);
                }
            }

            if let Some(new_folder_id) = &payload.folder_id {
                if let Err(e) = self
                    .folder_repository
                    .add_shortcut_to_folder(new_folder_id, id)
                {
                    log::error!("Failed to add shortcut to new folder: {}", e);
                    return Err(format!("Failed to add shortcut to folder: {}", e));
                }
            }
        }

        let updated_shortcut = Shortcut {
            id: existing.id.clone(),
            key_combination: payload.shortcut,
            command_name: payload.name,
            description: payload.description,
            enabled: true,
            actions: payload.actions,
            folder_id: payload.folder_id,
            scope: None,
        };

        self.shortcut_repository.save(&updated_shortcut)?;

        Ok(updated_shortcut)
    }

    pub fn create_folder(&self, payload: FolderRequestPayload) -> Result<Folder, String> {
        let folder = Folder::new(payload);
        self.folder_repository.save_folder(&folder)?;
        Ok(folder)
    }

    pub fn get_folders(&self) -> Result<Vec<Folder>, String> {
        self.folder_repository.get_all_folders()
    }

    pub fn get_folder_by_id(&self, id: &str) -> Result<Folder, String> {
        self.folder_repository.get_folder_by_id(id)
    }

    pub fn update_folder(&self, id: &str, payload: FolderRequestPayload) -> Result<Folder, String> {
        let mut folder = self.folder_repository.get_folder_by_id(id)?;
        folder.name = payload.name;
        folder.icon = payload.icon;
        folder.color = payload.color;

        self.folder_repository.save_folder(&folder)?;
        Ok(folder)
    }

    pub fn delete_folder(&self, id: &str) -> Result<(), String> {
        let folder = self.folder_repository.get_folder_by_id(id)?;

        for shortcut_id in &folder.shortcut_ids {
            if let Ok(mut shortcut) = self.shortcut_repository.get_by_id(shortcut_id) {
                shortcut.folder_id = None;
                self.shortcut_repository.save(&shortcut)?;
            }
        }

        self.folder_repository.delete_folder(id)
    }
}
