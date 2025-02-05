use std::fs::{self};
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Runtime;
use tauri_plugin_global_shortcut::ShortcutEvent;
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut as TauriShortcut, ShortcutState,
};

use crate::config::AppConfig;
use crate::definition::shortcut::Shortcut;

pub struct ExecutionFacade<R: Runtime> {
    app_handle: AppHandle<R>,
}

impl<R: Runtime> ExecutionFacade<R> {
    pub fn new(app_handle: AppHandle<R>) -> Self {
        Self { app_handle }
    }

    pub fn parse_shortcut(&self, key_combination: &str) -> Option<TauriShortcut> {
        let parts: Vec<String> = key_combination
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

    pub async fn register_system_shortcut(
        &self,
        tauri_shortcut: TauriShortcut,
    ) -> Result<(), String> {
        if self
            .app_handle
            .global_shortcut()
            .is_registered(tauri_shortcut)
        {
            log::info!("Unregistering existing shortcut: {}", tauri_shortcut);
            self.app_handle
                .global_shortcut()
                .unregister(tauri_shortcut)
                .map_err(|e| e.to_string())
                .expect("Failed to unregister shortcut");
        }

        match self
            .app_handle
            .global_shortcut()
            .register(tauri_shortcut)
            .map_err(|e| e.to_string())
        {
            Ok(_) => {
                log::info!("Successfully registered shortcut: {} ", tauri_shortcut,);
                Ok(())
            }
            Err(e) => {
                log::error!("Failed to register shortcut: {} ", tauri_shortcut,);
                Err(e)
            }
        }
    }
    pub fn handle_shortcut_event(&self, shortcut: &TauriShortcut, event: ShortcutEvent) {
        log::info!(
            "Shortcut detected: {:?}, State: {:?}",
            shortcut,
            event.state()
        );

        match self.load_and_check_shortcut(shortcut) {
            Ok(true) => {
                if let Err(e) = self.emit_shortcut_event(shortcut, event.state()) {
                    log::error!("Failed to emit shortcut event: {}", e);
                }
            }
            Ok(false) => {
                log::info!("Shortcut didn't match current configuration");
            }
            Err(e) => {
                log::error!("Error processing shortcut: {}", e);
            }
        }
    }

    fn load_and_check_shortcut(&self, shortcut: &TauriShortcut) -> Result<bool, String> {
        let config = AppConfig::global().lock().unwrap();
        let file_path = &config.settings_file;

        if !file_path.exists() {
            return Err("No shortcut file found!".to_string());
        }

        let content = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
        let shortcuts: Vec<Shortcut> = serde_json::from_str(&content).map_err(|e| e.to_string())?;

        for shortcut_config in shortcuts {
            log::info!("Checking shortcut: {}", shortcut_config.command_name);

            if let Some(tauri_shortcut) = self.parse_shortcut(&shortcut_config.key_combination) {
                log::info!("Comparing Tauri shortcut: {:?}", tauri_shortcut);

                if shortcut == &tauri_shortcut {
                    return Ok(true);
                }
            }
        }

        // No matching shortcut found
        Ok(false)
    }

    pub fn emit_shortcut_event(
        &self,
        shortcut: &TauriShortcut,
        state: ShortcutState,
    ) -> Result<(), String> {
        match state {
            ShortcutState::Pressed => {
                log::info!("Shortcut pressed: {:?}", shortcut);
                return self
                    .app_handle
                    .emit("shortcut-triggered", "Shortcut Pressed!")
                    .map_err(|e| e.to_string());
            }
            ShortcutState::Released => {
                log::info!("Shortcut released: {:?}", shortcut);
                return self
                    .app_handle
                    .emit("shortcut-triggered", "Shortcut Released!")
                    .map_err(|e| e.to_string());
            }
        }
    }
}
