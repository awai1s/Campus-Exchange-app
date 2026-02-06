// File: src/app/components/TopNav.js
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function TopNav() {
  const [me, setMe] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Try to load current user if we have a token
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    (async () => {
      try {
        const user = await apiFetch('/auth/me', { cache: 'no-store' });
        setMe(user || null);
      } catch {
        // if token invalid, clear it
        localStorage.removeItem('token');
        setMe(null);
      }
    })();
  }, []);

  function logout() {
    localStorage.removeItem('token');
    setMe(null);
    if (typeof window !== 'undefined') window.location.href = '/';
  }

  const avatarLetter = (me?.name?.[0] || me?.email?.[0] || 'U').toUpperCase();

  return (
    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link href="/">University Marketplace</Link>
        </h1>

        <nav className="hidden md:flex items-center gap-5">
          <Link
            href="/browse"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Browse
          </Link>

          <Link
            href="/favorites"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Favorites
          </Link>
          <Link
            href="/notifications"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Notifications
          </Link>

          {me ? (
            <>
              <Link
                href="/my-listings"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                My Listings
              </Link>
              <Link
                href="/create-listing"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Create Listing
              </Link>
              <Link
                href="/chat"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Chat
              </Link>
              {me && !me?.is_verified && (
                <Link
                    href="/admin"
                    className="text-sm font-medium text-yellow-400 hover:text-yellow-500"
                >
                    Admin
                </Link>
                )}

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white grid place-items-center font-semibold"
                  aria-label="Profile menu"
                >
                  {avatarLetter}
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black/5 py-1"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      <div className="font-semibold">{me?.name || 'User'}</div>
                      <div className="text-gray-500 dark:text-gray-300 truncate">
                        {me?.email}
                      </div>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-600" />
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/my-listings"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Listings
                    </Link>
                    <Link
                      href="/chat"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      Messages
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Login
              </Link>
              <Link
                href="/auth/sign-up"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile minimal items */}
        <div className="md:hidden">
          <Link
            href="/browse"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Browse
          </Link>
          {me ? (
            <Link
              href="/chat"
              className="ml-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Chat
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="ml-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
