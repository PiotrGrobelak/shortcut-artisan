use crate::definition::definition_facade::DefinitionFacade;
use crate::definition::shortcut::ShortcutRequestPayload;
use tauri::AppHandle;

#[tauri::command]
pub async fn save_shortcut(
    app_handle: AppHandle,
    payload: ShortcutRequestPayload,
) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle)
        .expect("Failed to create DefinitionFacade during save_shortcut");
    facade.save_shortcut(payload).await
}

#[tauri::command]
pub async fn delete_shortcut(app_handle: AppHandle, id: String) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle)
        .expect("Failed to create DefinitionFacade during delete_shortcut");
    facade.delete_shortcut(&id).await
}
