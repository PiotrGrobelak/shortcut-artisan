use serde::{Deserialize, Serialize};
use std::fs::{self, File, Permissions};
use std::io::Write;
use std::os::unix::fs::PermissionsExt; // for setting file permissions on Unix-like systems
use tauri::AppHandle;
use tauri::Emitter;
use tauri::{Manager, Runtime};
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut as TauriShortcut, ShortcutState,
};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
struct Shortcut2 {
    key_combination: String,
    command_name: String,
}

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
async fn register_shortcut(
    app_handle: tauri::AppHandle,
    shortcut: String,
    command_name: String,
) -> Result<(), String> {
    // TODO: get keys from shortcut
    let ctrl_alt_u_shortcut =
        TauriShortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyU);

    if app_handle
        .global_shortcut()
        .is_registered(ctrl_alt_u_shortcut)
    {
        log::info!("Unregistering existing shortcut: {}", shortcut);
        app_handle
            .global_shortcut()
            .unregister(ctrl_alt_u_shortcut)
            .map_err(|e| e.to_string())
            .expect("Failed to unregister shortcut");
    }

    match app_handle
        .global_shortcut()
        .register(ctrl_alt_u_shortcut)
        .map_err(|e| e.to_string())
    {
        Ok(_) => {
            log::info!(
                "Successfully registered shortcut: {} for command: {}",
                shortcut,
                command_name
            );
            Ok(())
        }
        Err(e) => {
            log::error!("Failed to register shortcut: {} - Error: {}", shortcut, e);
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
            // Register shortcut
            register_shortcut(
                app.handle().clone(),
                shortcut.key_combination,
                shortcut.command_name,
            )
            .await
            .map_err(|e| e.to_string())
        })?;
    }

    Ok(())
}

#[tauri::command]
async fn shortcut_pressed(shortcut: String) -> String {
    log::info!("Shortcut pressed: {}", shortcut);
    shortcut
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    log::info!(
                        "Shortcut detected: {:?}, State: {:?}",
                        shortcut,
                        event.state()
                    );

                    let ctrl_alt_u_shortcut =
                        TauriShortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyU);

                    if shortcut == &ctrl_alt_u_shortcut {
                        match event.state() {
                            ShortcutState::Pressed => {
                                log::info!("Ctrl-N Pressed!");
                                let _ =
                                    app.emit("shortcut-triggered", "Ctrl-N Pressed!".to_string());
                            }
                            ShortcutState::Released => {
                                log::info!("Ctrl-N Released!");
                                let _ =
                                    app.emit("shortcut-triggered", "Ctrl-N Released!".to_string());
                            }
                        }
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![shortcut_pressed, save_shortcut])
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
