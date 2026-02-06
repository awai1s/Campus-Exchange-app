import Link from 'next/link';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export default function Launch() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Welcome to Your University Marketplace
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Join our community to buy and sell items with fellow students. Lets get started!
        </p>
        <div className="space-y-4">
          <Button variant="primary" href="/auth/onboarding" className="w-full">
            Start Onboarding
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}