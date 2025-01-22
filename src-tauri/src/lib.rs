use serde::{Deserialize, Serialize};
use std::fs::{self, File, Permissions};
use std::io::Write;
use std::os::unix::fs::PermissionsExt; // for setting file permissions on Unix-like systems
use tauri::plugin::TauriPlugin;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Runtime;
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut as TauriShortcut, ShortcutState,
};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct Shortcut2 {
    key_combination: String,
    command_name: String,
}

#[derive(Deserialize)]
struct ShortcutParams {
    shortcut: String,
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Shortcut {
    id: String,
    shortcut: String,
    name: String,
}

#[tauri::command]
async fn register_shortcut(
    app_handle: tauri::AppHandle,
    key_combination: String,
    command_name: String,
) -> Result<(), String> {
    let shortcut_test = Shortcut2::new(&key_combination, &command_name);
    let tauri_shortcut = shortcut_test
        .to_tauri_shortcut()
        .expect("Failed to create shortcut");

    if app_handle.global_shortcut().is_registered(tauri_shortcut) {
        log::info!("Unregistering existing shortcut: {}", key_combination);
        app_handle
            .global_shortcut()
            .unregister(tauri_shortcut)
            .map_err(|e| e.to_string())
            .expect("Failed to unregister shortcut");
    }

    match app_handle
        .global_shortcut()
        .register(tauri_shortcut)
        .map_err(|e| e.to_string())
    {
        Ok(_) => {
            log::info!(
                "Successfully registered shortcut: {} for command: {}",
                key_combination,
                command_name
            );
            Ok(())
        }
        Err(e) => {
            log::error!(
                "Failed to register shortcut: {} - Error: {}",
                key_combination,
                e
            );
            Err(e)
        }
    }
}

#[tauri::command]
async fn save_shortcut(
    app_handle: tauri::AppHandle,
    payload: ShortcutParams,
) -> Result<(), String> {
    log::info!("Get shortcut: {}, name: {}", payload.shortcut, payload.name);

    let shortcut = Shortcut {
        id: Uuid::new_v4().to_string(),
        shortcut: payload.shortcut.clone(),
        name: payload.name.clone(),
    };

    let home_dir = dirs::home_dir().ok_or("Failed to get home directory")?;
    let dir_path = home_dir.join(".shortcut-artisan");

    fs::create_dir_all(&dir_path).map_err(|e| e.to_string())?;
    fs::set_permissions(&dir_path, Permissions::from_mode(0o755)).map_err(|e| e.to_string())?;

    let file_path = dir_path.join("settings.json");
    log::info!("New shortcut save: {:?}", shortcut.name);

    let json = serde_json::to_string(&shortcut).map_err(|e| e.to_string())?;

    let mut file = File::create(file_path).map_err(|e| e.to_string())?;

    file.write_all(json.as_bytes()).map_err(|e| e.to_string())?;

    register_shortcut(app_handle, shortcut.shortcut, shortcut.name).await
}

fn load_shortcuts_at_startup(app: &tauri::App) -> Result<(), String> {
    let home_dir = dirs::home_dir().ok_or("Failed to get home directory")?;
    let file_path = home_dir.join(".shortcut-artisan").join("settings.json");

    if file_path.exists() {
        let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
        let shortcut: Shortcut2 = serde_json::from_str(&content).map_err(|e| e.to_string())?;

        log::info!("Loading shortcut: {}", shortcut.command_name);

        let rt = tokio::runtime::Runtime::new().map_err(|e| e.to_string())?;
        rt.block_on(async {
            register_shortcut(
                app.handle().clone(),
                shortcut.key_combination,
                shortcut.command_name,
            )
            .await
            .map_err(|e| e.to_string())
        })?;
    } else {
        log::error!("No shortcut file found!");
    }

    Ok(())
}

impl Shortcut2 {
    fn new(key_combination: &str, command_name: &str) -> Self {
        Self {
            key_combination: key_combination.to_string(),
            command_name: command_name.to_string(),
        }
    }
    pub fn to_tauri_shortcut(&self) -> Option<TauriShortcut> {
        let parts: Vec<String> = self
            .key_combination
            .split('+')
            .map(|s| s.trim().to_uppercase())
            .collect();

        let mut modifiers = Modifiers::empty();
        let mut key_code = None;

        for part in parts {
            match part.as_str() {
                "CTRL" | "CONTROL" => modifiers |= Modifiers::CONTROL,
                "ALT" => modifiers |= Modifiers::ALT,
                "SHIFT" => modifiers |= Modifiers::SHIFT,
                "SUPER" | "CMD" | "WINDOWS" => modifiers |= Modifiers::SUPER,
                key => {
                    key_code = match key {
                        "A" => Some(Code::KeyA),
                        "B" => Some(Code::KeyB),
                        "C" => Some(Code::KeyC),
                        "D" => Some(Code::KeyD),
                        "E" => Some(Code::KeyE),
                        "F" => Some(Code::KeyF),
                        "G" => Some(Code::KeyG),
                        "H" => Some(Code::KeyH),
                        "I" => Some(Code::KeyI),
                        "J" => Some(Code::KeyJ),
                        "K" => Some(Code::KeyK),
                        "L" => Some(Code::KeyL),
                        "M" => Some(Code::KeyM),
                        "N" => Some(Code::KeyN),
                        "O" => Some(Code::KeyO),
                        "P" => Some(Code::KeyP),
                        "Q" => Some(Code::KeyQ),
                        "R" => Some(Code::KeyR),
                        "S" => Some(Code::KeyS),
                        "T" => Some(Code::KeyT),
                        "U" => Some(Code::KeyU),
                        "V" => Some(Code::KeyV),
                        "W" => Some(Code::KeyW),
                        "X" => Some(Code::KeyX),
                        "Y" => Some(Code::KeyY),
                        "Z" => Some(Code::KeyZ),
                        "1" => Some(Code::Digit1),
                        "2" => Some(Code::Digit2),
                        "3" => Some(Code::Digit3),
                        "4" => Some(Code::Digit4),
                        "5" => Some(Code::Digit5),
                        "6" => Some(Code::Digit6),
                        "7" => Some(Code::Digit7),
                        "8" => Some(Code::Digit8),
                        "9" => Some(Code::Digit9),
                        "0" => Some(Code::Digit0),
                        "SPACE" => Some(Code::Space),
                        "ENTER" => Some(Code::Enter),
                        "TAB" => Some(Code::Tab),
                        "ESC" => Some(Code::Escape),
                        _ => None,
                    };
                }
            }
        }

        key_code.map(|code| TauriShortcut::new(Some(modifiers), code))
    }
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
                    let shortcut_to_parse: Shortcut2 = serde_json::from_str(&content)
                        .map_err(|e| e.to_string())
                        .expect("Failed to parse JSON");

