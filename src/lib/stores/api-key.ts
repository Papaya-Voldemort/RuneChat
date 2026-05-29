import { writable } from 'svelte/store';

function createApiKeyStore() {
  // Load from localStorage if available, with migration from old keys.
  let initialKey = '';
  if (typeof localStorage !== 'undefined') {
    const savedKey = localStorage.getItem('runechat_api_key');
    const legacyKey = localStorage.getItem('hcai_api_key');
    initialKey = savedKey || legacyKey || '';
    if (!savedKey && legacyKey) {
      localStorage.setItem('runechat_api_key', legacyKey);
    }
  }

  const { subscribe, set, update } = writable(initialKey);

  return {
    subscribe,
    set: (key: string) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('runechat_api_key', key);
      }
      set(key);
    },
    load: () => {
      if (typeof localStorage !== 'undefined') {
        const savedKey = localStorage.getItem('runechat_api_key');
        const legacyKey = localStorage.getItem('hcai_api_key');
        const key = savedKey || legacyKey || '';
        if (!savedKey && legacyKey) {
          localStorage.setItem('runechat_api_key', legacyKey);
        }
        set(key);
      }
    },
  };
}

export const apiKey = createApiKeyStore();
