use definition::definition_facade::DefinitionFacade;
use definition::shortcut::{Shortcut, ShortcutParams};
use execution::execution_facade::ExecutionFacade;
use serde::{Deserialize, Serialize};
use std::fs::{self};
use tauri::plugin::TauriPlugin;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Runtime;
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut as TauriShortcut, ShortcutState,
};

pub mod definition;
pub mod execution;

fn load_shortcuts_at_startup(app: &tauri::App) -> Result<(), String> {
    let home_dir = dirs::home_dir().ok_or("Failed to get home directory")?;
    let file_path = home_dir.join(".shortcut-artisan").join("settings.json");

    if file_path.exists() {
        let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
        let shortcut: Shortcut = serde_json::from_str(&content).map_err(|e| e.to_string())?;

        log::info!("Loading shortcut: {}", shortcut.command_name);

        let rt = tokio::runtime::Runtime::new().map_err(|e| e.to_string())?;

        let definition_facade = DefinitionFacade::new(app.handle().clone());
        let tauri_shortcut = ExecutionFacade::parse_shortcut(&shortcut.key_combination)
            .expect("Failed to create TauriShortcut");

        rt.block_on(async {
            definition_facade
                .register_system_shortcut(tauri_shortcut)
                .await
                .map_err(|e| e.to_string())
        })?;
    } else {
        log::error!("No shortcut file found!");
    }

    Ok(())
}

pub fn setup_global_shortcut_plugin<R: Runtime>() -> TauriPlugin<R> {
    tauri_plugin_global_shortcut::Builder::new()
        .with_handler(
            move |app: &AppHandle<R>,
                  shortcut,
                  event: tauri_plugin_global_shortcut::ShortcutEvent| {
                log::info!(
                    "Shortcut detected: {:?}, State: {:?}",
                    shortcut,
                    event.state()
                );

                let home_dir = dirs::home_dir()
                    .ok_or("Failed to get home directory")
                    .expect("Failed to get home directory");
                let file_path = home_dir.join(".shortcut-artisan").join("settings.json");

                if file_path.exists() {
                    let content = fs::read_to_string(&file_path)
                        .map_err(|e| e.to_string())
                        .expect("Failed to read file");
                    let shortcut_to_parse: Shortcut = serde_json::from_str(&content)
                        .map_err(|e| e.to_string())
                        .expect("Failed to parse JSON");

                    log::info!("Loading shortcut: {}", shortcut_to_parse.command_name);

                    let tauri_shortcut =
                        ExecutionFacade::parse_shortcut(&shortcut_to_parse.key_combination)
                            .expect("Failed to create TauriShortcut");

                    log::info!("Tauri shortcut is: {:?}", tauri_shortcut);

                    if shortcut == &tauri_shortcut {
                        match event.state() {
                            ShortcutState::Pressed => {
                                log::info!("Ctrl-Alt-U Pressed!");
                                let _ = app
                                    .emit("shortcut-triggered", "Ctrl-Alt-U Pressed!".to_string());
                            }
                            ShortcutState::Released => {
                                log::info!("Ctrl-Alt-U Released!");
                                let _ = app
                                    .emit("shortcut-triggered", "Ctrl-Alt-U Released!".to_string());
                            }
                        }
                    }
                } else {
                    log::error!("No shortcut file found!");
                }
            },
        )
        .build()
}

pub fn setup_logging_plugin<R: Runtime>() -> TauriPlugin<R> {
    tauri_plugin_log::Builder::new()
        .clear_targets()
        .target(tauri_plugin_log::Target::new(
            tauri_plugin_log::TargetKind::Stdout,
        ))
        .target(tauri_plugin_log::Target::new(
            tauri_plugin_log::TargetKind::LogDir {
                file_name: Some("logs".to_string()),
            },
        ))
        .target(tauri_plugin_log::Target::new(
            tauri_plugin_log::TargetKind::Webview,
        ))
        .build()
}

#[tauri::command]
async fn save_shortcut(app_handle: AppHandle, payload: ShortcutParams) -> Result<(), String> {
    let facade = DefinitionFacade::new(app_handle);
    facade.save_shortcut(payload).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(setup_logging_plugin())
        .plugin(setup_global_shortcut_plugin())
        .invoke_handler(tauri::generate_handler![save_shortcut])
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
