// File: src/app/browse/page.js
"use client"

import { useState, useEffect } from "react"
import SearchBar from "../components/SearchBar"
import CategoryTabs from "../components/CategoryTabs"
import ListingGrid from "../components/ListingGrid"
import Pagination from "../components/Pagination"
import { apiFetch } from "@/lib/api"

const toViewModel = (item) => {
  console.log("[v0] Converting item to view model:", item)

  const viewModel = {
    ...item,
    image: (Array.isArray(item.images) && item.images[0]) || item.image || null, // Don't use SVG placeholder here, let ListingCard handle it
  }

  console.log("[v0] View model result:", viewModel)
  return viewModel
}

export default function Browse() {
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [category, setCategory] = useState("")
  const [query, setQuery] = useState("")
  const [error, setError] = useState(null)

  const pageSize = 6

  const fetchListings = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        size: String(pageSize),
        sort_by: "created_at",
        sort_order: "desc",
      })
      if (query) params.set("q", query)
      if (category) params.set("category", category)

      // âœ… correct endpoint
      const data = await apiFetch(`/listings/search?${params.toString()}`)

      // normalize possible shapes
      const items = data.items || data.results || data.listings || []
      const total = data.total ?? data.count ?? items.length

      setListings(items.map(toViewModel))
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)))
    } catch (e) {
      // graceful fallback: try plain index if search isnâ€™t available
      try {
        const data = await apiFetch("/listings")
        const items = Array.isArray(data) ? data : data.items || data.listings || []
        setListings(items.map(toViewModel))
        setTotalPages(1)
      } catch (inner) {
        const msg = typeof inner === "string" ? inner : inner?.message || inner?.detail || "Failed to fetch listings"
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, category, query])

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery)
    setCurrentPage(1)
  }

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Browse Listings</h1>

      <SearchBar onSearch={handleSearch} />
      <CategoryTabs activeCategory={category} onCategoryChange={handleCategoryChange} />

      {error && <p className="text-red-500">{String(error)}</p>}

      <ListingGrid listings={listings} isLoading={isLoading} />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  )
}
