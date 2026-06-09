import { get, writable } from "svelte/store";
import { chatStorage, type ChatMessage, type ChatRecord } from "./chat-db";

export type Role = "user" | "assistant";

export type MessagePart =
  | { type: "reasoning"; text: string }
  | { type: "text"; text: string };

export interface Message extends ChatMessage {
  role: Role;
  parts: MessagePart[];
}

type Chat = ChatRecord<Message>;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const ACTIVE_CHAT_KEY = "runechat-active-chat-id";
const LEGACY_MESSAGES_KEY = "messages";
const DEFAULT_CHAT_TITLE = "New Chat";
const SAVE_DEBOUNCE_MS = 120;

let initialized = false;
let initPromise: Promise<void> | null = null;
let hydratingMessages = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let pendingMessages: Message[] | null = null;

export const chats = writable<Chat[]>([]);
export const activeChatId = writable<string | null>(null);
export const messages = writable<Message[]>([]);
export const draftPrompt = writable<string>("");

function getStorage(): StorageLike | null {
  const storage = (globalThis as { localStorage?: StorageLike }).localStorage;
  return storage ?? null;
}

function getStoredActiveChatId(): string | null {
  const storage = getStorage();
  if (!storage) return null;

  return storage.getItem(ACTIVE_CHAT_KEY);
}

function setStoredActiveChatId(id: string | null): void {
  const storage = getStorage();
  if (!storage) return;

  if (!id) {
    storage.removeItem(ACTIVE_CHAT_KEY);
    return;
  }

  storage.setItem(ACTIVE_CHAT_KEY, id);
}

function normalizeTitle(title?: string): string {
  return title?.trim() || DEFAULT_CHAT_TITLE;
}

function loadLegacyMessages(): Message[] {
  const storage = getStorage();
  if (!storage) return [];

  const raw = storage.getItem(LEGACY_MESSAGES_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Message[]) : [];
  } catch {
    return [];
  }
}

function clearLegacyMessages(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(LEGACY_MESSAGES_KEY);
}

function cloneMessages(input: Message[]): Message[] {
  return JSON.parse(JSON.stringify(input)) as Message[];
}

function setMessagesFromChat(chat: Chat): void {
  hydratingMessages = true;
  messages.set(chat.messages ?? []);
  hydratingMessages = false;
}

async function refreshChats(): Promise<Chat[]> {
  const all = (await chatStorage.getAllChats({ newestFirst: true })) as Chat[];
  chats.set(all);
  return all;
}

async function ensureActiveChat(): Promise<Chat> {
  const all = await refreshChats();
  const storedId = getStoredActiveChatId();

  let next = storedId ? all.find((chat) => chat.id === storedId) ?? null : null;
  if (!next) {
    const legacyMessages = all.length ? [] : loadLegacyMessages();
    next =
      all[0] ??
      ((await chatStorage.createChat({
        title: DEFAULT_CHAT_TITLE,
        messages: legacyMessages,
      })) as Chat);

    if (legacyMessages.length) {
      clearLegacyMessages();
    }
  }

  activeChatId.set(next.id);
  setStoredActiveChatId(next.id);
  setMessagesFromChat(next);
  await refreshChats();

  return next;
}

async function persistMessagesNow(nextMessages: Message[]): Promise<void> {
  const currentChatId = get(activeChatId);
  if (!currentChatId) return;

  await chatStorage.updateChat(currentChatId, { messages: nextMessages });
  await refreshChats();
}

function schedulePersist(nextMessages: Message[]): void {
  pendingMessages = cloneMessages(nextMessages);

  if (persistTimer) {
    clearTimeout(persistTimer);
  }

  persistTimer = setTimeout(() => {
    const toPersist = pendingMessages;
    pendingMessages = null;
    persistTimer = null;

    if (!toPersist) return;
    void persistMessagesNow(toPersist);
  }, SAVE_DEBOUNCE_MS);
}

async function flushPendingPersist(): Promise<void> {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }

  const toPersist = pendingMessages;
  pendingMessages = null;
  if (!toPersist) return;

  await persistMessagesNow(toPersist);
}

messages.subscribe((value) => {
  if (!initialized || hydratingMessages) return;
  schedulePersist(value);
});

export async function initializeChatStore(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await ensureActiveChat();
    initialized = true;
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
}

export async function selectChat(chatId: string): Promise<void> {
  await initializeChatStore();
  await flushPendingPersist();

  const chat = (await chatStorage.getChat(chatId)) as Chat | null;
  if (!chat) return;

  activeChatId.set(chat.id);
  setStoredActiveChatId(chat.id);
  setMessagesFromChat(chat);
  await refreshChats();
}

export async function createNewChat(title?: string): Promise<void> {
  await initializeChatStore();
  await flushPendingPersist();

  const chat = (await chatStorage.createChat({
    title: normalizeTitle(title),
    messages: [],
  })) as Chat;

  activeChatId.set(chat.id);
  setStoredActiveChatId(chat.id);
  setMessagesFromChat(chat);
  await refreshChats();
}

export async function renameChat(chatId: string, title: string): Promise<void> {
  await initializeChatStore();
  await chatStorage.updateChat(chatId, { title: normalizeTitle(title) });
  await refreshChats();
}

export async function deleteChat(chatId: string): Promise<void> {
  await initializeChatStore();
  await flushPendingPersist();

  const deleted = await chatStorage.deleteChat(chatId);
  if (!deleted) return;

  const remaining = await refreshChats();
  if (get(activeChatId) !== chatId) return;

  const next =
    remaining[0] ??
    ((await chatStorage.createChat({
      title: DEFAULT_CHAT_TITLE,
      messages: [],
    })) as Chat);

  activeChatId.set(next.id);
  setStoredActiveChatId(next.id);
  setMessagesFromChat(next);
  await refreshChats();
}

void initializeChatStore();
