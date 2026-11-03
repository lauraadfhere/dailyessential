import { NextRequest, NextResponse } from 'next/server';
import { isResponse, requireRole } from '../../../../lib/authz';
import { mailConfigured, sendMail } from '../../../../lib/email/mailer';
import { EMAIL_TEMPLATES, MAIL_FROM_ADDRESS, sampleEmail, type EmailTemplateName, type MailLang } from '../../../../lib/email/templates';

const lang = (value: string | null | undefined): MailLang => (value === 'fr' || value === 'ar' ? value : 'en');
const isTemplate = (value: string | null | undefined): value is EmailTemplateName => EMAIL_TEMPLATES.includes(value as EmailTemplateName);

/**
 * Administrators only.
 *   GET  /api/admin/email-preview                 -> list of templates and whether SMTP is configured
 *   GET  /api/admin/email-preview?t=grade&lang=ar  -> the rendered HTML (open it in a browser tab)
 *   POST { to, template, lang }                    -> send a test message (works once SMTP is configured)
 */
export async function GET(request: NextRequest) {
  const session = await requireRole(request, ['admin']);
  if (isResponse(session)) return session;

  const name = request.nextUrl.searchParams.get('t');
  if (!name) {
    return NextResponse.json({ from: MAIL_FROM_ADDRESS, smtpConfigured: mailConfigured(), templates: EMAIL_TEMPLATES, languages: ['en', 'fr', 'ar'] });
  }
  if (!isTemplate(name)) return NextResponse.json({ error: 'Unknown template.' }, { status: 404 });
  const mail = sampleEmail(name, lang(request.nextUrl.searchParams.get('lang')));
  return new Response(mail.html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}

export async function POST(request: NextRequest) {
  const session = await requireRole(request, ['admin']);
  if (isResponse(session)) return session;

  const body = await request.json().catch(() => ({})) as { to?: string; template?: string; lang?: string };
  const to = String(body.to || session.email).trim();
  if (!isTemplate(body.template)) return NextResponse.json({ error: 'Choose a template.' }, { status: 400 });
  const result = await sendMail(to, sampleEmail(body.template, lang(body.lang)));
  if (!result.sent) {
    const message = result.reason === 'not-configured'
      ? 'SMTP is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.'
      : result.reason === 'nodemailer-missing' ? 'SMTP is configured but the nodemailer package is not installed. Run: yarn add nodemailer' : result.error || 'The message could not be sent.';
    return NextResponse.json({ sent: false, reason: result.reason, error: message }, { status: result.reason === 'failed' ? 502 : 503 });
  }
  return NextResponse.json({ sent: true, to });
}
