// src/app/chat/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatList from '../components/ChatList';
import ChatConversation from '../components/ChatConversation';
import { ensureRoomWithSeller } from '@/lib/chat';

export default function ChatPage() {
  const router = useRouter();
  const search = useSearchParams();

  const [selectedChatId, setSelectedChatId] = useState(null);
  const [starting, setStarting] = useState(false);
  const [startErr, setStartErr] = useState('');

  function cleanQuery() {
    const url = new URL(window.location.href);
    ['room', 'start', 'listing', 'toId', 'listingId'].forEach((k) =>
      url.searchParams.delete(k)
    );
    window.history.replaceState(null, '', url.toString());
  }

  useEffect(() => {
    // ?room=<id> → open directly
    const room = search.get('room');
    if (room) {
      setSelectedChatId(room);
      cleanQuery();
      return;
    }

    // ?start=<sellerUserId>&listing=<listingId> (legacy: ?toId= &listingId=)
    let seller = search.get('start') || search.get('toId');
    let listing = search.get('listing') || search.get('listingId');

    if (!seller) return;

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/auth/login');
      return;
    }

    let cancelled = false;
    (async () => {
      setStarting(true);
      setStartErr('');
      try {
        const roomObj = await ensureRoomWithSeller({
          sellerUserId: seller,
          listingId: listing || undefined,
        });
        const id = roomObj?.id || roomObj?.room_id;
        if (!cancelled) {
          if (!id) {
            setStartErr('Not Found');
          } else {
            setSelectedChatId(String(id));
          }
          cleanQuery();
        }
      } catch (e) {
        if (!cancelled) {
          setStartErr(String(e?.message || 'Failed to start chat'));
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, search]);

  return (
    <div className="container mx-auto p-4 flex gap-4">
      <div className="w-full md:w-1/3">
        <h1 className="text-2xl font-bold mb-4">Chats</h1>

        {startErr && (
          <div className="text-red-500 mb-3 whitespace-pre-line">{startErr}</div>
        )}
        {starting && (
          <div className="text-sm text-gray-400 mb-3">Starting chat…</div>
        )}

        <ChatList onSelectChat={setSelectedChatId} />
      </div>

      <div className="hidden md:block w-2/3">
        {starting ? (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <p className="text-gray-400">Starting chat…</p>
          </div>
        ) : selectedChatId ? (
          <ChatConversation chatId={selectedChatId} />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
