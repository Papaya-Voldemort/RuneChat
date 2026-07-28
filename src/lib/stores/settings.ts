import { writable } from "svelte/store";
import { syncDesktopIcon } from "../functions/desktop-icon";

export const selectedModel = writable<string>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("runechat_model") || "openai/gpt-5.6-luna"
    : "openai/gpt-5.6-luna",
);

export const selectedPersona = writable<string>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("runechat_persona") || "jules"
    : "jules",
);

export const customSystemPrompt = writable<string>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("runechat_custom_prompt") || ""
    : "",
);

export const customModelId = writable<string>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("runechat_custom_model") || ""
    : "",
);

export const maxTokens = writable<string>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("runechat_max_tokens") || "4096"
    : "4096",
);

export const userProfileName = writable<string>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("runechat_user_profile_name") || ""
    : "",
);
export const userProfileAbout = writable<string>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("runechat_user_profile_about") || ""
    : "",
);

export const enableLayoutPreviews = writable<boolean>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("runechat_enable_layouts") !== "false"
    : true,
);

export const theme = writable<boolean>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("theme") !== "light"
    : true,
);

if (typeof localStorage !== "undefined") {
  selectedModel.subscribe((val) => localStorage.setItem("runechat_model", val));
  selectedPersona.subscribe((val) =>
    localStorage.setItem("runechat_persona", val),
  );
  customSystemPrompt.subscribe((val) =>
    localStorage.setItem("runechat_custom_prompt", val),
  );

  customModelId.subscribe((val) =>
    localStorage.setItem("runechat_custom_model", val),
  );

  maxTokens.subscribe((val) =>
    localStorage.setItem("runechat_max_tokens", val),
  );

  userProfileName.subscribe((val) =>
    localStorage.setItem("runechat_user_profile_name", val),
  );
  userProfileAbout.subscribe((val) =>
    localStorage.setItem("runechat_user_profile_about", val),
  );
  enableLayoutPreviews.subscribe((val) =>
    localStorage.setItem("runechat_enable_layouts", val ? "true" : "false"),
  );

  theme.subscribe((isDark) => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem("theme", isDark ? "dark" : "light");
    void syncDesktopIcon(isDark);
  });
}
