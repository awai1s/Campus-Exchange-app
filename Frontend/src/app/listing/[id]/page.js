// src/app/listings/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch, toImageUrl } from '@/lib/api';
import { ensureRoomWithSeller } from '@/lib/chat'; // ← helper that creates/gets a room
import { Button } from '@/app/components/Button';   // optional (use a plain <button> if you prefer)

export default function ListingDetail() {
  const router = useRouter();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [seller, setSeller] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  // button-local state
  const [startingChat, setStartingChat] = useState(false);
  const [chatErr, setChatErr] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr('');
      try {
        // GET /api/v1/listings/:id
        const res = await apiFetch(`/listings/${id}`);
        if (cancelled) return;
        setData(res || null);

        // Try to load seller profile if the payload exposes an id/email
        const sellerId = res?.seller_id ?? res?.owner_id ?? res?.user_id ?? null;
        if (sellerId) {
          try {
            const s = await apiFetch(`/users/${sellerId}`).catch(() => null);
            if (!cancelled && s) setSeller(s);
          } catch {
            /* ignore */
          }
        }
      } catch (e) {
        if (!cancelled) setErr(e?.message || 'Failed to fetch listing');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function startChat() {
    setChatErr('');
    setStartingChat(true);
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const sellerUserId =
        data?.seller_id ?? data?.owner_id ?? data?.user_id ?? null;
      if (!sellerUserId) {
        setChatErr('Cannot determine seller for this listing.');
        return;
      }

      const room = await ensureRoomWithSeller({
        sellerUserId,
        listingId: data?.id || id,
      });

      const roomId = room?.id || room?.room_id;
      if (!roomId) {
        setChatErr('Could not open chat room.');
        return;
      }

      router.push(`/chat?room=${encodeURIComponent(roomId)}`);
    } catch (e) {
      setChatErr(String(e?.message || 'Could not start chat'));
    } finally {
      setStartingChat(false);
    }
  }

  if (loading) return <div className="p-6">Loading listing…</div>;
  if (err) return <div className="p-6 text-red-500">Error: {err}</div>;
  if (!data) return <div className="p-6">Listing not found.</div>;

  const images = Array.isArray(data.images)
    ? data.images
    : data.image
    ? [data.image]
    : [];
  const cover = images.length ? toImageUrl(images[0]) : '/placeholder.png';
  const price =
    typeof Intl !== 'undefined'
      ? new Intl.NumberFormat('en-PK', {
          style: 'currency',
          currency: 'PKR',
          maximumFractionDigits: 0,
        }).format(Number(data.price ?? 0))
      : `Rs ${Number(data.price ?? 0).toLocaleString('en-PK')}`;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-[460px] h-[280px] md:h-[340px] rounded-lg overflow-hidden bg-black/5">
          <Image
            src={cover}
            alt={data.title || 'Listing image'}
            fill
            className="object-cover"
            unoptimized
            sizes="(max-width:768px) 100vw, 460px"
          />
        </div>

        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <div className="text-gray-500">Category: {data.category || '—'}</div>
          <div className="text-2xl font-extrabold text-blue-600">{price}</div>

          {/* seller capsule */}
          <div className="mt-4 rounded-lg border border-gray-200/40 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-500">Seller</div>
            <div className="font-medium">
              {seller?.name ||
                data?.seller_name ||
                data?.owner_name ||
                'Seller'}
            </div>
            <div className="text-sm text-gray-500">
              {seller?.email || data?.seller_email || ''}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="primary"
              onClick={startChat}
              disabled={startingChat}
              className="px-4 py-2"
            >
              {startingChat ? 'Starting…' : 'Message Seller'}
            </Button>

            {/* Anchor so any card “Buy” button can jump here if you scroll */}
            <a id="buy" />

            {/* For now, Buy → open chat as well (you can replace with a real flow later) */}
            <Button
              onClick={startChat}
              disabled={startingChat}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
            >
              {startingChat ? 'Opening…' : 'Buy / Make Offer'}
            </Button>
          </div>

          {chatErr && <p className="text-red-500 text-sm">{chatErr}</p>}
        </div>
      </div>

      {/* description */}
      <div className="prose prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="leading-7 whitespace-pre-wrap">
          {data.description || 'No description.'}
        </p>
      </div>

      {/* Optional: link back to browse */}
      <div>
        <Link href="/browse" className="text-blue-400 underline">
          ← Back to listings
        </Link>
      </div>
    </div>
  );
}
