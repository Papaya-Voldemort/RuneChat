export type ChatRole = "user" | "assistant" | (string & {});

export interface ChatMessagePart {
  type: string;
  text: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  parts: ChatMessagePart[];
  timestamp: string;
  [key: string]: unknown;
}

export interface ChatRecord<TMessage extends ChatMessage = ChatMessage> {
  id: string;
  title: string;
  messages: TMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface CreateChatInput<TMessage extends ChatMessage = ChatMessage> {
  id?: string;
  title?: string;
  messages?: TMessage[];
  metadata?: Record<string, unknown>;
}

export interface ListChatsOptions {
  newestFirst?: boolean;
  limit?: number;
}

export interface ChatStorageOptions {
  dbName?: string;
  storeName?: string;
  version?: number;
  now?: () => string;
  makeId?: () => string;
}

type ChatPatch<TMessage extends ChatMessage> = Partial<
  Omit<ChatRecord<TMessage>, "id" | "createdAt" | "updatedAt">
>;
type TransactionMode = "readonly" | "readwrite";

interface IdbNameList {
  contains(name: string): boolean;
}

interface IdbRequest<T> {
  result: T;
  error: Error | null;
  onsuccess: (() => void) | null;
  onerror: (() => void) | null;
}

interface IdbOpenRequest extends IdbRequest<IdbDatabase> {
  transaction?: IdbTransaction;
  onupgradeneeded: (() => void) | null;
  onblocked: (() => void) | null;
}

interface IdbObjectStore {
  get<T = unknown>(key: string): IdbRequest<T>;
  getAll<T = unknown>(): IdbRequest<T[]>;
  put(value: unknown): IdbRequest<unknown>;
  delete(key: string): IdbRequest<unknown>;
  clear(): IdbRequest<unknown>;
  count(): IdbRequest<number>;
  createIndex(name: string, keyPath: string, options?: { unique?: boolean }): void;
  indexNames: IdbNameList;
}

interface IdbTransaction {
  objectStore(name: string): IdbObjectStore;
  abort(): void;
  error: Error | null;
  oncomplete: (() => void) | null;
  onerror: (() => void) | null;
  onabort: (() => void) | null;
  readyState?: string;
}

interface IdbDatabase {
  objectStoreNames: IdbNameList;
  createObjectStore(name: string, options?: { keyPath?: string }): IdbObjectStore;
  transaction(name: string, mode: TransactionMode): IdbTransaction;
  close(): void;
  onversionchange: (() => void) | null;
}

interface IdbFactory {
  open(name: string, version?: number): IdbOpenRequest;
}

function defaultNow(): string {
  return new Date().toISOString();
}

function defaultMakeId(): string {
  const globalCrypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (typeof globalCrypto?.randomUUID === "function") {
    return globalCrypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class IndexedChatStorage<TMessage extends ChatMessage = ChatMessage> {
  private readonly dbName: string;
  private readonly storeName: string;
  private readonly version: number;
  private readonly now: () => string;
  private readonly makeId: () => string;
  private dbPromise: Promise<IdbDatabase> | null = null;

  constructor(options: ChatStorageOptions = {}) {
    this.dbName = options.dbName ?? "runechat";
    this.storeName = options.storeName ?? "chats";
    this.version = options.version ?? 1;
    this.now = options.now ?? defaultNow;
    this.makeId = options.makeId ?? defaultMakeId;
  }

  async createChat(input: CreateChatInput<TMessage> = {}): Promise<ChatRecord<TMessage>> {
    const timestamp = this.now();
    const chat: ChatRecord<TMessage> = {
      id: input.id ?? this.makeId(),
      title: input.title?.trim() || "New chat",
      messages: input.messages ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
      metadata: input.metadata,
    };

    await this.writeChat(chat);
    return chat;
  }

  async getChat(id: string): Promise<ChatRecord<TMessage> | null> {
    return this.withStore("readonly", async (store) => {
      const chat = await this.request<ChatRecord<TMessage> | undefined>(store.get(id));
      return chat ?? null;
    });
  }

  async getAllChats(options: ListChatsOptions = {}): Promise<ChatRecord<TMessage>[]> {
    const { newestFirst = true, limit } = options;
    const allChats = await this.withStore("readonly", async (store) =>
      this.request<ChatRecord<TMessage>[]>(store.getAll()),
    );

    allChats.sort((a, b) =>
      newestFirst
        ? b.updatedAt.localeCompare(a.updatedAt)
        : a.updatedAt.localeCompare(b.updatedAt),
    );

    return typeof limit === "number" ? allChats.slice(0, limit) : allChats;
  }

  async countChats(): Promise<number> {
    return this.withStore("readonly", async (store) => this.request<number>(store.count()));
  }

  async searchChats(search: string, options: ListChatsOptions = {}): Promise<ChatRecord<TMessage>[]> {
    const query = search.trim().toLowerCase();
    if (!query) return this.getAllChats(options);

    const chats = await this.getAllChats(options);
    return chats.filter((chat) => chat.title.toLowerCase().includes(query));
  }

  async updateChat(id: string, patch: ChatPatch<TMessage>): Promise<ChatRecord<TMessage>> {
    return this.withStore("readwrite", async (store) => {
      const existing = await this.getChatOrThrow(store, id);
      const next: ChatRecord<TMessage> = {
        ...existing,
        ...patch,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: this.now(),
      };

      await this.request(store.put(next));
      return next;
    });
  }

  async upsertChat(chat: ChatRecord<TMessage>): Promise<ChatRecord<TMessage>> {
    const timestamp = this.now();
    const next: ChatRecord<TMessage> = {
      ...chat,
      id: chat.id || this.makeId(),
      title: chat.title?.trim() || "New chat",
      createdAt: chat.createdAt || timestamp,
      updatedAt: timestamp,
      messages: chat.messages ?? [],
    };

    await this.writeChat(next);
    return next;
  }

  async deleteChat(id: string): Promise<boolean> {
    return this.withStore("readwrite", async (store) => {
      const exists = await this.request<ChatRecord<TMessage> | undefined>(store.get(id));
      if (!exists) return false;
      await this.request(store.delete(id));
      return true;
    });
  }

  async clearChats(): Promise<void> {
    await this.withStore("readwrite", async (store) => {
      await this.request(store.clear());
    });
  }

  async replaceMessages(chatId: string, messages: TMessage[]): Promise<ChatRecord<TMessage>> {
    return this.updateChat(chatId, { messages });
  }

  async addMessage(chatId: string, message: TMessage): Promise<ChatRecord<TMessage>> {
    return this.withStore("readwrite", async (store) => {
      const chat = await this.getChatOrThrow(store, chatId);
      chat.messages = [...chat.messages, message];
      chat.updatedAt = this.now();
      await this.request(store.put(chat));
      return chat;
    });
  }

  async appendMessages(chatId: string, messages: TMessage[]): Promise<ChatRecord<TMessage>> {
    return this.withStore("readwrite", async (store) => {
      const chat = await this.getChatOrThrow(store, chatId);
      chat.messages = [...chat.messages, ...messages];
      chat.updatedAt = this.now();
      await this.request(store.put(chat));
      return chat;
    });
  }

  async updateMessage(
    chatId: string,
    messageId: string,
    patch: Partial<Omit<TMessage, "id">>,
  ): Promise<ChatRecord<TMessage>> {
    return this.withStore("readwrite", async (store) => {
      const chat = await this.getChatOrThrow(store, chatId);
      const idx = chat.messages.findIndex((message) => message.id === messageId);
      if (idx === -1) {
        throw new Error(`Message "${messageId}" was not found in chat "${chatId}".`);
      }
      const currentMessage = chat.messages[idx];
      if (!currentMessage) {
        throw new Error(`Message "${messageId}" was not found in chat "${chatId}".`);
      }

      chat.messages[idx] = {
        ...currentMessage,
        ...patch,
        id: currentMessage.id,
      } as TMessage;
      chat.updatedAt = this.now();
      await this.request(store.put(chat));
      return chat;
    });
  }

  async deleteMessage(chatId: string, messageId: string): Promise<ChatRecord<TMessage>> {
    return this.withStore("readwrite", async (store) => {
      const chat = await this.getChatOrThrow(store, chatId);
      const nextMessages = chat.messages.filter((message) => message.id !== messageId);
      if (nextMessages.length === chat.messages.length) {
        throw new Error(`Message "${messageId}" was not found in chat "${chatId}".`);
      }

      chat.messages = nextMessages;
      chat.updatedAt = this.now();
      await this.request(store.put(chat));
      return chat;
    });
  }

  private async writeChat(chat: ChatRecord<TMessage>): Promise<void> {
    await this.withStore("readwrite", async (store) => {
      await this.request(store.put(chat));
    });
  }

  private async withStore<T>(
    mode: TransactionMode,
    run: (store: IdbObjectStore) => Promise<T> | T,
  ): Promise<T> {
    const db = await this.getDb();
    const tx = db.transaction(this.storeName, mode);
    const store = tx.objectStore(this.storeName);

    try {
      const result = await run(store);
      await this.waitForTransaction(tx);
      return result;
    } catch (error) {
      if (tx.readyState !== "done") {
        tx.abort();
      }
      throw error;
    }
  }

  private async getChatOrThrow(store: IdbObjectStore, id: string): Promise<ChatRecord<TMessage>> {
    const chat = await this.request<ChatRecord<TMessage> | undefined>(store.get(id));
    if (!chat) throw new Error(`Chat "${id}" was not found.`);
    return chat;
  }

  private async getDb(): Promise<IdbDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IdbDatabase>((resolve, reject) => {
      const idb = (globalThis as { indexedDB?: IdbFactory }).indexedDB;
      if (!idb) {
        reject(new Error("IndexedDB is not available in this environment."));
        return;
      }

      const request = idb.open(this.dbName, this.version);

      request.onupgradeneeded = () => {
        const db = request.result;
        const hasStore = db.objectStoreNames.contains(this.storeName);
        const store = hasStore
          ? request.transaction?.objectStore(this.storeName)
          : db.createObjectStore(this.storeName, { keyPath: "id" });

        if (!store) {
          reject(new Error("Could not initialize chat store."));
          return;
        }

        if (!store.indexNames.contains("updatedAt")) {
          store.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
      request.onblocked = () =>
        reject(new Error("IndexedDB open was blocked. Close other tabs and try again."));
    });

    return this.dbPromise;
  }

  private request<T>(request: IdbRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
    });
  }

  private waitForTransaction(tx: IdbTransaction): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error ?? new Error("IndexedDB transaction failed."));
      tx.onabort = () =>
        reject(tx.error ?? new Error("IndexedDB transaction was aborted."));
    });
  }
}

export function createChatStorage<TMessage extends ChatMessage = ChatMessage>(
  options: ChatStorageOptions = {},
): IndexedChatStorage<TMessage> {
  return new IndexedChatStorage<TMessage>(options);
}

export const chatStorage = createChatStorage();
