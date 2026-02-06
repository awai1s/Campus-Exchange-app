// File: src/app/page.js
import { Button } from './components/Button';

export default function Home() {
  return (
    <div className="text-center space-y-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Welcome to University Marketplace
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Buy and sell items within your university community. Find textbooks, electronics, furniture, and more at great prices!
      </p>
      <div className="space-x-4">
        <Button variant="primary" href="/browse">
          Start Browsing
        </Button>
        <Button variant="secondary" href="/create-listing">
          Create a Listing
        </Button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
        Returning user? Check your <a href="/my-listings" className="underline">My Listings</a> or <a href="/favorites" className="underline">Favorites</a>.
      </p>
    </div>
  );
}