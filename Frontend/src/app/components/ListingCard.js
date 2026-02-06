"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, MessageCircle, ShoppingCart } from "lucide-react"
import { toImageUrl, apiFetch } from "@/lib/api"
import { useMemo, useState } from "react"

export default function ListingCard({ listing, showFavoriteToggle = false }) {
  const [isFavorite, setIsFavorite] = useState(!!listing?.is_favorite)

  const firstPath = useMemo(() => {
    console.log("[v0] ListingCard listing data:", listing)
    const path = Array.isArray(listing?.images) && listing.images.length ? listing.images[0] : listing?.image || ""
    console.log("[v0] Selected image path:", path)
    return path
  }, [listing])

  const [imgSrc, setImgSrc] = useState(firstPath ? toImageUrl(firstPath) : "/placeholder.png")

  const toggleFavorite = async () => {
    try {
      await apiFetch(`/favorites/${listing.id}`, { method: "POST" })
      setIsFavorite((prev) => !prev)
    } catch (err) {
      console.error("Error toggling favorite:", err)
    }
  }

  const price =
    typeof Intl !== "undefined"
      ? new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(
          Number(listing?.price ?? 0),
        )
      : `Rs ${Number(listing?.price ?? 0).toLocaleString("en-PK")}`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden relative group">
      {showFavoriteToggle && (
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-600 transition"
          aria-label="Toggle favorite"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
        </button>
      )}

      {/* Make the whole visual area a link */}
      <Link href={`/listing/${listing.id}`} className="block focus:outline-none focus:ring-2 focus:ring-blue-500">
        <div className="relative h-40">
          <Image
            src={imgSrc || "/placeholder.svg"}
            alt={listing?.title ?? "Listing image"}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            onError={(e) => {
              console.log("[v0] Image failed to load:", imgSrc)
              console.log("[v0] Error details:", e)
              setImgSrc("/placeholder.png")
            }}
            unoptimized
          />
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{listing?.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{listing?.category}</p>
          <p className="text-lg font-bold text-blue-500">{price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{listing?.description}</p>
        </div>
      </Link>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 pb-4 -mt-2">
        <Link
          href={`/listing/${listing.id}`}
          className="flex-1 text-center py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          View
        </Link>
        <Link
          href={`/chat?toId=${encodeURIComponent(
            listing?.seller_id ?? listing?.owner_id ?? "",
          )}&listingId=${listing.id}`}
          className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          title="Chat with seller"
        >
          <MessageCircle className="w-5 h-5" />
        </Link>
        <Link
          href={`/listing/${listing.id}#buy`}
          className="p-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
          title="Buy / Make offer"
        >
          <ShoppingCart className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}