                    log::info!("Loading shortcut: {}", shortcut_to_parse.command_name);

                    let shortcut_test = Shortcut2::new(
                        &shortcut_to_parse.key_combination,
                        &shortcut_to_parse.command_name,
                    );
                    let tauri_shortcut = shortcut_test.to_tauri_shortcut().unwrap();

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

    #[test]
    fn test_single_modifier_shortcuts() {
        let test_cases = vec![
            ("Ctrl+A", Modifiers::CONTROL, Code::KeyA),
            ("Alt+B", Modifiers::ALT, Code::KeyB),
            ("Shift+C", Modifiers::SHIFT, Code::KeyC),
            ("Super+D", Modifiers::SUPER, Code::KeyD),
        ];

        for (combination, expected_mods, expected_code) in test_cases {
            let shortcut = Shortcut2::new(combination, "test");
            let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();
            let expected = create_shortcut(expected_mods, expected_code);
            assert_eq!(tauri_shortcut, expected);
        }
    }

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

        for (combination, expected_mods, expected_code) in test_cases {
            let shortcut = Shortcut2::new(combination, "test");
            let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();
            let expected = create_shortcut(expected_mods, expected_code);
            assert_eq!(tauri_shortcut, expected);
        }
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

        for (combination, expected_code) in test_cases {
            let shortcut = Shortcut2::new(combination, "test");
            let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();
            let expected = create_shortcut(Modifiers::CONTROL, expected_code);
            assert_eq!(tauri_shortcut, expected);
        }
    }

    #[test]
    fn test_case_insensitivity() {
        let variations = vec!["CTRL+A", "ctrl+a", "Ctrl+A", "ConTroL+A"];

        let expected = create_shortcut(Modifiers::CONTROL, Code::KeyA);
        for combo in variations {
            let shortcut = Shortcut2::new(combo, "test");
            let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();
            assert_eq!(tauri_shortcut, expected);
        }
    }

    #[test]
    fn test_whitespace_handling() {
        let variations = vec!["Ctrl + A", "Ctrl  +  A", " Ctrl + A ", "Ctrl+A "];

        let expected = create_shortcut(Modifiers::CONTROL, Code::KeyA);
        for combo in variations {
            let shortcut = Shortcut2::new(combo, "test");
            let tauri_shortcut = shortcut.to_tauri_shortcut().unwrap();
            assert_eq!(tauri_shortcut, expected);
        }
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

        for (alias, standard) in aliases {
            let alias_shortcut = Shortcut2::new(alias, "test").to_tauri_shortcut().unwrap();
            let standard_shortcut = Shortcut2::new(standard, "test")
                .to_tauri_shortcut()
                .unwrap();
            assert_eq!(alias_shortcut, standard_shortcut);
        }
    }
}
