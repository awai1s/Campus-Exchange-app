'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/auth/me', { cache: 'no-store' });
        setMe(data || null);
      } catch (e) {
        setErr('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="p-6">Loading profile…</p>;
  if (err) return <p className="p-6 text-red-500">{err}</p>;
  if (!me) return <p className="p-6">No profile found. Please login again.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-3 bg-white dark:bg-gray-800 shadow">
        <div>
          <p className="text-gray-500 text-sm">Name</p>
          <p className="font-medium">{me.name || '—'}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="font-medium">{me.email}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">User ID</p>
          <p className="font-mono text-sm">{me.id || me.user_id || '—'}</p>
        </div>

        {me.role && (
          <div>
            <p className="text-gray-500 text-sm">Role</p>
            <p className="font-medium">{me.role}</p>
          </div>
        )}
      </div>
    </div>
  );
}
