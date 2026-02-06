'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Spinner } from '../../components/Spinner';
import { apiFetch } from '@/lib/api';

export default function OTPVerification() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      // POST /api/v1/verification/verify-otp  (auth required)
      await apiFetch('/verification/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ otp_code: data.otp }),
      });
      router.push('/auth/verify/id-upload');
    } catch (e) {
      setError(e?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Enter the 6-digit OTP sent to your email.
        </p>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="OTP"
            inputMode="numeric"
            {...register('otp', {
              required: 'OTP is required',
              pattern: { value: /^\d{6}$/, message: 'OTP must be 6 digits' },
            })}
            error={errors.otp?.message}
          />
          <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner className="w-5 h-5 mx-auto" /> : 'Verify OTP'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
