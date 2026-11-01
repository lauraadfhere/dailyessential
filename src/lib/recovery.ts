import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Account recovery keys.
 *
 * A key is derived with HMAC-SHA256 from the learner's stable identity
 * (student id + email) and a server-only secret. Nothing is stored on the
 * client and the same learner always receives the same key, so a downloaded
 * key keeps working until the secret is rotated.
 */

function recoverySecret() {
  const configured = process.env.RECOVERY_KEY_SECRET
    || process.env.PARSE_MASTER_KEY
    || process.env.CLOUDINARY_API_SECRET
    || process.env.NVIDIA_API_KEY;
  if (configured) return configured;
  // Development fallback only — set RECOVERY_KEY_SECRET in production.
  return 'daily-essential-recovery-development-secret';
}

export function usesDedicatedRecoverySecret() {
  return Boolean(process.env.RECOVERY_KEY_SECRET);
}

function digest(studentId: string, email: string) {
  return createHmac('sha256', recoverySecret())
    .update(`${studentId.trim().toUpperCase()}|${email.trim().toLowerCase()}`)
    .digest('hex')
    .toUpperCase();
}

/** Format: DE-XXXX-XXXX-XXXX-XXXX (16 groups of hex, dash separated). */
export function buildRecoveryKey(studentId: string, email: string) {
  const hex = digest(studentId, email).slice(0, 16);
  const groups = hex.match(/.{1,4}/g) || [];
  return `DE-${groups.join('-')}`;
}

export function normaliseRecoveryKey(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function verifyRecoveryKey(studentId: string, email: string, candidate: string) {
  if (!studentId || !email || !candidate) return false;
  const expected = Buffer.from(buildRecoveryKey(studentId, email));
  const supplied = Buffer.from(normaliseRecoveryKey(candidate));
  if (expected.length !== supplied.length) return false;
  return timingSafeEqual(expected, supplied);
}

/** Human-readable recovery file the learner downloads from the portal. */
export function recoveryFileContents(input: {
  fullName: string;
  email: string;
  studentId: string;
  gradeLevel?: string;
  programme?: string;
  classGroup?: string;
  recoveryKey: string;
}) {
  const lines = [
    'DAILY ESSENTIAL SCHOOL — ACCOUNT RECOVERY KEY',
    '============================================',
    '',
    `Learner:     ${input.fullName || 'Learner'}`,
    `Student ID:  ${input.studentId}`,
    `Email:       ${input.email}`,
    input.gradeLevel ? `Grade:       ${input.gradeLevel}` : '',
    input.classGroup ? `Class group: ${input.classGroup}` : '',
    input.programme ? `Programme:  ${input.programme}` : '',
    '',
    `Recovery key: ${input.recoveryKey}`,
    '',
    'How to use this key',
    '-------------------',
    '1. Open the student sign-in page (/login/student).',
    '2. Choose "Sign in with a recovery key".',
    '3. Enter your student ID and the recovery key above.',
    '4. The school will verify the key and restore access to your portal.',
    '',
    'Keep this file private. Anyone with this key can request access to your account.',
    'If you did not download this file, contact the school office immediately.',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
  ];
  return lines.filter(line => line !== null).join('\n');
}
