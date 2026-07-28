import { isTauri } from "@tauri-apps/api/core";
import { invoke } from "@tauri-apps/api/core";

/** Keep the desktop Dock/window icon aligned with RuneChat's selected theme. */
export async function syncDesktopIcon(isDark: boolean): Promise<void> {
  if (!isTauri()) return;

  try {
    await invoke("set_macos_dock_icon", { dark: isDark });
  } catch {
    // Icon changes are decorative. The compile-time default remains available.
  }
}
