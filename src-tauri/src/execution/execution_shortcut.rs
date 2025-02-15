use serde::Deserialize;
use serde::Serialize;

use crate::definition::action::{ActionParameters, ActionScope, ActionType};
use crate::definition::shortcut::Shortcut;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecutionShortcut {
    pub id: String,
    pub key_combination: String,
    pub command_name: String,
    pub enabled: bool,
    pub actions: Vec<ExecutionAction>,
    pub scope: Option<ActionScope>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecutionAction {
    pub action_type: ActionType,
    pub parameters: ActionParameters,
}

impl From<Shortcut> for ExecutionShortcut {
    fn from(shortcut: Shortcut) -> Self {
        Self {
            id: shortcut.id,
            key_combination: shortcut.key_combination,
            command_name: shortcut.command_name,
            enabled: shortcut.enabled,
            actions: shortcut
                .actions
                .into_iter()
                .map(|action| ExecutionAction {
                    action_type: action.action_type,
                    parameters: action.parameters,
                })
                .collect(),
            scope: shortcut.scope,
        }
    }
}
