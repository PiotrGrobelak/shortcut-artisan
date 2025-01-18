use serde::{Deserialize, Serialize};
use std::fs::{self, File, Permissions};
use std::io::Write;
use std::os::unix::fs::PermissionsExt; // for setting file permissions on Unix-like systems
use tauri::Emitter;
use tauri::{Manager, Runtime};
use uuid::Uuid;

#[derive(Deserialize)]
struct ShortcutParams {
    shortcut: String,
    name: String,
}

#[derive(Debug, serde::Serialize)]
struct ShortcutPayload {
    key: String,
    state: String,
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

#[tauri::command]
async fn shortcut_pressed(shortcut: String) -> String {
    log::info!("Shortcut pressed: {}", shortcut);
    shortcut
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
            {
                use tauri_plugin_global_shortcut::{
                    Code, GlobalShortcutExt, Modifiers, Shortcut as TauriShortcut, ShortcutState,
                };

                let app_handle = app.handle().clone();
                log::info!("Setup started!");

                // Definicja skrótu
                let ctrl_alt_u_shortcut =
                    TauriShortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyU);

                // Rejestracja handlera
                let plugin = tauri_plugin_global_shortcut::Builder::new()
                    .with_shortcut(ctrl_alt_u_shortcut.clone())?
                    .with_handler(move |_app, shortcut, event| {
                        log::info!(
                            "Shortcut detected: {:?}, State: {:?}",
                            shortcut,
                            event.state()
                        );

                        if shortcut == &ctrl_alt_u_shortcut {
                            match event.state() {
                                ShortcutState::Pressed => {
                                    log::info!("Ctrl-N Pressed!");
                                    let _ = app_handle
                                        .emit("shortcut-triggered", "Ctrl-N Pressed!".to_string());
                                }
                                ShortcutState::Released => {
                                    log::info!("Ctrl-N Released!");
                                    let _ = app_handle
                                        .emit("shortcut-triggered", "Ctrl-N Released!".to_string());
                                }
                            }
                        }
                    })
                    .build();

                println!("Registering shortcut plugin...");
                if let Err(e) = app.handle().plugin(plugin) {
                    println!("Failed to register shortcut plugin: {}", e);
                    log::error!("Failed to register shortcut plugin: {}", e);
                    return Ok(());
                } else {
                    println!("Shortcut plugin registered successfully");
                    log::info!("Shortcut plugin registered successfully");
                }

                // // Rejestracja skrótu
                // if let Err(e) = app.global_shortcut().register(ctrl_alt_u_shortcut.clone()) {
                //     log::error!("Failed to register shortcut: {}", e);
                // } else {
                //     log::info!("Successfully registered Ctrl+Alt+U shortcut");
                // }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![handle_shortcut, shortcut_pressed])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
