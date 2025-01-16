use serde::{Deserialize, Serialize};
use std::fs::{self, File, Permissions};
use std::io::Write;
use std::os::unix::fs::PermissionsExt; // for setting file permissions on Unix-like systems
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Deserialize)]
struct ShortcutParams {
    shortcut: String,
    name: String,
}

#[derive(Serialize)]
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

    let file_path = dir_path.join(format!("{}.json", shortcut.name));

    log::info!("New shortcut save: {:?}", shortcut.name);

    let mut file = File::create(file_path).expect("Failed to create file");
    file.write_all(json.as_bytes())
        .expect("Failed to write to file");

    shortcut.id
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
        .setup(|_app| {
            log::info!("Application started :)");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![handle_shortcut])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
