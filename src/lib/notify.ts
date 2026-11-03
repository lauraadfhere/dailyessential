import { mailConfigured, sendMail } from './email/mailer';
import { notificationEmail, type Mail } from './email/templates';
import { parseCreate, parseQuery } from './parse-server';

/**
 * Creates in-app notifications (`Notification` rows) and, once SMTP is configured, the matching e-mail.
 * The bell in every header reads the rows back through /api/notifications. A failed notification or e-mail
 * must never break the action that caused it, so every function here swallows its own errors.
 */
export type NewNotification = {
  title: string;
  message: string;
  link?: string;
  type?: 'announcement' | 'assessment' | 'course' | 'schedule' | 'identity' | 'system';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  sourceType?: string;
  sourceId?: string;
  /** Builds a richer e-mail for each recipient. Without it the generic notification template is used. */
  email?: (recipient: { name: string; email: string }) => Mail;
};

type Recipient = { objectId: string; email?: string; displayName?: string };

async function deliver(recipients: Recipient[], note: NewNotification) {
  const unique = [...new Map(recipients.map(row => [row.objectId, row])).values()].slice(0, 100);
  await Promise.all(unique.map(row =>
    parseCreate('Notification', {
      type: note.type || 'announcement',
      title: note.title.slice(0, 140),
      message: note.message.slice(0, 400),
      priority: note.priority || 'normal',
      link: note.link,
      sourceType: note.sourceType,
      sourceId: note.sourceId,
      recipient: { __type: 'Pointer', className: '_User', objectId: row.objectId },
    }).catch(() => undefined),
  ));

  if (!mailConfigured()) return;
  await Promise.all(unique.filter(row => row.email).map(row => {
    const name = row.displayName || (row.email as string).split('@')[0];
    const mail = note.email ? note.email({ name, email: row.email as string }) : notificationEmail({ name, title: note.title, message: note.message, link: note.link });
    return sendMail(row.email as string, mail).catch(() => undefined);
  }));
}

const KEYS = 'objectId,email,displayName';

/** Notify specific people by email address. */
export async function notifyEmails(emails: string[], note: NewNotification) {
  try {
    const list = [...new Set(emails.map(email => email.trim().toLowerCase()).filter(Boolean))];
    if (!list.length) return;
    const { results } = await parseQuery<Recipient>('_User', { where: JSON.stringify({ email: { $in: list } }), limit: 100, keys: KEYS });
    await deliver(results, note);
  } catch { /* ignore */ }
}

/** Notify everyone who works at the school (teachers, examiners, administrators). */
export async function notifyStaff(note: NewNotification, roles: string[] = ['teacher', 'examiner', 'admin']) {
  try {
    const { results } = await parseQuery<Recipient>('_User', { where: JSON.stringify({ portalRole: { $in: roles } }), limit: 100, keys: KEYS });
    await deliver(results, note);
  } catch { /* ignore */ }
}

/** Notify every learner enrolled in a course. */
export async function notifyCourseStudents(courseSlug: string, note: NewNotification) {
  try {
    const { results } = await parseQuery<{ studentEmail: string; status?: string }>('CourseEnrollment', { where: JSON.stringify({ courseSlug }), limit: 200, keys: 'studentEmail,status' });
    await notifyEmails(results.filter(row => ['active', 'completed', undefined].includes(row.status)).map(row => row.studentEmail), note);
  } catch { /* ignore */ }
}
