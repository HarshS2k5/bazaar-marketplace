'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPass123!');
    setLoading(true);
    setError(null);
    const res = await login(demoEmail, 'DemoPass123!');
    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo & Heading */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Bazaar</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to manage your marketplace listings & saved items
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arjun.sharma@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full rounded-xl mt-2 font-bold"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider text-center font-semibold mb-2.5">
              Quick Test Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('arjun.sharma@example.com')}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-left transition-colors font-medium"
              >
                <span className="block font-bold text-slate-900">Arjun Sharma</span>
                <span className="text-[10px] text-slate-500">Seller (Mumbai)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ananya.iyer@example.com')}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-left transition-colors font-medium"
              >
                <span className="block font-bold text-indigo-900">Ananya Iyer</span>
                <span className="text-[10px] text-indigo-500">Admin Role</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link
            href="/register"
            className="font-bold text-emerald-600 hover:text-emerald-700"
          >
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
