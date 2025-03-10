#[tauri::command]
pub async fn create_folder(
    definition_facade: State<'_, DefinitionFacade>,
    payload: FolderRequestPayload,
) -> Result<Folder, String> {
    definition_facade.create_folder(payload)
}

#[tauri::command]
pub async fn get_folders(
    definition_facade: State<'_, DefinitionFacade>,
) -> Result<Vec<Folder>, String> {
    definition_facade.get_folders()
}

#[tauri::command]
pub async fn get_folder_by_id(
    definition_facade: State<'_, DefinitionFacade>,
    id: String,
) -> Result<Folder, String> {
    definition_facade.get_folder_by_id(&id)
}

#[tauri::command]
pub async fn update_folder(
    definition_facade: State<'_, DefinitionFacade>,
    id: String,
    payload: FolderRequestPayload,
) -> Result<Folder, String> {
    definition_facade.update_folder(&id, payload)
}

#[tauri::command]
pub async fn delete_folder(
    definition_facade: State<'_, DefinitionFacade>,
    id: String,
) -> Result<(), String> {
    definition_facade.delete_folder(&id)
} 