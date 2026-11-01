'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import LanguageSwitcher from '../../components/language-switcher';
import { useI18n } from '../../components/language-provider';
import UserAvatar from '../../components/user-avatar';
import { usePortalIdentity } from '../../hooks/use-portal-identity';
import { homeForRole } from '../../lib/role-routing';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: string;
  failed?: boolean;
};

const STORAGE_KEY = 'dammi.conversation.v1';
const VISITOR_KEY = 'dammi.visitor.v1';

/** Stable per-browser id so signed-out visitors still get real answers (and a fair rate limit). */
function visitorEmail() {
  try {
    const saved = localStorage.getItem(VISITOR_KEY);
    if (saved) return saved;
    const id = `visitor-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
    const email = `${id}@visitor.dailyessential.school`;
    localStorage.setItem(VISITOR_KEY, email);
    return email;
  } catch {
    return 'visitor@visitor.dailyessential.school';
  }
}

type AiStatus = { ready: boolean; model?: string; provider?: string };

const starters = [
  'How do I open my student portal?',
  'Where is my student ID card?',
  'How can I read PDF course packs?',
  'How do I contact school support?',
];

function replyFor(input: string) {
  const q = input.toLowerCase();
  if (q.includes('login') || q.includes('portal') || q.includes('sign in')) {
    return 'Use School portal from the header, or go to /login. Students, teachers and examiners each have their own role tab. Administrators use /admin/login.';
  }
  if (q.includes('id') || q.includes('barcode') || q.includes('recovery')) {
    return 'Open My ID in the student portal. It shows your QR code, a copyable student ID, your grade and a downloadable recovery key.';
  }
  if (q.includes('pdf') || q.includes('library') || q.includes('document')) {
    return 'Open the PDF library from the header (/library). Documents open inside Daily Essential with the in-app reader.';
  }
  if (q.includes('course') || q.includes('programme') || q.includes('class')) {
    return 'Browse programmes at /courses. Course covers, modules and seats are loaded from the school catalogue.';
  }
  if (q.includes('ticket') || q.includes('support') || q.includes('help') || q.includes('contact')) {
    return 'Submit a support ticket on /contact. Attachments upload securely and tickets reach the school support desk.';
  }
  if (q.includes('price') || q.includes('cost') || q.includes('fee') || q.includes('dzd') || q.includes('usd')) {
    return 'Monthly plans and add-ons are listed on /pricing, in Algerian dinar and US dollars.';
  }
  if (q.includes('notification') || q.includes('alert')) {
    return 'Open the bell in the portal header for a live notification panel, or visit /student/notifications for the full list.';
  }
  if (q.includes('admin')) {
    return 'School staff can sign in at /admin/login for evaluations, news, subscriptions and analytics.';
  }
  return 'I am DAMMI AI, your Daily Essential school assistant. Ask about portals, courses, PDF library, student ID, grades, pricing or support tickets — I will point you to the right place.';
}

function loadConversation(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-40) : [];
  } catch {
    return [];
  }
}

export default function DummiAiPage() {
  const { t } = useI18n();
  const { identity, avatarUrl } = usePortalIdentity();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [aiStatus, setAiStatus] = useState<AiStatus>({ ready: true });
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const homeHref = homeForRole(identity.role);
  const profileHref = identity.role === 'student' || !identity.role ? '/student/profile' : homeHref;

  const quickLinks = identity.role === 'teacher'
    ? [['Lesson planner', '/teacher/planner'], ['AI test builder', '/teacher/ai'], ['Gradebook', '/teacher/gradebook'], ['Pricing', '/pricing']]
    : identity.role === 'examiner'
      ? [['Assessments', '/workspace/examiner/assessments'], ['Results', '/workspace/examiner/gradebook'], ['Reports', '/workspace/examiner/reports'], ['Pricing', '/pricing']]
      : [['My courses', '/student/courses'], ['My ID & key', '/student/id'], ['Grades', '/student/grades'], ['Pricing', '/pricing']];

  // Ask the server which provider is live so the badge never lies to the learner.
  useEffect(() => {
    let active = true;
    fetch('/api/ai/status')
      .then(response => response.json())
      .then(data => {
        if (!active) return;
        setAiStatus({
          ready: Boolean(data.ok),
          provider: data.provider,
          model: data.models?.reasoning,
        });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  // Restore the last conversation and greet a first-time visitor.
  useEffect(() => {
    const saved = loadConversation();
    if (saved.length) {
      setMessages(saved);
      return;
    }
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      text: 'Hi — I am DAMMI AI. Ask me about portals, courses, PDFs, your student ID, grades, pricing or support.',
      at: new Date().toISOString(),
    }]);
  }, []);

  useEffect(() => {
    if (messages.length) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
      } catch {
        /* storage may be blocked */
      }
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  const send = useCallback(async (text: string) => {
    const cleaned = text.trim();
    if (!cleaned || typing) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: cleaned,
      at: new Date().toISOString(),
    };
    const history = messages
      .filter(message => message.id !== 'welcome' && !message.failed)
      .slice(-4)
      .map(message => ({ role: message.role, content: message.text }));

    setMessages(current => [...current, userMsg]);
    setDraft('');
    setError('');
    setLastQuestion(cleaned);
    setTyping(true);

    let answer = '';
    let failed = false;
    try {
      const response = await fetch('/api/ai/study-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identity.email || visitorEmail(),
          question: cleaned,
          scope: 'portal',
          history,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI unavailable');
      answer = String(data.answer || '').trim();
      if (!answer) throw new Error('Empty answer');
    } catch (err) {
      failed = true;
      answer = `${replyFor(cleaned)}\n\n(Live AI is unavailable right now — this is the school help index answer.)`;
      setError(err instanceof Error ? err.message : 'AI unavailable');
    }

    setMessages(current => [
      ...current,
      { id: `a-${Date.now()}`, role: 'assistant', text: answer, at: new Date().toISOString(), failed },
    ]);
    setTyping(false);
  }, [identity.email, messages, typing]);

  const retry = () => {
    if (!lastQuestion) return;
    const withoutLastFailure = messages.filter(message => !message.failed);
    setMessages(withoutLastFailure);
    void send(lastQuestion);
  };

  const copyAnswer = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(''), 1600);
    } catch {
      setCopiedId('');
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      text: 'Conversation cleared. What would you like to learn or find today?',
      at: new Date().toISOString(),
    }]);
    setError('');
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f4f5fa] text-slate-900">
      <header className="shrink-0 bg-[#1738a8] text-white shadow-sm">
        <div className="mx-auto flex h-[58px] max-w-[1100px] items-center gap-3 px-4 sm:h-[64px] sm:px-6">
          <Link href="/" aria-label="Daily Essential School home" className="flex h-full w-[96px] shrink-0 items-center sm:w-[116px]">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={1000} height={280} priority className="h-auto w-full object-contain" />
          </Link>
          <div className="flex min-w-0 items-center gap-2 border-l border-white/25 pl-3 sm:gap-3 sm:pl-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/dammi-white.png" alt="DAMMI" width={104} height={29} className="h-[22px] w-auto object-contain sm:h-[26px]" />
            <p className="hidden truncate text-[11px] text-white/70 sm:block">{t('School chat assistant')}</p>
          </div>
          <nav className="ml-auto flex items-center gap-1.5 text-xs font-semibold sm:gap-2.5 sm:text-sm">
            <Link href={homeHref} className="rounded px-2 py-1.5 text-white/85 hover:bg-white/15 hover:text-white">
              {t('Dashboard')}
            </Link>
            <Link href="/pricing" className="hidden rounded px-2 py-1.5 text-white/85 hover:bg-white/15 hover:text-white lg:inline">
              {t('Pricing')}
            </Link>
            <Link href="/contact" className="hidden rounded px-2 py-1.5 text-white/85 hover:bg-white/15 hover:text-white sm:inline">
              {t('Support')}
            </Link>
            <LanguageSwitcher />
            <Link href={profileHref} aria-label={`Account${identity.status ? `, ${identity.status}` : ''}`} className="ml-1">
              <UserAvatar src={avatarUrl} name={identity.displayName || 'Daily Essential'} status={identity.status || 'active'} size="sm" />
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/dammi-black.png" alt="DAMMI" width={132} height={37} className="h-[26px] w-auto object-contain sm:h-[30px]" />
              <span className="rounded-full bg-[#e8eefc] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1738a8]">AI</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-[#15133d] sm:text-2xl">{t('Chat with DAMMI AI')}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{t('Guided answers for learners and staff — courses, portal access, identity and support.')}</p>
          </div>
          <button
            type="button"
            onClick={clearChat}
            className="self-start rounded border border-slate-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-[#1738a8] hover:text-[#1738a8] sm:self-auto"
          >
            {t('Clear chat')}
          </button>
        </div>

        <div className="mb-3 grid gap-2 sm:grid-cols-4">
          {quickLinks.map(([label, href]) => (
            <Link key={href} href={href} className="border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:border-[#1738a8] hover:text-[#1738a8]">
              {label}
            </Link>
          ))}
        </div>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-[#f7f8fc] px-4 py-3">
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/dammi-black.png" alt="" width={40} height={11} className="h-[11px] w-auto object-contain" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">DAMMI AI</p>
              <p className={`flex items-center gap-1.5 text-xs ${aiStatus.ready ? 'text-emerald-600' : 'text-amber-600'}`}>
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${aiStatus.ready ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {aiStatus.ready ? `Online · ${aiStatus.provider === 'cloudflare' ? 'Cloudflare Workers AI' : 'NVIDIA NIM'}` : 'Help index mode'}
              </p>
            </div>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5"
            style={{ maxHeight: 'min(52vh, 560px)' }}
            aria-live="polite"
            data-no-i18n
          >
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[92%] sm:max-w-[80%]">
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-[#1738a8] text-white'
                        : message.failed
                          ? 'rounded-bl-md border border-amber-200 bg-amber-50 text-amber-900'
                          : 'rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    {message.text}
                  </div>
                  {message.role === 'assistant' && message.id !== 'welcome' && (
                    <button
                      type="button"
                      onClick={() => copyAnswer(message)}
                      className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 transition hover:text-[#1738a8]"
                    >
                      {copiedId === message.id ? 'Copied' : 'Copy answer'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
                  <span className="flex gap-1" aria-hidden="true">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                  </span>
                  DAMMI is typing…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div role="alert" className="mx-3 mb-2 flex flex-wrap items-center justify-between gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900 sm:mx-4">
              <span>Live AI: {error}. Showing the school help index instead.</span>
              <button type="button" onClick={retry} className="font-bold underline">Retry</button>
            </div>
          )}

          <div className="border-t border-slate-200 px-3 py-3 sm:px-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {starters.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void send(prompt)}
                  disabled={typing}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-black hover:text-black disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex items-end gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Message DAMMI AI</span>
                <textarea
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                  rows={2}
                  maxLength={600}
                  placeholder="Ask DAMMI AI about Daily Essential…"
                  data-no-i18n
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1738a8] focus:ring-2 focus:ring-[#dce6ff]"
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void send(draft);
                    }
                  }}
                />
              </label>
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                className="h-11 shrink-0 rounded-lg bg-black px-4 text-sm font-bold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('Send')}
              </button>
            </form>
            <p className="mt-2 text-[10px] leading-4 text-slate-500">
              AI answers can be wrong — check with your tutor. Your questions are logged for safety and quality, and the
              assistant will not help with live tests.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
