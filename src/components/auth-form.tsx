"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import LanguageSwitcher from "./language-switcher";
import { useI18n } from "./language-provider";
import { signInWithParse } from "../lib/parse";
import { readPortalIdentity, syncPortalProfile, writePortalIdentity } from "../lib/portal-session";
import { landingFor } from "../lib/role-routing";

export type PortalRole = "student" | "teacher" | "examiner" | "admin";
type AuthMode = "login" | "signup";

const roles: { id: Exclude<PortalRole, "admin">; label: string; description: string }[] = [
  { id: "student", label: "Student", description: "Learner access" },
  { id: "teacher", label: "Teacher", description: "Staff access" },
  { id: "examiner", label: "Examiner", description: "Assessment access" },
];

export default function AuthForm({ mode, role }: { mode: AuthMode; role: PortalRole }) {
  const { locale, t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryId, setRecoveryId] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const isLogin = mode === "login";
  const currentRole = roles.find((item) => item.id === role) ?? roles[0];
  const localUrl = (path: string) => `${path}?lang=${locale}`;

  // Already signed in to this portal? Skip the form and go where they were headed.
  useEffect(() => {
    if (!isLogin) return;
    const stored = readPortalIdentity();
    if (!stored.role || stored.role !== role) return;
    const requested = new URLSearchParams(window.location.search).get("next");
    window.location.replace(localUrl(landingFor(stored.role, requested)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, role]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLogin) return;
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const user = await signInWithParse(String(form.get("email")), String(form.get("password")));
      
      // Validate that user has the correct role for this portal
      if (user.portalRole === "admin") {
        setError("Administrators must use the dedicated Admin login.");
        setIsSubmitting(false);
        return;
      }
      if (user.portalRole && user.portalRole !== role) {
        setError(`This account is registered as a ${user.portalRole}. Please use the correct portal.`);
        setIsSubmitting(false);
        return;
      }
      
      // If no portalRole is set in the backend, we'll allow access but should warn in console
      if (!user.portalRole) {
        console.warn('User account does not have a portalRole set. This should be configured in Parse.');
      }
      
      const nextRole = (user.portalRole || role) as Exclude<PortalRole, "admin">;
      writePortalIdentity({
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0],
        role: nextRole,
      });
      sessionStorage.setItem("bifti.session", user.sessionToken);
      sessionStorage.setItem("bifti.userId", user.objectId);
      await syncPortalProfile(user.email, nextRole, { force: true }).catch(() => undefined);
      const requested = new URLSearchParams(window.location.search).get("next");
      window.location.assign(localUrl(landingFor(nextRole, requested)));
    } catch (err) {
      console.error('Login error:', err);
      const message = err instanceof Error ? err.message : "";
      setError(/server|configured|school database|too many/i.test(message) ? message : "We could not sign you in. Check your email and password.");
      setIsSubmitting(false);
    }
  };

  const submitRecovery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecoveryError("");
    setRecoveryBusy(true);
    try {
      const response = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: recoveryId.trim(), key: recoveryKey }),
      });
      const data = await response.json();
      if (!response.ok || !data.verified) {
        setRecoveryError(data.error || "That key could not be verified.");
        setRecoveryBusy(false);
        return;
      }
      const profile = data.profile || {};
      writePortalIdentity({
        email: profile.email,
        displayName: profile.fullName,
        role: "student",
        avatarUrl: profile.avatarUrl,
        status: profile.status || "active",
        studentId: profile.studentId,
        programme: profile.programme,
        classGroup: profile.classGroup,
        gradeLevel: profile.gradeLevel,
        campus: profile.campus,
      });
      try { sessionStorage.setItem("bifti.recoveryAccess", "granted"); } catch { /* ignore */ }
      window.location.assign(localUrl("/student/dashboard"));
    } catch {
      setRecoveryError("We could not verify that key. Check your connection and try again.");
      setRecoveryBusy(false);
    }
  };

  const portalBg =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStRowJLMOW6gHBC3EXXZIggWB5VfGjgkCI2OXF5GPtyg&s=10";

  return (
    <main className="min-h-screen text-[#333]">
      <header className="relative z-10 h-[58px] bg-[#1738a8] shadow-sm sm:h-[62px]">
        <div className="mx-auto flex h-full max-w-[960px] items-center justify-between gap-2 px-4 sm:px-8">
          <Link href={localUrl("/")} aria-label="Daily Essential School home"><Image src="/brand/logo-white.png" alt="Daily Essential School" width={136} height={56} priority className="h-auto w-[96px] object-contain sm:w-[116px]" /></Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <Link href={localUrl("/")} className="hidden text-xs font-semibold text-white/90 hover:text-white sm:inline">{t("Back to home")}</Link>
          </div>
        </div>
      </header>
      <section
        className="relative flex min-h-[calc(100vh-58px)] items-start justify-center bg-cover bg-center bg-no-repeat px-3 py-6 sm:min-h-[calc(100vh-62px)] sm:px-4 sm:py-12"
        style={{ backgroundImage: `linear-gradient(rgba(15, 34, 75, 0.35), rgba(15, 34, 75, 0.35)), url('${portalBg}')` }}
      >
        <div className="relative z-[1] w-full max-w-[400px] rounded-[4px] bg-white px-5 py-7 shadow-sm sm:px-10 sm:py-9">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#1738a8]">Daily Essential School portal</p>
          <h1 className="mt-3 text-[20px] font-normal leading-7 sm:text-[23px]">{isLogin ? `Sign in to your ${currentRole.label.toLowerCase()} portal` : `Create your ${currentRole.label.toLowerCase()} account`}</h1>
          <p className="mt-3 text-[13px] leading-5 text-slate-600">{isLogin ? "Welcome back. Enter your details below to continue." : "Complete the form below to request your portal account."}</p>
          <div className="mt-6 grid grid-cols-3 gap-1 border-b border-slate-200 pb-4" aria-label="Choose portal role">
            {roles.map((item) => <Link key={item.id} href={localUrl(`/${mode}/${item.id}`)} className={`rounded-sm px-2 py-2 text-center transition ${item.id === role ? "bg-[#e8effd] text-[#1738a8]" : "text-slate-500 hover:bg-slate-50 hover:text-[#1738a8]"}`}><span className="block text-[11px] font-bold">{item.label}</span><span className="mt-0.5 block text-[9px]">{item.description}</span></Link>)}
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-500">School administrator? <Link href="/admin/login" className="font-semibold text-[#0067d9] underline">Open Admin login</Link></p>
          <form onSubmit={submit} className="mt-6">
            {!isLogin && <label className="mb-5 block"><span className="text-[11px] font-semibold"><span className="mr-1 text-red-600">*</span>Full name</span><input required name="name" autoComplete="name" placeholder="Your full name" className="mt-1 block h-8 w-full border-b border-slate-300 bg-transparent px-0 text-[13px] outline-none placeholder:text-slate-500 focus:border-[#1738a8]" /></label>}
            <label className="block"><span className="text-[11px] font-semibold"><span className="mr-1 text-red-600">*</span>Email address</span><input required type="email" name="email" autoComplete="email" placeholder="name@example.com" className="mt-1 block h-8 w-full border-b border-slate-300 bg-transparent px-0 text-[13px] outline-none placeholder:text-slate-500 focus:border-[#1738a8]" /></label>
            <label className="mt-5 block"><span className="text-[11px] font-semibold"><span className="mr-1 text-red-600">*</span>Password</span><span className="relative mt-1 block"><input required minLength={8} type={showPassword ? "text" : "password"} name="password" autoComplete={isLogin ? "current-password" : "new-password"} placeholder={isLogin ? "Enter your password" : "Create a password"} className="block h-8 w-full border-b border-slate-300 bg-transparent px-0 pr-9 text-[13px] outline-none placeholder:text-slate-500 focus:border-[#1738a8]" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 h-8 text-[11px] font-semibold text-slate-500 hover:text-[#1738a8]">{showPassword ? "Hide" : "Show"}</button></span></label>
            {isLogin ? <div className="mt-3 flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600"><input type="checkbox" className="h-3 w-3 accent-[#1738a8]" />Keep me signed in</label><button type="button" onClick={() => setShowRecovery(value => !value)} className="text-[10px] font-semibold text-[#0067d9] underline">{showRecovery ? "Use password instead" : "Forgot password?"}</button></div> : <label className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-slate-600"><input required type="checkbox" className="mt-0.5 h-3 w-3 shrink-0 accent-[#1738a8]" />I agree to the <Link href="/terms" className="text-[#0067d9] underline">terms of use</Link> and <Link href="/privacy" className="text-[#0067d9] underline">privacy policy</Link>.</label>}
            {error && <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">{error}</p>}
            <button disabled={isSubmitting} type="submit" className="mt-6 h-8 w-full rounded-[3px] bg-[#2467d7] text-[11px] font-bold text-white hover:bg-[#1738a8] disabled:cursor-wait disabled:opacity-70">{isSubmitting ? "Signing in…" : isLogin ? "Sign in" : "Request account"}</button>
          </form>
          {isLogin && showRecovery && (
            <div className="mt-4 border border-slate-200 bg-[#f7f9fd] p-3">
              <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#1738a8]">Sign in with a recovery key</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-600">
                Download the key from your student ID page, then confirm it here to restore access.
              </p>
              <form onSubmit={submitRecovery} className="mt-3 space-y-3">
                <label className="block"><span className="text-[10px] font-semibold">Student ID</span><input required value={recoveryId} onChange={(event) => setRecoveryId(event.target.value)} placeholder="BF-2026-1000" className="mt-1 block h-8 w-full border-b border-slate-300 bg-transparent px-0 font-mono text-[12px] uppercase outline-none placeholder:text-slate-400 focus:border-[#1738a8]" /></label>
                <label className="block"><span className="text-[10px] font-semibold">Recovery key</span><input required value={recoveryKey} onChange={(event) => setRecoveryKey(event.target.value)} placeholder="DE-XXXX-XXXX-XXXX-XXXX" className="mt-1 block h-8 w-full border-b border-slate-300 bg-transparent px-0 font-mono text-[12px] uppercase outline-none placeholder:text-slate-400 focus:border-[#1738a8]" /></label>
                {recoveryError && <p role="alert" className="border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] text-red-700">{recoveryError}</p>}
                <button disabled={recoveryBusy} type="submit" className="h-8 w-full rounded-[3px] border border-[#1738a8] text-[11px] font-bold text-[#1738a8] transition hover:bg-[#e8effd] disabled:cursor-wait disabled:opacity-70">{recoveryBusy ? "Verifying…" : "Verify key and continue"}</button>
              </form>
            </div>
          )}
          <Link href={localUrl(`/${isLogin ? "signup" : "login"}/${role}`)} className="mt-4 flex h-8 items-center justify-center rounded-[3px] border border-slate-300 text-[11px] font-semibold hover:border-[#1738a8] hover:text-[#1738a8]">{isLogin ? "Create an account" : "I already have an account"}</Link>
          <div className="my-4 flex items-center gap-3 text-[10px] text-slate-600"><span className="h-px flex-1 bg-slate-300" />or continue with<span className="h-px flex-1 bg-slate-300" /></div>
          <div className="space-y-2"><button type="button" className="flex h-8 w-full items-center justify-center gap-2 rounded-[3px] border border-slate-300 text-[11px] hover:bg-slate-50">● Continue with Apple</button><button type="button" className="flex h-8 w-full items-center justify-center gap-2 rounded-[3px] border border-slate-300 text-[11px] hover:bg-slate-50">▣ Continue with Facebook</button></div>
        </div>
      </section>
    </main>
  );
}
