"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

/**
 * Chat room UI:
 * - GET  /api/v1/chat/rooms/{room_id}/messages
 * - POST /api/v1/chat/rooms/{room_id}/messages   (text message)
 *   If your backend expects a specific key, keep "text" and it’ll work; we also
 *   send {body, content} as the same value to be extra compatible.
 */
export default function ChatConversation({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const bottomRef = useRef(null);

  const roomPath = useMemo(
    () => `/chat/rooms/${encodeURIComponent(chatId)}`,
    [chatId]
  );

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(async () => {
    setErr("");
    try {
      const data = await apiFetch(`${roomPath}/messages`, { cache: "no-store" });
      // Accept both direct arrays or {messages: [...]}
      const list = Array.isArray(data) ? data : data?.messages || [];
      setMessages(list);
    } catch (e) {
      setErr(String(e?.message || "Failed to load messages"));
    } finally {
      setLoading(false);
      // allow DOM to paint before scrolling
      setTimeout(scrollToBottom, 50);
    }
  }, [roomPath, scrollToBottom]);

  useEffect(() => {
    let stop = false;

    (async () => {
      setLoading(true);
      await loadMessages();
      // simple polling for new messages (every 5s)
      const id = setInterval(() => !stop && loadMessages(), 5000);
      return () => clearInterval(id);
    })();

    return () => {
      stop = true;
    };
  }, [loadMessages]);

  async function handleSend(e) {
    e?.preventDefault?.();
    if (!text.trim() || sending) return;

    const payload = {
      text,            // most backends accept "text"
      body: text,      // fallback key
      content: text,   // another fallback key
    };

    setSending(true);
    setErr("");

    // optimistic append
    const temp = {
      id: `tmp-${Date.now()}`,
      text,
      mine: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    setText("");
    scrollToBottom();

    try {
      const saved = await apiFetch(`${roomPath}/messages`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Replace the temp message with server version if it returns one
      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((m) => m.id === temp.id);
        if (idx !== -1) copy[idx] = saved || copy[idx];
        return copy;
      });
    } catch (e) {
      setErr(String(e?.message || "Failed to send"));
      // rollback optimistic append
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      setText(temp.text);
    } finally {
      setSending(false);
      scrollToBottom();
    }
  }

  // ------- UI -------
  if (loading) return <div className="p-4">Loading conversation…</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] border border-gray-800 rounded">
      {/* Error line (non-blocking) */}
      {err ? (
        <div className="px-4 py-2 text-sm text-red-500 border-b border-gray-800">
          {err}
        </div>
      ) : null}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const mine = m.mine || m.is_mine || m.sender?.is_me || m.sender === "You";
          const body = m.text ?? m.body ?? m.content ?? m.message ?? "";
          const ts = m.created_at ?? m.timestamp;

          return (
            <div
              key={m.id || `${ts}-${Math.random()}`}
              className={`max-w-[70%] px-3 py-2 rounded whitespace-pre-wrap break-words ${
                mine
                  ? "ml-auto bg-blue-600 text-white"
                  : "mr-auto bg-gray-800 text-gray-100"
              }`}
            >
              <div>{body}</div>
              {ts ? (
                <div className="mt-1 text-[10px] opacity-70">
                  {new Date(ts).toLocaleString()}
                </div>
              ) : null}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-800 flex gap-2">
        <input
          className="flex-1 rounded bg-gray-900 border border-gray-700 px-3 py-2 outline-none"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSend(e);
          }}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
