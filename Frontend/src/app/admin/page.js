'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) { setNeedLogin(true); return; }

    (async () => {
      try {
        const me = await apiFetch('/auth/me');
        if (me?.email) setEmail(me.email);

        // ✅ If already verified → redirect away
        if (me?.is_verified) {
          router.replace('/browse');
        }
      } catch {
        setNeedLogin(true);
      }
    })();
  }, [router]);

  async function handleRequest(e) {
    e.preventDefault();
    setMsg('');
    setSubmitting(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const tokenType = typeof window !== 'undefined'
      ? (localStorage.getItem('token_type') || 'JWT')
      : 'JWT';

    if (!token) { setNeedLogin(true); setSubmitting(false); return; }

    try {
      await apiFetch('/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${tokenType} ${token}`,
        },
        body: JSON.stringify({
          university_email: email,
          student_id: studentId,
        }),
      });

      setMsg('Request submitted. Check your email for the OTP. Redirecting…');
      setTimeout(() => router.push('/auth/verify/otp'), 600);
    } catch (e) {
      const m = String(e?.message || '');
      if (m.includes('401') || m.includes('403') || /not authenticated/i.test(m)) {
        setNeedLogin(true);
        setMsg('Session expired. Please log in again.');
      } else {
        setMsg(m || 'Request failed.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (needLogin) {
    return (
      <p className="text-center text-gray-500">
        Please <Link className="underline" href="/auth/login">log in</Link> to request verification access.
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Request Verification / Access</h1>

      <form onSubmit={handleRequest} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">University Email</label>
          <input
            type="email"
            className="w-full rounded px-3 py-2 bg-gray-800 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Student ID</label>
          <input
            type="text"
            className="w-full rounded px-3 py-2 bg-gray-800 text-white"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded px-4 py-3 font-semibold"
        >
          {submitting ? 'Sending…' : 'Send Request'}
        </button>
      </form>

      {msg && (
        <p className={`text-center ${/redirect|submitted|otp/i.test(msg) ? 'text-green-500' : 'text-red-500'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}