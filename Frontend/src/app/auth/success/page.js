// File: src/app/auth/success/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { apiFetch } from '@/lib/api';

export default function Success() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          // not logged in → bounce to login
          router.push('/auth/login');
          return;
        }

        // GET /api/v1/users/verification-status (auth required)
        const status = await apiFetch('/users/verification-status');
        // Adjust property name if your backend returns a different shape
        setIsVerified(Boolean(status?.verified ?? status?.is_verified ?? false));
      } catch {
        // if the call fails, treat as not verified
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="max-w-md w-full text-center">
          <p>Checking verification…</p>
        </Card>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-600 dark:text-yellow-400">Verification Pending</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn’t confirm your verification yet. Please try uploading your student ID again.
          </p>
          <Link href="/auth/verify/id-upload" className="block">
            <Button variant="primary" className="w-full">Upload ID</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">
          Verification Successful!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your account has been verified. You are now ready to explore the University Marketplace!
        </p>
        <Link href="/browse" className="block">
          <Button variant="primary" className="w-full">Start Browsing</Button>
        </Link>
      </Card>
    </div>
  );
}
