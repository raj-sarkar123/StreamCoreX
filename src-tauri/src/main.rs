// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn open_downloads_folder() -> Result<String, String> {
    if let Some(user_dirs) = directories::UserDirs::new() {
        let downloads = user_dirs.download_dir().unwrap_or(user_dirs.home_dir());
        #[cfg(target_os = "windows")]
        {
            std::process::Command::new("explorer")
                .arg(downloads)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
        #[cfg(target_os = "macos")]
        {
            std::process::Command::new("open")
                .arg(downloads)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
        #[cfg(target_os = "linux")]
        {
            std::process::Command::new("xdg-open")
                .arg(downloads)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
        Ok("Opened downloads folder".to_string())
    } else {
        Err("Could not locate user downloads directory".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_downloads_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
