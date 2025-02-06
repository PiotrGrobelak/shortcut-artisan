pub mod analytics;
pub mod config;
pub mod definition;
pub mod execution;

use analytics::setup_logging_plugin;
use config::AppConfig;
use definition::commands::{delete_shortcut, save_shortcut};
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    AppConfig::init().expect("Failed to initialize config");

    tauri::Builder::default()
        .plugin(setup_logging_plugin())
        .plugin(setup_global_shortcut_plugin())
        .invoke_handler(tauri::generate_handler![save_shortcut, delete_shortcut])
        .setup(|app| {
            log::info!("Setup started!");

            let execution_facade = ExecutionFacade::new(app.handle().clone());
            if let Err(e) = execution_facade.load_shortcuts_at_startup() {
                log::error!("Failed to load shortcuts: {}", e);
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
