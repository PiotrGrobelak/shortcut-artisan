use crate::definition::definition_facade::DefinitionFacade;
use crate::definition::folder::{Folder, FolderRequestPayload};
use crate::definition::shortcut::{Shortcut, ShortcutRequestPayload};
use tauri::AppHandle;

#[tauri::command]
pub async fn save_shortcut(
    app_handle: AppHandle,
    payload: ShortcutRequestPayload,
) -> Result<Shortcut, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.save_shortcut(payload).await
}

#[tauri::command]
pub async fn get_shortcuts(app_handle: AppHandle) -> Result<Vec<Shortcut>, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    let shortcuts = facade.get_all_shortcuts()?;

    let filtered_shortcuts: Vec<Shortcut> =
        shortcuts.into_iter().filter(|s| !s.id.is_empty()).collect();

    Ok(filtered_shortcuts)
}

#[tauri::command]
pub async fn delete_shortcut(app_handle: AppHandle, id: String) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.delete_shortcut(&id).await
}

#[tauri::command]
pub async fn get_shortcut_by_id(app_handle: AppHandle, id: String) -> Result<Shortcut, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.get_shortcut_by_id(&id)
}

#[tauri::command]
pub async fn get_shortcuts_by_folder_id(
    app_handle: AppHandle,
    folder_id: String,
) -> Result<Vec<Shortcut>, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.get_shortcuts_by_folder_id(&folder_id)
}

#[tauri::command]
pub async fn update_shortcut(
    app_handle: AppHandle,
    id: String,
    payload: ShortcutRequestPayload,
) -> Result<Shortcut, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.update_shortcut(&id, payload).await
}

#[tauri::command]
pub async fn create_folder(
    app_handle: AppHandle,
    payload: FolderRequestPayload,
) -> Result<Folder, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.create_folder(payload)
}

#[tauri::command]
pub async fn get_folders(app_handle: AppHandle) -> Result<Vec<Folder>, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.get_folders()
}

#[tauri::command]
pub async fn get_folder_by_id(app_handle: AppHandle, id: String) -> Result<Folder, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.get_folder_by_id(&id)
}

#[tauri::command]
pub async fn update_folder(
    app_handle: AppHandle,
    id: String,
    payload: FolderRequestPayload,
) -> Result<Folder, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.update_folder(&id, payload)
}

#[tauri::command]
pub async fn delete_folder(app_handle: AppHandle, id: String) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.delete_folder(&id)
}
