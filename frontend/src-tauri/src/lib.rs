use tauri::Manager;
use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Log plugin for debug mode
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
                println!("Social Scheduler Desktop (Dev Mode)");
                println!("Note: Start backend manually with 'cd backend && npm run dev'");
            } else {
                // Production mode: spawn Node.js with bundled backend
                println!("Social Scheduler Desktop starting...");
                
                let app_handle = app.handle().clone();
                
                // Get resource path for backend
                let resource_path = app.path().resource_dir()
                    .expect("Failed to get resource directory");
                let backend_path = resource_path.join("resources/backend/backend.cjs");
                
                // Get app data directory for database
                let app_data_dir = app.path().app_data_dir()
                    .expect("Failed to get app data directory");
                let data_dir = app_data_dir.join("data");
                std::fs::create_dir_all(&data_dir).expect("Failed to create data directory");
                
                let uploads_dir = app_data_dir.join("uploads");
                std::fs::create_dir_all(&uploads_dir).expect("Failed to create uploads directory");
                
                // Spawn Node.js sidecar with backend
                let shell = app_handle.shell();
                let sidecar = shell.sidecar("node")
                    .expect("Failed to create Node.js sidecar")
                    .args([backend_path.to_string_lossy().to_string()])
                    .env("DATABASE_PATH", data_dir.join("scheduler.db").to_string_lossy().to_string())
                    .env("UPLOADS_DIR", uploads_dir.to_string_lossy().to_string())
                    .env("PORT", "3001")
                    .env("NODE_ENV", "production");

                tauri::async_runtime::spawn(async move {
                    match sidecar.spawn() {
                        Ok((mut rx, _child)) => {
                            println!("✅ Backend started successfully!");
                            while let Some(event) = rx.recv().await {
                                match event {
                                    tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
                                        println!("Backend: {}", String::from_utf8_lossy(&line));
                                    }
                                    tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
                                        eprintln!("Backend Error: {}", String::from_utf8_lossy(&line));
                                    }
                                    _ => {}
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("❌ Failed to start backend: {}", e);
                        }
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

