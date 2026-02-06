// File: src/app/components/SellerLink.js
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function SellerLink({ sellerId, sellerName }) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-4 flex space-x-4">
      <Link href={`/profile?user=${sellerId}`}>
        <Button variant="outline">View Seller Profile</Button>
      </Link>
      <Button onClick={() => alert(`Chat with ${sellerName} initiated!`)}>Chat with Seller</Button>
    </div>
  );
}

export default SellerLink;