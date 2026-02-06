// File: src/app/notifications/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, CheckCircle, Tag } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      // require auth
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setNeedLogin(true);
        setLoading(false);
        return;
      }

      try {
        // GET /api/v1/notifications?skip=&limit=&unread_only=
        const params = new URLSearchParams({
          skip: "0",
          limit: "50",
          unread_only: "false",
        });
        const data = await apiFetch(`/notifications?${params.toString()}`);

        setNotifications(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg = e?.message || "Failed to fetch notifications";
        if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
          setNeedLogin(true);
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p className="text-center">Loading notifications...</p>;

  if (needLogin)
    return (
      <p className="text-center text-gray-500">
        Please{" "}
        <Link href="/auth/login" className="underline">
          log in
        </Link>{" "}
        to view notifications.
      </p>
    );

  if (error) return <p className="text-center text-red-500">{error}</p>;

  if (!notifications.length)
    return <p className="text-center text-gray-500">No notifications yet.</p>;

  const iconMap = {
    message: <MessageSquare className="w-5 h-5 text-blue-500" />,
    offer: <Tag className="w-5 h-5 text-green-500" />,
    verification: <CheckCircle className="w-5 h-5 text-purple-500" />,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((n) => (
          <li key={n.id} className="flex items-center gap-3 py-3">
            {iconMap[n.type] || <Bell className="w-5 h-5 text-gray-500" />}
            <div>
              <p className="font-medium">{n.title || n.type}</p>
              <p className="text-sm text-gray-500">{n.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
