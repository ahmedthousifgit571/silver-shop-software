'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Gem,
  KeyRound,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col justify-center items-center px-4 py-12 selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-sm mb-2">
            <Gem className="w-6 h-6 text-slate-200" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sri Shubham Silver</h1>
          <p className="text-xs text-slate-500 font-medium">
            Jewellery Store Management, POS Billing & Vault Control
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Sign in to Store Workspace</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your authorized staff or owner credentials to continue.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl pl-10 pr-10 py-2 text-xs text-slate-900 focus:outline-none font-medium transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-sm transition active:scale-98 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Pills */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block text-center">
              Quick Role Demo
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@gmail.com');
                  setPassword('admin123');
                  setError(null);
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Store Owner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('staff@gmail.com');
                  setPassword('staff123');
                  setError(null);
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Cashier Staff</span>
              </button>
            </div>
          </div>
        </div>

        {/* Public Verification Note */}
        <div className="text-center text-xs text-slate-400">
          Customer smartphone QR scans are public and do not require any login.
        </div>
      </div>
    </div>
  );
}
