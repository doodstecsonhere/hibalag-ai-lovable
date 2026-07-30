import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, Loader2, WifiOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import type { Language } from "@/hooks/use-hibalag";
import { useI18n } from "@/lib/i18n-context";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  createThreadStore,
  titleFromMessage,
  type StoredMessage,
  type Thread,
} from "@/lib/threads";

const SUGGESTION_KEYS: TranslationKey[] = [
  "chat.suggestion1",
  "chat.suggestion2",
  "chat.suggestion3",
  "chat.suggestion4",
  "chat.suggestion5",
];

function messageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}


type ChatPanelProps = {
  threadId: string;
  initialMessages: UIMessage[];
  language: Language;
  online: boolean;
  userId: string | null;
  onThreadSaved: () => void;
};

export function ChatPanel({
  threadId,
  initialMessages,
  language,
  online,
  userId,
  onThreadSaved,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const store = useMemo(() => createThreadStore(userId), [userId]);
  const { t } = useI18n();


  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { language },
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (busy || messages.length === 0) return;
    const stored: StoredMessage[] = messages.map((message, index) => ({
      id: message.id ?? `${threadId}-${index}`,
      role: message.role === "assistant" ? "assistant" : "user",
      content: messageText(message),
      createdAt: new Date(Date.now() + index).toISOString(),
    }));
    const now = new Date().toISOString();
    const thread: Thread = {
      id: threadId,
      title: titleFromMessage(stored.find((m) => m.role === "user")?.content ?? ""),
      createdAt: stored[0]?.createdAt ?? now,
      updatedAt: now,
    };
    void store
      .save(thread, stored)
      .then(onThreadSaved)
      .catch(() => undefined);
  }, [messages, busy, store, threadId, onThreadSaved]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage({ text: value });
  };

  return (
    <section className="flex h-full min-h-0 flex-col" aria-label={t("chat.aria")}>
      {!online ? (
        <div className="flex items-center gap-2 bg-muted px-4 py-2 text-xs text-muted-foreground">
          <WifiOff className="size-3.5" aria-hidden />
          {t("chat.offlineBanner")}
        </div>
      ) : null}

      <div ref={scrollRef} className="scrollbar-slim smooth-scroll-y min-h-0 flex-1 px-4 py-5">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-md py-8 text-center">
            <h1 className="font-display text-2xl font-semibold">{t("chat.welcomeTitle")}</h1>
            <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
              {t("chat.welcomeBody")}
            </p>
          </div>

        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "animate-rise max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-[var(--shadow-elev)]",
                      isUser
                        ? "bg-bubble-user text-bubble-user-foreground rounded-br-md"
                        : "bg-bubble-ai text-bubble-ai-foreground rounded-bl-md border border-border/70",
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{messageText(message)}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-headings:font-display prose-p:my-2 prose-ul:my-2 prose-strong:text-foreground dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {messageText(message) || "…"}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {busy ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" aria-hidden /> {t("chat.thinking")}
              </div>
            ) : null}
            {error ? <p className="text-xs text-destructive">{t("chat.error")}</p> : null}

          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border/70 bg-card/80 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="scrollbar-slim -mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
          {SUGGESTION_KEYS.map((key) => {
            const suggestion = t(key);
            return (
              <button
                key={key}
                type="button"
                disabled={busy}
                onClick={() => submit(suggestion)}
                className="min-h-11 shrink-0 rounded-full border border-border bg-background px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                {suggestion}
              </button>
            );
          })}

        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(input);
              }
            }}
            rows={1}
            placeholder={t("chat.placeholder")}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-sm"
          />

          <Button type="submit" size="icon" className="size-11 rounded-2xl" disabled={busy || !input.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
            <span className="sr-only">{t("chat.send")}</span>
          </Button>
        </form>
      </div>
    </section>
  );
}
