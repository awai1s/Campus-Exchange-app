// File: src/app/my-listings/page.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ListingCard from '@/app/components/ListingCard';
import { apiFetch } from '@/lib/api';

const toViewModel = (item) => ({
  ...item,
  image:
    (Array.isArray(item.images) && item.images[0]) ||
    item.image ||
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMTgxODIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PHRleHQgeD0iNTAiIHk9IjE1MCIgZmlsbD0iI2JiYiIgc3R5bGU9ImZvbnQ6IDE2cHggL2ludGVyOyI+Tm8gaW1hZ2U8L3RleHQ+PC9zdmc+',
});

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setNeedLogin(true);
        setLoading(false);
        return;
      }

      try {
        // get current user
        const me = await apiFetch('/auth/me');

        // If your backend supports filtering: `/listings?owner_id=${me.id}`
        // Otherwise, fetch all and filter client-side:
        const data = await apiFetch('/listings');
        const all = Array.isArray(data) ? data : data.items || data.listings || [];
        const mine = all.filter((x) => String(x.owner_id ?? x.user_id) === String(me?.id));

        setListings(mine.map(toViewModel));
      } catch (e) {
        const msg =
          typeof e === 'string'
            ? e
            : e?.message || e?.detail || 'Failed to load your listings';
        if (/401|unauthorized/i.test(String(msg))) {
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

  if (loading) return <p className="text-center">Loading your listings...</p>;

  if (needLogin)
    return (
      <p className="text-center text-gray-500">
        Please <Link href="/auth/login" className="underline">log in</Link> to view your listings.
      </p>
    );

  if (error) return <p className="text-center text-red-500">{String(error)}</p>;

  if (!listings.length)
    return <p className="text-center text-gray-500">You haven’t posted any listings yet.</p>;

  const Active = listings.filter((i) => i.status === 'active' || i.status === 'ACTIVE' || !i.status);
  const Sold = listings.filter((i) => i.status === 'sold' || i.status === 'SOLD');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Listings</h1>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'active' ? 'border-blue-500 font-semibold' : 'border-transparent text-gray-500'}`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('sold')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'sold' ? 'border-blue-500 font-semibold' : 'border-transparent text-gray-500'}`}
        >
          Sold
        </button>
      </div>

      {activeTab === 'active' && (
        <div className="grid gap-4 md:grid-cols-3">
          {Active.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      )}

      {activeTab === 'sold' && (
        <div className="grid gap-4 md:grid-cols-3">
          {Sold.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      )}
    </div>
  );
}
