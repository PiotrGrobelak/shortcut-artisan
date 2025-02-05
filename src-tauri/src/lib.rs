pub mod analytics;
pub mod config;
pub mod definition;
pub mod execution;

use analytics::setup_logging_plugin;
use config::AppConfig;
use definition::definition_facade::DefinitionFacade;
use definition::shortcut::{Shortcut, ShortcutParams};
use execution::setup_global_shortcut_plugin;
use execution::ExecutionFacade;
use serde::{Deserialize, Serialize};
use std::fs::{self};
use tauri::plugin::TauriPlugin;
use tauri::Runtime;
use tauri::{AppHandle, Manager};
use tauri::{Config, Emitter};
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut as TauriShortcut, ShortcutState,
};

fn load_shortcuts_at_startup(app: &tauri::App) -> Result<(), String> {
    let config = AppConfig::global().lock().unwrap();
    let file_path = &config.settings_file;

    if file_path.exists() {
        let content = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
        let shortcuts: Vec<Shortcut> = serde_json::from_str(&content).map_err(|e| e.to_string())?;

        if shortcuts.is_empty() {
            log::info!("No shortcuts found to load");
            return Ok(());
        }

        let execution_facade = ExecutionFacade::new(app.handle().clone());

        let rt = tokio::runtime::Runtime::new().map_err(|e| e.to_string())?;

        for shortcut in shortcuts {
            log::info!("Loading shortcut: {}", shortcut.command_name);

            let tauri_shortcut = execution_facade
                .parse_shortcut(&shortcut.key_combination)
                .ok_or_else(|| {
                    format!(
                        "Failed to create TauriShortcut for {}",
                        shortcut.command_name
                    )
                })?;

            rt.block_on(async {
                execution_facade
                    .register_system_shortcut(tauri_shortcut)
                    .await
                    .map_err(|e| {
                        format!(
                            "Failed to register shortcut {}: {}",
                            shortcut.command_name, e
                        )
                    })
            })?;

            log::info!(
                "Successfully registered shortcut: {}",
                shortcut.command_name
            );
        }
    } else {
        log::error!("No shortcut file found!");
    }

    Ok(())
}

#[tauri::command]
async fn save_shortcut(app_handle: AppHandle, payload: ShortcutParams) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle).expect("Failed to create DefinitionFacade");
    facade.save_shortcut(payload).await
}

