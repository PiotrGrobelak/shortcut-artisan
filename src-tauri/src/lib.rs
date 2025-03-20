pub mod analytics;
pub mod config;
pub mod definition;
pub mod execution;

use analytics::setup_logging_plugin;
use config::commands::get_raw_settings;
use config::AppConfig;
use definition::commands::{
    create_folder, delete_folder, delete_shortcut, get_folder_by_id, get_folders,
    get_shortcut_by_id, get_shortcuts, save_shortcut, update_folder, update_shortcut,
};
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
        .invoke_handler(tauri::generate_handler![
            save_shortcut,
            delete_shortcut,
            get_shortcuts,
            get_shortcut_by_id,
            update_shortcut,
            get_raw_settings,
            create_folder,
            update_folder,
            delete_folder,
            get_folders,
            get_folder_by_id,
        ])
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
