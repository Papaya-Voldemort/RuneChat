#[cfg(desktop)]
use tauri_plugin_shell::ShellExt;

#[tauri::command]
fn set_macos_dock_icon(app: tauri::AppHandle, dark: bool) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let icon = if dark {
            include_bytes!("../icons/RuneChat-dark.png").as_slice()
        } else {
            include_bytes!("../icons/RuneChat.png").as_slice()
        };

        app.run_on_main_thread(move || {
            use objc2::{AllocAnyThread, MainThreadMarker};
            use objc2_app_kit::{NSApplication, NSImage};
            use objc2_foundation::NSData;

            let main_thread = unsafe { MainThreadMarker::new_unchecked() };
            let application = NSApplication::sharedApplication(main_thread);
            let data = NSData::with_bytes(icon);
            if let Some(image) = NSImage::initWithData(NSImage::alloc(), &data) {
                unsafe { application.setApplicationIconImage(Some(&image)) };
            }
        }).map_err(|error| error.to_string())?;
    }

    #[cfg(not(target_os = "macos"))]
    let _ = (app, dark);

    Ok(())
}

#[cfg(desktop)]
fn start_api_sidecar(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    app.shell()
        .sidecar("runechat-server")?
        .env("HOST", "127.0.0.1")
        .env("PORT", "3000")
        .spawn()?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![set_macos_dock_icon])
        .setup(|_app| {
            #[cfg(desktop)]
            start_api_sidecar(_app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running RuneChat");
}
