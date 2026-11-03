import { MAIL_FROM_ADDRESS, SCHOOL_NAME, type Mail } from './templates';

/**
 * SMTP sending, ready for the day the details are added. Until then every send is a harmless no-op.
 *
 * Add these as Worker secrets (and in .dev.vars locally):
 *   SMTP_HOST   e.g. smtp.example.com
 *   SMTP_PORT   465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER   the mailbox login (usually mail@dailyessential.ca)
 *   SMTP_PASS   the mailbox password or app password
 *   SMTP_SECURE "true" for port 465, otherwise leave empty
 *   MAIL_FROM   optional, defaults to mail@dailyessential.ca
 *
 * Sending uses the `nodemailer` package. It is not installed yet, so nothing is bundled; when you are ready run
 * `yarn add nodemailer` and the mailer starts working (Workers need the `nodejs_compat` flag, which is already on).
 * Read lazily: on Workers, secrets are only on process.env while a request is being handled.
 */
function config() {
  const host = process.env.SMTP_HOST || '';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const from = process.env.MAIL_FROM || MAIL_FROM_ADDRESS;
  return { host, port, user, pass, secure, from };
}

export function mailConfigured() {
  const { host, user, pass } = config();
  return Boolean(host && user && pass);
}

export type SendResult = { sent: boolean; reason?: 'not-configured' | 'nodemailer-missing' | 'failed'; error?: string };

type Transport = { sendMail(message: Record<string, unknown>): Promise<unknown> };

let transport: { key: string; value: Transport } | null = null;

async function getTransport(): Promise<Transport | null> {
  const { host, port, user, pass, secure } = config();
  const key = `${host}:${port}:${user}:${secure}`;
  if (transport?.key === key) return transport.value;
  try {
    // The name sits in a variable so the bundler does not try to include a package that is not installed yet.
    const name = 'nodemailer';
    const mod = (await import(/* @vite-ignore */ name)) as { default?: { createTransport: (options: unknown) => Transport }; createTransport?: (options: unknown) => Transport };
    const create = mod.createTransport || mod.default?.createTransport;
    if (!create) return null;
    const value = create({ host, port, secure, auth: { user, pass }, connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000 });
    transport = { key, value };
    return value;
  } catch {
    return null;
  }
}

/** Send one e-mail built from a template. Never throws: a mail problem must not break the action that caused it. */
export async function sendMail(to: string | string[], mail: Mail, options: { replyTo?: string } = {}): Promise<SendResult> {
  if (!mailConfigured()) return { sent: false, reason: 'not-configured' };
  const recipients = (Array.isArray(to) ? to : [to]).map(address => address.trim()).filter(address => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address));
  if (!recipients.length) return { sent: false, reason: 'failed', error: 'No valid recipient.' };

  const smtp = await getTransport();
  if (!smtp) return { sent: false, reason: 'nodemailer-missing' };
  try {
    await smtp.sendMail({
      from: `"${SCHOOL_NAME}" <${config().from}>`,
      to: recipients.join(', '),
      replyTo: options.replyTo || config().from,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: { 'X-Auto-Response-Suppress': 'OOF, AutoReply' },
    });
    return { sent: true };
  } catch (error) {
    return { sent: false, reason: 'failed', error: error instanceof Error ? error.message : 'Send failed.' };
  }
}
