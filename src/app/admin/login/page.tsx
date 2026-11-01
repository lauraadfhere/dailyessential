'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { signInWithParse } from '../../../lib/parse';
import { syncPortalProfile, writePortalIdentity } from '../../../lib/portal-session';

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const user = await signInWithParse(String(form.get('email')), String(form.get('password')));
      if (user.portalRole && user.portalRole !== 'admin') {
        setError(`This account is registered as a ${user.portalRole}. Use the school portal login instead.`);
        setIsSubmitting(false);
        return;
      }
      if (!user.portalRole) {
        console.warn('Admin account does not have portalRole set. Configure portalRole=admin in Parse.');
      }
      writePortalIdentity({
        email: user.email,
        displayName: user.displayName || 'Daily Essential Admin',
        role: user.portalRole || 'admin',
      });
      sessionStorage.setItem('bifti.session', user.sessionToken);
      sessionStorage.setItem('bifti.userId', user.objectId);
      await syncPortalProfile(user.email, 'admin').catch(() => undefined);
      window.location.assign('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      setError('We could not sign you in. Check your admin email and password.');
      setIsSubmitting(false);
    }
  };

  const adminBg =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIAEFONiqCFtXdKy-A3BYscLWxg9A1KjIbOIt3DPJ3qqkeeSNnonsYin8&s=10";

  return (
    <main className="min-h-screen text-[#2f3338]">
      <header className="relative z-10 h-[54px] bg-[#2e343b] text-white">
        <div className="mx-auto flex h-full max-w-[480px] items-center justify-between px-5">
          <Link href="/" aria-label="Daily Essential School home" className="flex items-center">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={108} height={44} priority className="h-8 w-auto object-contain" />
          </Link>
          <Link href="/login" className="text-xs font-semibold text-white/80 hover:text-white">School portal login</Link>
        </div>
      </header>

      <section
        className="relative flex min-h-[calc(100vh-54px)] items-start justify-center bg-cover bg-center bg-no-repeat px-4 py-12"
        style={{ backgroundImage: `linear-gradient(rgba(20, 24, 32, 0.45), rgba(20, 24, 32, 0.45)), url('${adminBg}')` }}
      >
        <div className="relative z-[1] w-full max-w-[400px] rounded border border-[#e1e5eb] bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#2e9fff]">Administrator access</p>
          <h1 className="mt-3 text-[22px] font-semibold leading-7 text-[#2f3338] sm:text-[24px]">Sign in to Daily Essential Admin</h1>
          <p className="mt-3 text-[13px] leading-5 text-[#6b7380]">
            Dedicated console for evaluations, lesson subscriptions, marks oversight and school news.
          </p>

          <form onSubmit={submit} className="mt-7">
            <label className="block">
              <span className="text-[11px] font-semibold"><span className="mr-1 text-red-600">*</span>Admin email</span>
              <input required type="email" name="email" autoComplete="username" placeholder="admin@bifti.school" className="mt-1 block h-9 w-full border-b border-[#d8dde4] bg-transparent px-0 text-[13px] outline-none placeholder:text-[#9aa3ad] focus:border-[#2e9fff]" />
            </label>
            <label className="mt-5 block">
              <span className="text-[11px] font-semibold"><span className="mr-1 text-red-600">*</span>Password</span>
              <span className="relative mt-1 block">
                <input required minLength={8} type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" placeholder="Enter admin password" className="block h-9 w-full border-b border-[#d8dde4] bg-transparent px-0 pr-12 text-[13px] outline-none placeholder:text-[#9aa3ad] focus:border-[#2e9fff]" />
                <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-0 top-0 h-9 text-[11px] font-semibold text-[#6b7380] hover:text-[#2e9fff]">{showPassword ? 'Hide' : 'Show'}</button>
              </span>
            </label>
            {error && <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">{error}</p>}
            <button disabled={isSubmitting} type="submit" className="mt-7 h-9 w-full rounded bg-[#2e9fff] text-[12px] font-bold text-white hover:bg-[#1f8eef] disabled:cursor-wait disabled:opacity-70">
              {isSubmitting ? 'Signing in…' : 'Sign in to admin'}
            </button>
          </form>

          <div className="mt-6 rounded border border-[#e8f5ff] bg-[#f3f9ff] px-4 py-3 text-[11px] leading-5 text-[#4a515a]">
            <p className="font-semibold text-[#2e9fff]">Demo admin</p>
            <p className="mt-1">admin@bifti.school · BiftiAdmin!2026</p>
          </div>

          <p className="mt-6 text-center text-[11px] text-[#6b7380]">
            Student, teacher or examiner?{' '}
            <Link href="/login" className="font-semibold text-[#2e9fff] hover:underline">Use the school portal</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
