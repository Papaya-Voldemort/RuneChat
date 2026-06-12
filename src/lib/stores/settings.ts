import { writable } from "svelte/store";

export const selectedModel = writable<string>(
  typeof localStorage !== "undefined"
    ? localStorage.getItem("runechat_model") || "google/gemini-3.1-flash-lite"
    : "google/gemini-3.1-flash-lite",
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
}
