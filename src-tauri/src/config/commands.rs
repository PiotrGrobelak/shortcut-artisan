use tauri::AppHandle;

#[tauri::command]
pub async fn get_raw_settings(_app_handle: AppHandle) -> Result<String, String> {
    let config = match crate::config::AppConfig::global().lock() {
        Ok(config) => config,
        Err(e) => {
            log::error!("Failed to lock config: {}", e);
            return Err(format!("Failed to lock config: {}", e));
        }
    };
    
    let file_path = &config.settings_file;
    match std::fs::read_to_string(file_path) {
        Ok(content) => {
            match serde_json::from_str::<serde_json::Value>(&content) {
                Ok(json) => match serde_json::to_string_pretty(&json) {
                    Ok(pretty) => Ok(pretty),
                    Err(e) => {
                        log::error!("Failed to pretty-print JSON: {}", e);
                        Ok(content)
                    }
                },
                Err(e) => {
                    log::error!("Failed to parse settings file as JSON: {}", e);
                    Ok(content)
                }
            }
        },
        Err(e) => {
            log::error!("Failed to read settings file: {}", e);
            Err(format!("Failed to read settings file: {}", e))
        }
    }
} 