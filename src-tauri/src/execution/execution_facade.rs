use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut as TauriShortcut, ShortcutState,
};

pub struct ExecutionFacade {
    key_combination: String,
    command_name: String,
}

impl ExecutionFacade {
    pub fn new(key_combination: &str, command_name: &str) -> Self {
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
