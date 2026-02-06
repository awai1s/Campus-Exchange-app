// File: src/app/components/ProductDetails.js
import { Card, CardContent, CardTitle } from '@/components/ui/card';

function ProductDetails({ listing }) {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardContent className="space-y-2">
        <CardTitle>{listing.title}</CardTitle>
        <p className="text-xl font-bold">${listing.price}</p>
        <p><strong>Condition:</strong> {listing.condition || 'Not specified'}</p>
        <p><strong>Description:</strong> {listing.description || 'No description available'}</p>
      </CardContent>
    </Card>
  );
}

export default ProductDetails;