use tauri::AppHandle;

pub struct AnalyticsFacade {
    app_handle: AppHandle,
}

impl AnalyticsFacade {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    pub fn track_shortcut_creation(&self, shortcut_name: &str) {
        log::info!("Shortcut created: {}", shortcut_name);
    }

    pub fn track_shortcut_execution(&self, shortcut_name: &str) {
        log::info!("Shortcut executed: {}", shortcut_name);
    }
}
