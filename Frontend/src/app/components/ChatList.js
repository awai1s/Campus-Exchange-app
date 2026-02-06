"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

/**
 * Lists the user's chat rooms and notifies parent via onSelectChat(roomId)
 */
export default function ChatList({ onSelectChat }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [needLogin, setNeedLogin] = useState(false);

  // track the current poll to cancel it on unmount / rerun
  const pollRef = useRef({ abort: () => {} });

  const hasToken = useMemo(
    () => (typeof window !== "undefined" ? !!localStorage.getItem("token") : false),
    []
  );

  const stopPolling = useCallback(() => {
    try {
      pollRef.current.abort?.();
    } catch {}
  }, []);

  const loadRooms = useCallback(async () => {
    setErr("");
    if (!hasToken) {
      setNeedLogin(true);
      setLoading(false);
      return;
    }

    // abortable request (prevents “signal is aborted without reason” on route changes)
    const controller = new AbortController();
    pollRef.current = controller;

    try {
      const data = await apiFetch("/chat/rooms", {
        cache: "no-store",
        signal: controller.signal,
      });
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = String(e?.message || "Failed to load chat rooms");
      // if auth error, hint login
      if (msg.includes("401") || /unauth/i.test(msg)) setNeedLogin(true);
      setErr(msg);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [hasToken]);

  useEffect(() => {
    let stopped = false;

    (async () => {
      await loadRooms();
      // 30s polling
      const id = setInterval(() => {
        if (!stopped) loadRooms();
      }, 30000);
      pollRef.current.cleanup = () => clearInterval(id);
    })();

    return () => {
      stopped = true;
      stopPolling();
      pollRef.current.cleanup?.();
    };
  }, [loadRooms, stopPolling]);

  const refresh = () => {
    setLoading(true);
    loadRooms();
  };

  if (loading) return <div className="p-4">Loading chats…</div>;

  if (needLogin)
    return (
      <div className="p-4 text-gray-400">
        Please{" "}
        <Link className="underline" href="/auth/login">
          log in
        </Link>{" "}
        to view your chats.
      </div>
    );

  if (err)
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">Error: {err}</div>
        <button
          onClick={refresh}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
        >
          Retry
        </button>
      </div>
    );

  if (!rooms.length) return <div className="p-4">No chats yet.</div>;

  return (
    <ul className="divide-y divide-gray-800 rounded border border-gray-800">
      {rooms.map((r) => {
        const id = r.id ?? r.room_id ?? r._id;
        const peer =
          r?.peer_user?.name ??
          r?.peer_user?.email ??
          r?.peer?.name ??
          r?.peer?.email ??
          r?.title ??
          r?.room_name ??
          "Chat";
        const lastMsg =
          r?.last_message?.text ??
          r?.last_message?.body ??
          (typeof r?.last_message === "string" ? r.last_message : "") ??
          "";

        return (
          <li
            key={id}
            className="p-4 cursor-pointer hover:bg-gray-800/40"
            onClick={() => id && onSelectChat?.(id)}
          >
            <div className="font-semibold">{peer}</div>
            {lastMsg && (
              <div className="text-sm text-gray-400 line-clamp-1">{lastMsg}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
