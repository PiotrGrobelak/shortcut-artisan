use serde::Deserialize;

#[derive(Deserialize)]
pub struct ExecutionShortcut {
    pub key_combination: String,
    pub command_name: String,
}
