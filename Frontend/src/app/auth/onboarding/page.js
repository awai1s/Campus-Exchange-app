// File: src/app/auth/onboarding/page.js
import Link from 'next/link';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export default function Onboarding() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Onboarding</h2>

        <div className="text-gray-600 dark:text-gray-400 mb-6">
          <p>Welcome to the University Marketplace! Here, you can:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Buy textbooks, electronics, and more at student-friendly prices.</li>
            <li>Sell items you no longer need to fellow students.</li>
            <li>Connect with your university community securely.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button variant="primary" href="/auth/sign-up" className="w-full">
            Create an Account
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}