use super::ExecutionFacade;
use tauri::{plugin::TauriPlugin, Runtime};

pub fn setup_global_shortcut_plugin<R: Runtime>() -> TauriPlugin<R> {
    tauri_plugin_global_shortcut::Builder::new()
        .with_handler(move |app, shortcut, event| {
            let execution_facade = ExecutionFacade::new(app.clone());
            execution_facade.handle_shortcut_event(shortcut, event);
        })
        .build()
}
