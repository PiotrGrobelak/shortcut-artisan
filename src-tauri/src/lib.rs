use serde::{Deserialize, Serialize};
use std::fs::{self, File, Permissions};
use std::io::Write;
use std::os::unix::fs::PermissionsExt; // for setting file permissions on Unix-like systems
use tauri::Manager;
use uuid::Uuid;

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
fn handle_shortcut(payload: ShortcutParams) -> String {
    log::info!("Get shortcut: {}, name: {}", payload.shortcut, payload.name);

    // Create a Shortcut struct with a unique ID
    let shortcut = Shortcut {
        id: Uuid::new_v4().to_string(),
        shortcut: payload.shortcut,
        name: payload.name,
    };

    let json = serde_json::to_string(&shortcut).expect("Failed to serialize shortcut");

    let home_dir = dirs::home_dir().expect("Failed to get home directory");
    let dir_path = home_dir.join(".shortcut-artisan");

    fs::create_dir_all(&dir_path).expect("Failed to create directory");
    let permissions = Permissions::from_mode(0o755);
    fs::set_permissions(&dir_path, permissions).expect("Failed to set permissions");

    let file_path = dir_path.join("settings.json");

    log::info!("New shortcut save: {:?}", shortcut.name);

    let mut file = File::create(file_path).expect("Failed to create file");
    file.write_all(json.as_bytes())
        .expect("Failed to write to file");

    shortcut.id
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let home_dir = dirs::home_dir().expect("Failed to get home directory");
    let file_path = home_dir.join(".shortcut-artisan").join("settings.json");

    let shortcut: Option<Shortcut> = if file_path.exists() {
        let file_content = fs::read_to_string(&file_path).expect("Failed to read settings.json");
        serde_json::from_str(&file_content).ok()
    } else {
        None
    };

    let (first_part, second_part) = if let Some(shortcut) = &shortcut {
        let parts: Vec<&str> = shortcut.shortcut.split('+').collect();
        if parts.len() == 2 {
            (Some(parts[0].to_string()), Some(parts[1].to_string()))
        } else {
            (None, None)
        }
    } else {
        (None, None)
    };

    let first_part_clone = first_part.clone();
    let second_part_clone = second_part.clone();

    if let (Some(first_part), Some(second_part)) = (first_part, second_part) {
        println!("First part: {}, Second part: {}", first_part, second_part);
        log::info!("First part: {}, Second part: {}", first_part, second_part);
    } else {
        println!("Shortcut does not contain exactly one '+' character or no shortcut found");
        log::info!("Shortcut does not contain exactly one '+' character or no shortcut found");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(
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
                .build(),
        )
        .setup(move |app| {
            #[cfg(desktop)]
            use tauri_plugin_global_shortcut::{
                Code, GlobalShortcutExt, Modifiers, Shortcut as GlobalShortcut, ShortcutState,
            };

            log::info!("Shortcut: {:?}", shortcut);

            // Parse the first_part into Modifiers
            let modifiers = match first_part_clone.unwrap().to_lowercase().as_str() {
                "control" => Modifiers::CONTROL,
                "shift" => Modifiers::SHIFT,
                "alt" => Modifiers::ALT,
                "meta" => Modifiers::META,
                _ => Modifiers::empty(),
            };

            // Convert second_part to Code
            let code = match second_part_clone.unwrap().to_uppercase().as_str() {
                "C" => Code::KeyC,
                "D" => Code::KeyD,
                "E" => Code::KeyE,
                "F" => Code::KeyF,
                "G" => Code::KeyG,
                "H" => Code::KeyH,
                "I" => Code::KeyI,
                "J" => Code::KeyJ,
                "K" => Code::KeyK,
                "L" => Code::KeyL,
                "M" => Code::KeyM,
                "N" => Code::KeyN,
                "O" => Code::KeyO,
                "P" => Code::KeyP,
                "Q" => Code::KeyQ,
                "R" => Code::KeyR,
                "S" => Code::KeyS,
                "T" => Code::KeyT,
                "U" => Code::KeyU,
                "V" => Code::KeyV,
                "W" => Code::KeyW,
                "X" => Code::KeyX,
                "Y" => Code::KeyY,
                "Z" => Code::KeyZ,
                "1" => Code::Digit1,
                "2" => Code::Digit2,
                "3" => Code::Digit3,
                "4" => Code::Digit4,
                "5" => Code::Digit5,
                "6" => Code::Digit6,
                "7" => Code::Digit7,
                "8" => Code::Digit8,
                "9" => Code::Digit9,
                "0" => Code::Digit0,
                _ => Code::Unidentified,
            };

            let user_shortcut = GlobalShortcut::new(Some(modifiers), code);

            log::info!("User shortcut: {:?}", user_shortcut);

            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |_app, shortcut, event| {
                        println!("{:?}", shortcut);
                        log::info!("{:?}", shortcut);
                        if shortcut == &user_shortcut {
                            match event.state() {
                                ShortcutState::Pressed => {
                                    println!("User shortcut Pressed!");
                                    log::info!("User shortcut Pressed!");
                                }
                                ShortcutState::Released => {
                                    println!("User shortcut Released!");
                                    log::info!("User shortcut Released!");
                                }
                            }
                        }
                    })
                    .build(),
            )?;

            app.global_shortcut()
                .register(user_shortcut)
                .expect("Failed to register shortcut");

            log::info!("Application started :)");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![handle_shortcut])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
