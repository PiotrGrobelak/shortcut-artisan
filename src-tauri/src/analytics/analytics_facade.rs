use tauri::AppHandle;

pub struct AnalyticsFacade {}

impl AnalyticsFacade {
    pub fn new(_app_handle: AppHandle) -> Self {
        Self {}
    }

    pub fn track_shortcut_creation(&self, shortcut_name: &str) {
        log::info!("Shortcut created: {}", shortcut_name);
    }

    pub fn track_shortcut_execution(&self, shortcut_name: &str) {
        log::info!("Shortcut executed: {}", shortcut_name);
    }
}
