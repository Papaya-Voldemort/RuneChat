import { writable } from "svelte/store";

export type Role = "user" | "assistant";

export type MessagePart =
  | { type: "reasoning"; text: string }
  | { type: "text"; text: string };

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
  timestamp: string;
}

const KEY = "messages";

function load(): Message[] {
  if (typeof localStorage === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

const initial: Message[] = load();

export const messages = writable<Message[]>(initial);

messages.subscribe((value) => {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(KEY, JSON.stringify(value));
});