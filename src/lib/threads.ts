import { supabase } from "./supabase";

export type ChatRole = "user" | "assistant";

export type StoredMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type Thread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

const INDEX_KEY = "hibalag:threads:v1";
const threadKey = (id: string) => `hibalag:thread:${id}`;

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function titleFromMessage(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "Bag-ong chat";
  return clean.length > 46 ? `${clean.slice(0, 46)}…` : clean;
}

/* ---------------------------------- local --------------------------------- */

function readIndex(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const parsed = raw ? (JSON.parse(raw) as Thread[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIndex(threads: Thread[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(threads));
  } catch {
    /* ignore */
  }
}

function localListThreads(): Thread[] {
  return readIndex().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function localReadMessages(id: string): StoredMessage[] {
  try {
    const raw = localStorage.getItem(threadKey(id));
    const parsed = raw ? (JSON.parse(raw) as StoredMessage[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function localSave(thread: Thread, messages: StoredMessage[]) {
  const index = readIndex().filter((t) => t.id !== thread.id);
  writeIndex([thread, ...index]);
  try {
    localStorage.setItem(threadKey(thread.id), JSON.stringify(messages));
  } catch {
    /* ignore */
  }
}

function localDelete(id: string) {
  writeIndex(readIndex().filter((t) => t.id !== id));
  try {
    localStorage.removeItem(threadKey(id));
  } catch {
    /* ignore */
  }
}

/* ---------------------------------- cloud --------------------------------- */

type CloudThreadRow = { id: string; title: string; created_at: string; updated_at: string };
type CloudMessageRow = { id: string; role: ChatRole; content: string; created_at: string };

async function cloudListThreads(): Promise<Thread[]> {
  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as CloudThreadRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

async function cloudReadMessages(threadId: string): Promise<StoredMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as CloudMessageRow[]).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  }));
}

async function cloudSave(userId: string, thread: Thread, messages: StoredMessage[]) {
  const { error: threadError } = await supabase.from("chat_threads").upsert({
    id: thread.id,
    user_id: userId,
    title: thread.title,
    created_at: thread.createdAt,
    updated_at: thread.updatedAt,
  });
  if (threadError) throw threadError;

  if (messages.length === 0) return;
  const { error: messageError } = await supabase.from("chat_messages").upsert(
    messages.map((message) => ({
      id: message.id,
      thread_id: thread.id,
      user_id: userId,
      role: message.role,
      content: message.content,
      created_at: message.createdAt,
    })),
    { onConflict: "id" },
  );
  if (messageError) throw messageError;
}

async function cloudDelete(id: string) {
  await supabase.from("chat_messages").delete().eq("thread_id", id);
  const { error } = await supabase.from("chat_threads").delete().eq("id", id);
  if (error) throw error;
}

/* --------------------------------- adapter -------------------------------- */

export type ThreadStore = {
  mode: "local" | "cloud";
  list: () => Promise<Thread[]>;
  read: (id: string) => Promise<StoredMessage[]>;
  save: (thread: Thread, messages: StoredMessage[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
  rename: (thread: Thread, title: string) => Promise<void>;
};

/** One storage surface for guests (localStorage) and signed-in users (cloud). */
export function createThreadStore(userId: string | null): ThreadStore {
  if (!userId) {
    return {
      mode: "local",
      list: async () => localListThreads(),
      read: async (id) => localReadMessages(id),
      save: async (thread, messages) => localSave(thread, messages),
      remove: async (id) => localDelete(id),
      rename: async (thread, title) =>
        localSave({ ...thread, title, updatedAt: new Date().toISOString() }, localReadMessages(thread.id)),
    };
  }

  return {
    mode: "cloud",
    list: cloudListThreads,
    read: cloudReadMessages,
    save: (thread, messages) => cloudSave(userId, thread, messages),
    remove: cloudDelete,
    rename: async (thread, title) => {
      const { error } = await supabase
        .from("chat_threads")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", thread.id);
      if (error) throw error;
    },
  };
}

export function hasLocalThreads() {
  return localListThreads().length > 0;
}

/** Copies guest threads into the signed-in account, then clears the local copies. */
export async function migrateLocalThreads(userId: string) {
  const threads = localListThreads();
  for (const thread of threads) {
    try {
      await cloudSave(userId, thread, localReadMessages(thread.id));
      localDelete(thread.id);
    } catch {
      /* keep local copy when the cloud write fails */
    }
  }
  return threads.length;
}
