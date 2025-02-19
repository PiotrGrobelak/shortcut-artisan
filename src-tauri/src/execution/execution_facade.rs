use std::fs::{self};
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Runtime;
use tauri_plugin_global_shortcut::ShortcutEvent;
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut as TauriShortcut, ShortcutState,
};

use super::execution_shortcut::{ExecutionAction, ExecutionShortcut};
use crate::config::AppConfig;
use crate::definition::action::ActionType;
use dirs;
use std::path::Path;
use std::process::Command;

pub struct ExecutionFacade<R: Runtime> {
    app_handle: AppHandle<R>,
    shortcut_cache: Vec<ExecutionShortcut>,
}

impl<R: Runtime> ExecutionFacade<R> {
    pub fn new(app_handle: AppHandle<R>) -> Self {
        let shortcuts = match Self::load_shortcuts_from_file() {
            Ok(shortcuts) => shortcuts,
            Err(e) => {
                log::error!("Failed to load shortcuts from file: {}", e);
                Vec::new()
            }
        };
        Self {
            app_handle,
            shortcut_cache: shortcuts,
        }
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

    pub fn register_system_shortcut(&self, tauri_shortcut: TauriShortcut) -> Result<(), String> {
        if self
            .app_handle
            .global_shortcut()
            .is_registered(tauri_shortcut)
        {
            log::info!("Unregistering existing shortcut: {}", tauri_shortcut);
            self.app_handle
                .global_shortcut()
                .unregister(tauri_shortcut)
                .map_err(|e| e.to_string())?;
        }

        match self.app_handle.global_shortcut().register(tauri_shortcut) {
            Ok(_) => {
                log::info!("Successfully registered shortcut: {}", tauri_shortcut);
                Ok(())
            }
            Err(e) => {
                log::error!("Failed to register shortcut: {}", tauri_shortcut);
                Err(e.to_string())
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
        for shortcut_config in &self.shortcut_cache {
            if let Some(tauri_shortcut) = self.parse_shortcut(&shortcut_config.key_combination) {
                if shortcut == &tauri_shortcut {
                    return Ok(true);
                }
            }
        }
        Ok(false)
    }

    pub fn load_shortcuts_at_startup(&self) -> Result<(), String> {
        for shortcut in &self.shortcut_cache {
            let tauri_shortcut =
                self.parse_shortcut(&shortcut.key_combination)
                    .ok_or_else(|| {
                        log::error!("Invalid shortcut: {}", shortcut.command_name);
                        shortcut.command_name.to_string()
                    })?;

            self.register_system_shortcut(tauri_shortcut)?;
        }
        Ok(())
    }
    fn load_shortcuts_from_file() -> Result<Vec<ExecutionShortcut>, String> {
        let config = AppConfig::global().lock().unwrap();
        let content = fs::read_to_string(&config.settings_file).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    }
    pub fn emit_shortcut_event(
        &self,
        shortcut: &TauriShortcut,
        state: ShortcutState,
    ) -> Result<(), String> {
        match state {
            ShortcutState::Pressed => {
                log::info!("Shortcut pressed: {:?}", shortcut);

                if let Some(execution_shortcut) = self.shortcut_cache.iter().find(|s| {
                    if let Some(parsed_shortcut) = self.parse_shortcut(&s.key_combination) {
                        &parsed_shortcut == shortcut
                    } else {
                        false
                    }
                }) {
                    log::info!("Shortcut: {:?}", execution_shortcut.key_combination);
                    self.execute_actions(&execution_shortcut.actions)?;
                } else {
                    log::error!("No matching shortcut found in cache");
                    return Err("No matching shortcut found in cache".to_string());
                }

                self.app_handle
                    .emit("shortcut-triggered", "Shortcut Pressed!")
                    .map_err(|e| e.to_string())
            }
            ShortcutState::Released => {
                log::info!("Shortcut released: {:?}", shortcut);
                self.app_handle
                    .emit("shortcut-triggered", "Shortcut Released!")
                    .map_err(|e| e.to_string())
            }
        }
    }

    fn execute_actions(&self, actions: &[ExecutionAction]) -> Result<(), String> {
        for action in actions {
            match action.action_type {
                ActionType::OpenFolder => {
                    log::info!(
                        "OpenFolder action: {:?} : {:?}",
                        action.action_type,
                        action.parameters.path
                    );
                    if let Some(path) = &action.parameters.path {
                        let expanded_path = if path.starts_with('~') {
                            if let Some(home_dir) = dirs::home_dir() {
                                home_dir.join(&path[2..]).to_string_lossy().to_string()
                            } else {
                                path.to_string()
                            }
                        } else {
                            path.to_string()
                        };

                        Command::new("xdg-open")
                            .arg(&expanded_path)
                            .spawn()
                            .map_err(|e| {
                                log::error!(
                                    "Failed to execute xdg-open for {}: {}",
                                    expanded_path,
                                    e
                                );
                                e.to_string()
                            })?;
                    } else {
                        log::error!("No path specified for OpenFolder action");
                        return Err("No path specified for OpenFolder action".to_string());
                    }
                }
                ActionType::OpenFile => {
                    if let Some(path) = &action.parameters.path {
                        Command::new("xdg-open")
                            .arg(path)
                            .spawn()
                            .map_err(|e| e.to_string())?;
                    } else {
                        log::error!("No path specified for OpenFile action");
                        return Err("No path specified for OpenFile action".to_string());
                    }
                }
                ActionType::OpenApplication => {
                    if let Some(app_name) = &action.parameters.app_name {
                        Command::new(app_name).spawn().map_err(|e| e.to_string())?;
                    }
                }
                ActionType::RunShellScript => {
                    if let Some(script) = &action.parameters.script {
                        Command::new("sh")
                            .arg("-c")
                            .arg(script)
                            .spawn()
                            .map_err(|e| e.to_string())?;
                    }
                }
                _ => {
                    log::info!(
                        "Action type {:?} doesn't require command execution",
                        action.action_type
                    );
                }
            }
        }
        Ok(())
    }
}
