'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Card } from '../../../components/Card';
import { Spinner } from '../../../components/Spinner';
import { apiFetch } from '@/lib/api';

export default function IDUpload() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onSubmit = async (form) => {
    setIsLoading(true);
    setError(null);

    try {
      const file = form.idImage?.[0];
      if (!file) throw new Error('Please choose an image of your student ID.');

      // Try multipart first (no explicit content-type for FormData)
      const fd = new FormData();
      fd.append('id_image', file); // single field

      try {
        await apiFetch('/verification/upload-id', { method: 'POST', body: fd });
      } catch (e) {
        // fallback only if it's an unsupported-media/validation error
        if (!/415|422/.test(String(e?.message))) throw e;
        const b64 = await fileToBase64(file);
        await apiFetch('/verification/upload-id', {
          method: 'POST',
          body: JSON.stringify({ image_base64: b64 }),
        });
      }

      if (!ok) {
        const b64 = await fileToBase64(file);
        await apiFetch('/verification/upload-id', {
          method: 'POST',
          body: JSON.stringify({ image_base64: b64 }),
        });
      }

      window.location.href = '/auth/success';
    } catch (err) {
      setError(err.message || 'ID upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-2 text-center">Verify Your Student ID</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          Upload a clear image of your student ID to verify your university affiliation.
        </p>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Student ID Image"
            type="file"
            accept="image/*"
            {...register('idImage', { required: 'Student ID image is required' })}
            error={errors.idImage?.message}
          />
          <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner className="w-5 h-5 mx-auto" /> : 'Upload ID'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
