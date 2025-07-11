use serde::{Deserialize, Serialize};

// 数据结构定义
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalRecord {
    pub id: String,
    pub title: String,
    pub content: String,
    pub images: Vec<String>,
    pub music_url: Option<String>,
    pub music_title: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub is_sealed: bool,
    pub seal_until: Option<String>,
    pub auto_destroy_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SealConfig {
    pub seal_until: Option<String>,
    pub auto_destroy_at: Option<String>,
}

// Tauri 命令
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_app_data_dir() -> Result<String, String> {
    // 简化版本，返回固定路径
    Ok("pick-up-memories".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![greet, get_app_data_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
