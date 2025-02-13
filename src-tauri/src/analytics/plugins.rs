use tauri::plugin::TauriPlugin;
use tauri::Runtime;
pub fn setup_logging_plugin<R: Runtime>() -> TauriPlugin<R> {
    tauri_plugin_log::Builder::new()
        .clear_targets()
        .format(|out, message, record| {
            let color = match record.level() {
                log::Level::Error => "\x1b[31m",
                log::Level::Warn => "\x1b[33m",
                log::Level::Info => "\x1b[94m",
                log::Level::Debug => "\x1b[36m",
                log::Level::Trace => "\x1b[35m",
            };
            let reset = "\x1b[0m";
            out.finish(format_args!(
                "{}[{}][{}] {}{}",
                color,
                record.level(),
                record.target(),
                message,
                reset
            ))
        })
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
        .build()
}
