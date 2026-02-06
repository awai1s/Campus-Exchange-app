'use client';

import { Spinner } from '../../components/Spinner';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';   // ← use the proxy-aware helper

export default function SignUp() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  // Try common endpoint variants so we match your backend without guessing
  const signUpPaths = ['/auth/signup', '/auth/register', '/auth/sign-up'];

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true);
    setError(null);

    try {
      let data = null;
      let lastErr = null;

      const signUpPaths = ['/auth/signup', '/auth/register', '/auth/sign-up'];

      for (const path of signUpPaths) {
        try {
          data = await apiFetch(path, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          // if 404, try next path; if other error, rethrow
          if (!String(e?.message).includes('404')) throw e;
        }
      }

      if (lastErr) throw lastErr;

      if (data?.access_token) {
        localStorage.setItem('token', data.access_token);
        window.location.href = '/browse';
      } else {
        window.location.href = '/auth/login';
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-200px)] px-4 overflow-hidden">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900" />

      <motion.div
        className="pointer-events-none absolute -top-24 -left-24 w-[26rem] h-[26rem] rounded-full bg-white/20 blur-3xl"
        animate={{ y: [0, 25, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-28 -right-28 w-[30rem] h-[30rem] rounded-full bg-blue-400/25 blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, -25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="p-6 md:p-8 rounded-2xl shadow-xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/30">
          <motion.h2 initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-center tracking-tight text-blue-900 dark:text-white">
            Create Account
          </motion.h2>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-2 text-center text-blue-900/70 dark:text-white/80 italic">
            Join us today, it’s free
          </motion.p>

          {error && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-blue-50 text-blue-800 p-3 rounded-md text-sm border border-blue-200">
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <Input
                label="Email"
                type="email"
                className="bg-white/70 dark:bg-white/20 border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
                error={errors.email?.message}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <Input
                label="Password"
                type="password"
                className="bg-white/70 dark:bg-white/20 border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                error={errors.password?.message}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}>
              <Button variant="primary" type="submit" className="w-full py-3 rounded-lg text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-all" disabled={isLoading}>
                {isLoading ? <Spinner className="w-5 h-5 mx-auto" /> : 'Sign Up'}
              </Button>
            </motion.div>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="text-sm text-blue-900/70 dark:text-white/80 text-center mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-700 dark:text-blue-300 hover:underline font-semibold">
              Log in
            </Link>
          </motion.p>
        </Card>
      </motion.div>

      <style jsx>{`
        .animate-gradient { background-size: 300% 300%; animation: gradientShift 18s ease infinite; }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>
    </div>
  );
}