#[tauri::command]
async fn delete_shortcut(app_handle: AppHandle, id: String) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle)?;
    facade.delete_shortcut(&id).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    AppConfig::init().expect("Failed to initialize config");

    tauri::Builder::default()
        .plugin(setup_logging_plugin())
        .plugin(setup_global_shortcut_plugin())
        .invoke_handler(tauri::generate_handler![save_shortcut, delete_shortcut])
        .setup(|app| {
            log::info!("Setup started!");

            match load_shortcuts_at_startup(app) {
                Ok(_) => log::info!("Shortcuts loaded successfully!"),
                Err(e) => log::error!("Failed to load shortcuts: {}", e),
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_shortcut(mods: Modifiers, code: Code) -> TauriShortcut {
        TauriShortcut::new(Some(mods), code)
    }

    // #[test]
    // fn test_single_modifier_shortcuts() {
    //     let test_cases = vec![
    //         ("Ctrl+A", Modifiers::CONTROL, Code::KeyA),
    //         ("Alt+B", Modifiers::ALT, Code::KeyB),
    //         ("Shift+C", Modifiers::SHIFT, Code::KeyC),
    //         ("Super+D", Modifiers::SUPER, Code::KeyD),
    //     ];

    //     for (combination, expected_mods, expected_code) in test_cases {
    //         let shortcut = Shortcut2::new(combination, "test");
    //         let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();

    //         let tauri_shortcut = ExecutionFacade::new(
    //             &combination.key_combination,
    //             &combination.command_name,
    //         )
    //         .to_tauri_shortcut()
    //         .ok_or("Failed to create TauriShortcut")?;

    //         let expected = create_shortcut(expected_mods, expected_code);
    //         assert_eq!(tauri_shortcut, expected);
    //     }
    // }

    #[test]
    fn test_multiple_modifier_combinations() {
        let test_cases = vec![
            (
                "Ctrl+Alt+A",
                Modifiers::CONTROL | Modifiers::ALT,
                Code::KeyA,
            ),
            (
                "Ctrl+Alt+Shift+B",
                Modifiers::CONTROL | Modifiers::ALT | Modifiers::SHIFT,
                Code::KeyB,
            ),
            (
                "Ctrl+Alt+Shift+Super+C",
                Modifiers::CONTROL | Modifiers::ALT | Modifiers::SHIFT | Modifiers::SUPER,
                Code::KeyC,
            ),
        ];

        // for (combination, expected_mods, expected_code) in test_cases {
        //     let shortcut = Shortcut2::new(combination, "test");
        //     let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();
        //     let expected = create_shortcut(expected_mods, expected_code);
        //     assert_eq!(tauri_shortcut, expected);
        // }
    }

    #[test]
    fn test_special_keys() {
        let test_cases = vec![
            ("Ctrl+Space", Code::Space),
            ("Ctrl+Enter", Code::Enter),
            ("Ctrl+Tab", Code::Tab),
            ("Ctrl+Esc", Code::Escape),
            ("Ctrl+Escape", Code::Escape),
        ];

        // TODO : Add more special keys
    }

    #[test]
    fn test_number_keys() {
        let test_cases = vec![
            ("Ctrl+1", Code::Digit1),
            ("Ctrl+2", Code::Digit2),
            ("Ctrl+3", Code::Digit3),
            ("Ctrl+4", Code::Digit4),
            ("Ctrl+5", Code::Digit5),
        ];

        // for (combination, expected_code) in test_cases {
        //     let shortcut = Shortcut2::new(combination, "test");
        //     let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();
        //     let expected = create_shortcut(Modifiers::CONTROL, expected_code);
        //     assert_eq!(tauri_shortcut, expected);
        // }
    }

    #[test]
    fn test_case_insensitivity() {
        let variations = vec!["CTRL+A", "ctrl+a", "Ctrl+A", "ConTroL+A"];

        let expected = create_shortcut(Modifiers::CONTROL, Code::KeyA);
        // for combo in variations {
        //     let shortcut = Shortcut2::new(combo, "test");
        //     let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();
        //     assert_eq!(tauri_shortcut, expected);
        // }
    }

    #[test]
    fn test_whitespace_handling() {
        let variations = vec!["Ctrl + A", "Ctrl  +  A", " Ctrl + A ", "Ctrl+A "];

        let expected = create_shortcut(Modifiers::CONTROL, Code::KeyA);
        // for combo in variations {
        //     let shortcut = Shortcut2::new(combo, "test");
        //     let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();
        //     assert_eq!(tauri_shortcut, expected);
        // }
    }

    #[test]
    fn test_invalid_combinations() {
        let invalid_cases = vec![
            "Ctrl",         // Missing key
            "A",            // Missing modifier
            "Ctrl+Invalid", // Invalid key
            "+",            // Empty
            "",             // Empty string
            "Ctrl++A",      // Double separator
            "Ctrl+Alt",     // Missing key
        ];

        //TODO: Add more invalid cases
    }
    #[test]
    fn test_modifier_aliases() {
        let aliases = vec![
            ("Control+A", "Ctrl+A"),
            ("Windows+A", "Super+A"),
            ("Cmd+A", "Super+A"),
        ];

        // for (alias, standard) in aliases {
        //     let alias_shortcut = Shortcut2::new(alias, "test").to_tauri_shortcut().unwrap();
        //     let standard_shortcut = Shortcut2::new(standard, "test")
        //         .to_tauri_shortcut()
        //         .unwrap();
        //     assert_eq!(alias_shortcut, standard_shortcut);
        // }
    }
}
