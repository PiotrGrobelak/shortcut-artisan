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
    let shortcuts = facade.get_all_shortcuts()?;
    
    let filtered_shortcuts: Vec<Shortcut> = shortcuts
        .into_iter()
        .filter(|s| !s.id.is_empty())
        .collect();
        
    Ok(filtered_shortcuts)
}

#[tauri::command]
pub async fn delete_shortcut(app_handle: AppHandle, id: String) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.delete_shortcut(&id).await
}

#[tauri::command]
pub async fn get_shortcut_by_id(
    app_handle: AppHandle,
    id: String,
) -> Result<Shortcut, String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.get_shortcut_by_id(&id)
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
