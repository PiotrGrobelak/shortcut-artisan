pub mod analytics;
pub mod config;
pub mod definition;
pub mod execution;

use analytics::setup_logging_plugin;
use config::AppConfig;
use definition::commands::{delete_shortcut, save_shortcut, get_shortcuts, get_shortcut_by_id, update_shortcut};
use execution::setup_global_shortcut_plugin;
use execution::ExecutionFacade;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(e) = AppConfig::init() {
        log::error!("Failed to initialize config: {}", e);
        return;
    }

    if let Err(e) = tauri::Builder::default()
        .plugin(setup_logging_plugin())
        .plugin(setup_global_shortcut_plugin())
        .invoke_handler(tauri::generate_handler![save_shortcut, delete_shortcut, get_shortcuts, get_shortcut_by_id, update_shortcut])
        .setup(|app| {
            log::info!("Setup started!");

            let execution_facade = ExecutionFacade::new(app.handle().clone());
            if let Err(e) = execution_facade.load_shortcuts_at_startup() {
                log::error!("Failed to load shortcuts: {}", e);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
    {
        log::error!("Error while running tauri application: {}", e);
    }
}

