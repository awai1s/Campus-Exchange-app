import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import Link from 'next/link';

export default function Error() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Verification Failed</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Something went wrong during verification. Please try again or contact support.
        </p>
        <Button variant="primary" as="a" href="/auth/verify/otp" className="w-full">
          Try Again
        </Button>
      </Card>
    </div>
  );
}