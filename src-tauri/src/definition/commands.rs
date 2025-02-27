use crate::definition::definition_facade::DefinitionFacade;
use crate::definition::shortcut::{Shortcut, ShortcutRequestPayload};
use tauri::AppHandle;

#[tauri::command]
pub async fn save_shortcut(
    app_handle: AppHandle,
    payload: ShortcutRequestPayload,
) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.save_shortcut(payload).await
}

#[tauri::command]
pub async fn get_shortcuts(app_handle: AppHandle) -> Result<Vec<Shortcut>, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.get_all_shortcuts()
}

#[tauri::command]
pub async fn delete_shortcut(app_handle: AppHandle, id: String) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.delete_shortcut(&id).await
}
