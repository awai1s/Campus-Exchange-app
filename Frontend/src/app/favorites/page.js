// File: src/app/favorites/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "@/app/components/ListingCard";
import { apiFetch } from "@/lib/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setNeedLogin(true);
        setLoading(false);
        return;
      }

      try {
        // GET /api/v1/favorites/  (apiFetch must attach Authorization)
        const favs = await apiFetch("/favorites/");

        if (!Array.isArray(favs) || favs.length === 0) {
          setFavorites([]);
        } else {
          // Fetch listing details in parallel
          const ids = [...new Set(favs.map(f => f.listing_id).filter(Boolean))];
          const results = await Promise.all(
            ids.map(id => apiFetch(`/listings/${id}`).catch(() => null))
          );
          setFavorites(results.filter(Boolean));
        }
      } catch (e) {
        const msg = typeof e?.message === "string" ? e.message : "Failed to load favorites";
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

  if (loading) return <p className="text-center">Loading your favorites...</p>;

  if (needLogin) {
    return (
      <p className="text-center text-gray-500">
        Please{" "}
        <Link className="underline" href="/auth/login">
          log in
        </Link>{" "}
        to view your favorites.
      </p>
    );
  }

  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  if (!favorites || favorites.length === 0) {
    return <p className="text-center text-gray-500">No favorites yet. Add items to your wishlist!</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Favorites</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {favorites.map(listing => (
          <ListingCard key={listing.id} listing={listing} showFavoriteToggle />
        ))}
      </div>
    </div>
  );
}
