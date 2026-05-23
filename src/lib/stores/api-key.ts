import { writable } from 'svelte/store';

function createApiKeyStore() {
  // Load from localStorage if available
  let initialKey = '';
  if (typeof localStorage !== 'undefined') {
    initialKey = localStorage.getItem('hcai_api_key') || '';
  }

  const { subscribe, set, update } = writable(initialKey);

  return {
    subscribe,
    set: (key: string) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hcai_api_key', key);
      }
      set(key);
    },
    load: () => {
      if (typeof localStorage !== 'undefined') {
        const key = localStorage.getItem('hcai_api_key') || '';
        set(key);
      }
    },
  };
}

export const apiKey = createApiKeyStore();
