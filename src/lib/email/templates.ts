/**
 * HTML e-mail templates for Daily Essential School (sender: mail@dailyessential.ca).
 *
 * Built with nested tables and inline CSS so they render in Gmail, Outlook, Apple Mail and phone clients.
 * Every template returns { subject, html, text }. Nothing here sends mail; see mailer.ts.
 * All dynamic values are HTML-escaped. Marks are shown out of 20 (Algerian system).
 */

export type MailLang = 'en' | 'fr' | 'ar';
export type Mail = { subject: string; html: string; text: string };

export const MAIL_FROM_ADDRESS = 'mail@dailyessential.ca';
export const SCHOOL_NAME = 'Daily Essential School';
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailyessential.ca').replace(/\/$/, '');
const BRAND = '#1738a8';
const INK = '#15133d';

const UI: Record<MailLang, { hello: string; open: string; why: string; settings: string; team: string; pass: string; below: string; mark: string; notes: string; due: string; course: string; from: string }> = {
  en: { hello: 'Hello', open: 'Open in Daily Essential', why: 'You receive this e-mail because you have an account at Daily Essential School.', settings: 'Questions? Reply to this e-mail or write to', team: 'The Daily Essential School team', pass: 'Pass', below: 'Below the pass mark', mark: 'Mark', notes: 'Notes', due: 'Due', course: 'Course', from: 'From' },
  fr: { hello: 'Bonjour', open: 'Ouvrir Daily Essential', why: 'Vous recevez ce message car vous avez un compte à Daily Essential School.', settings: 'Une question ? Répondez à ce message ou écrivez à', team: "L'équipe de Daily Essential School", pass: 'Admis', below: 'Sous la moyenne', mark: 'Note', notes: 'Remarques', due: 'À rendre le', course: 'Cours', from: 'De' },
  ar: { hello: 'مرحبًا', open: 'افتح ديلي إسنشيال', why: 'تصلك هذه الرسالة لأن لديك حسابًا في مدرسة ديلي إسنشيال.', settings: 'لديك سؤال؟ ردّ على هذه الرسالة أو اكتب إلى', team: 'فريق مدرسة ديلي إسنشيال', pass: 'ناجح', below: 'أقل من المعدل', mark: 'العلامة', notes: 'ملاحظات', due: 'الموعد', course: 'المقرر', from: 'من' },
};

export function esc(value: unknown) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const abs = (link?: string) => (!link ? SITE : /^https?:\/\//.test(link) ? link : `${SITE}${link.startsWith('/') ? '' : '/'}${link}`);

/** Newlines to <br>, after escaping. */
const multiline = (value: string) => esc(value).replace(/\r?\n/g, '<br>');

/** Algerian scale label for a mark out of 20. */
export function appreciation(mark: number) {
  return mark >= 16 ? 'Très bien' : mark >= 14 ? 'Bien' : mark >= 12 ? 'Assez bien' : mark >= 10 ? 'Passable' : 'Insuffisant';
}
export const toTwenty = (marks: number, max: number) => Math.round(((max > 0 ? marks / max : 0) * 20) * 10) / 10;

// ---------------------------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------------------------

const p = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:24px;color:#3d4450;">${html}</p>`;
const h = (text: string) => `<h1 style="margin:0 0 14px;font-size:22px;line-height:30px;color:${INK};font-weight:700;">${esc(text)}</h1>`;
const h2 = (text: string) => `<h2 style="margin:22px 0 8px;font-size:12px;line-height:18px;letter-spacing:.12em;text-transform:uppercase;color:#6b7380;font-weight:700;">${esc(text)}</h2>`;

const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;"><tr><td style="background:${BRAND};border-radius:4px;">` +
  `<a href="${esc(href)}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${esc(label)}</a></td></tr></table>`;

const panel = (inner: string, accent = BRAND) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 14px;"><tr><td style="background:#f4f7ff;border-left:4px solid ${accent};padding:14px 16px;font-size:14px;line-height:22px;color:#3d4450;">${inner}</td></tr></table>`;

const list = (items: string[], ordered = false) => {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} style="margin:0 0 14px;padding-left:22px;font-size:14px;line-height:23px;color:#3d4450;">${items.map(item => `<li style="margin-bottom:5px;">${esc(item)}</li>`).join('')}</${tag}>`;
};

/** Big "14.5 / 20" badge with the appreciation. */
function markBadge(mark: number, lang: MailLang) {
  const t = UI[lang];
  const pass = mark >= 10;
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;"><tr>` +
    `<td style="background:${pass ? BRAND : '#a33a3a'};color:#ffffff;padding:14px 22px;border-radius:4px;text-align:center;">` +
    `<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.8;">${esc(t.mark)}</div>` +
    `<div style="font-size:34px;line-height:40px;font-weight:700;">${mark}<span style="font-size:18px;opacity:.8;"> / 20</span></div>` +
    `<div style="font-size:12px;opacity:.9;">${esc(appreciation(mark))} · ${esc(pass ? t.pass : t.below)}</div>` +
    `</td></tr></table>`
  );
}

function kv(rows: [string, string][]) {
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border-top:1px solid #e6e9ee;">` +
    rows.filter(([, value]) => value).map(([key, value]) =>
      `<tr><td style="padding:9px 0;border-bottom:1px solid #e6e9ee;font-size:13px;color:#6b7380;width:38%;">${esc(key)}</td>` +
      `<td style="padding:9px 0;border-bottom:1px solid #e6e9ee;font-size:14px;color:${INK};font-weight:600;">${esc(value)}</td></tr>`).join('') +
    `</table>`
  );
}

/** The shared frame: brand header, white card, footer. */
function layout(opts: { lang?: MailLang; preheader: string; body: string; title: string }) {
  const lang = opts.lang || 'en';
  const t = UI[lang];
  const rtl = lang === 'ar';
  const align = rtl ? 'right' : 'left';
  return (
    `<!doctype html><html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}" xmlns="http://www.w3.org/1999/xhtml"><head>` +
    `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="x-apple-disable-message-reformatting">` +
    `<title>${esc(opts.title)}</title>` +
    `<style>@media only screen and (max-width:620px){.card{padding:22px 18px !important}.wrap{width:100% !important}}</style></head>` +
    `<body style="margin:0;padding:0;background:#f4f5fa;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;">` +
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f5fa;">${esc(opts.preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5fa;"><tr><td align="center" style="padding:24px 12px;">` +
    `<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">` +
    `<tr><td style="background:${BRAND};padding:20px 28px;text-align:${align};border-radius:6px 6px 0 0;">` +
    `<a href="${SITE}" style="font-size:19px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:.01em;">Daily Essential <span style="font-weight:400;opacity:.85;">School</span></a></td></tr>` +
    `<tr><td class="card" style="background:#ffffff;padding:30px 32px;text-align:${align};">${opts.body}` +
    `<p style="margin:26px 0 0;font-size:14px;line-height:22px;color:#3d4450;">${esc(t.team)}</p></td></tr>` +
    `<tr><td style="padding:18px 12px 0;text-align:center;font-size:12px;line-height:19px;color:#8a93a0;">` +
    `${esc(t.why)}<br>${esc(t.settings)} <a href="mailto:${MAIL_FROM_ADDRESS}" style="color:${BRAND};">${MAIL_FROM_ADDRESS}</a><br>` +
    `<a href="${SITE}" style="color:#8a93a0;">${SITE.replace(/^https?:\/\//, '')}</a> · © ${new Date().getFullYear()} ${SCHOOL_NAME}</td></tr>` +
    `</table></td></tr></table></body></html>`
  );
}

const plain = (...parts: (string | undefined | false)[]) => parts.filter(Boolean).join('\n\n');

// ---------------------------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------------------------

type Base = { name: string; lang?: MailLang };

/** Generic in-app notification, sent as e-mail too. */
export function notificationEmail(d: Base & { title: string; message: string; link?: string }): Mail {
  const t = UI[d.lang || 'en'];
  const url = abs(d.link);
  return {
    subject: d.title,
    html: layout({ lang: d.lang, title: d.title, preheader: d.message.slice(0, 110), body: h(d.title) + p(`${esc(t.hello)} ${esc(d.name)},`) + panel(multiline(d.message)) + button(t.open, url) }),
    text: plain(`${t.hello} ${d.name},`, d.title, d.message, `${t.open}: ${url}`),
  };
}

/** A mark and notes from a teacher: course task, assignment or quiz. */
export function gradeEmail(d: Base & { courseTitle?: string; itemTitle: string; kind: 'task' | 'assignment' | 'quiz'; marks: number; max: number; feedback?: string; gradedBy?: string; link?: string }): Mail {
  const t = UI[d.lang || 'en'];
  const mark = toTwenty(d.marks, d.max);
  const url = abs(d.link);
  const kind = d.kind === 'assignment' ? 'Assignment' : d.kind === 'quiz' ? 'Quiz' : 'Task';
  const subject = `${kind} graded: ${d.itemTitle} — ${mark}/20`;
  return {
    subject,
    html: layout({
      lang: d.lang, title: subject, preheader: `Your mark is ${mark}/20 (${appreciation(mark)}).`,
      body:
        h(`${kind} graded`) + p(`${esc(t.hello)} ${esc(d.name)},`) +
        p(`${d.gradedBy ? `<b>${esc(d.gradedBy)}</b> has` : 'Your teacher has'} marked <b>${esc(d.itemTitle)}</b>.`) +
        markBadge(mark, d.lang || 'en') +
        kv([[t.course, d.courseTitle || ''], ['Original score', `${d.marks} / ${d.max}`]]) +
        (d.feedback ? h2(t.notes) + panel(multiline(d.feedback), '#2e9fff') : '') +
        p('If you think this mark is wrong, open the task and choose <b>Report this mark</b>, or write to your teacher in Messages.') +
        button(t.open, url),
    }),
    text: plain(`${t.hello} ${d.name},`, `${kind} graded: ${d.itemTitle}`, `${t.mark}: ${mark}/20 (${appreciation(mark)}) — score ${d.marks}/${d.max}`, d.feedback && `${t.notes}: ${d.feedback}`, `${t.open}: ${url}`),
  };
}

/** A new assignment for the learners of a course. */
export function assignmentPostedEmail(d: Base & { title: string; courseTitle?: string; dueAt?: string; maxMarks?: number; description?: string; postedBy?: string; link?: string }): Mail {
  const t = UI[d.lang || 'en'];
  const url = abs(d.link || '/student/assignments');
  const due = d.dueAt ? new Date(d.dueAt).toUTCString().replace(' GMT', ' UTC') : '';
  const subject = `New assignment: ${d.title}`;
  return {
    subject,
    html: layout({
      lang: d.lang, title: subject, preheader: `${d.courseTitle || 'Assignment'}${due ? ` — due ${due}` : ''}`,
      body:
        h('New assignment') + p(`${esc(t.hello)} ${esc(d.name)},`) +
        p(`${d.postedBy ? `<b>${esc(d.postedBy)}</b> posted` : 'A new assignment was posted'}: <b>${esc(d.title)}</b>.`) +
        kv([[t.course, d.courseTitle || ''], [t.due, due], ['Marked out of', `${d.maxMarks ?? 20}`]]) +
        (d.description ? h2('Instructions') + panel(multiline(d.description)) : '') +
        p('Hand in your work as a <b>PDF</b> from the Assignments page.') + button('Hand in my PDF', url),
    }),
    text: plain(`${t.hello} ${d.name},`, subject, d.courseTitle && `${t.course}: ${d.courseTitle}`, due && `${t.due}: ${due}`, d.description, `Hand in a PDF: ${url}`),
  };
}

/** AI study notes built from the learner's mistakes. */
export function studyNotesEmail(d: Base & { courseTitle: string; moduleTitle: string; mistakes: { question: string; whyWrong: string; tip: string }[]; notes: string[]; guidelines: string[]; link?: string }): Mail {
  const t = UI[d.lang || 'en'];
  const url = abs(d.link);
  const subject = `Your study notes: ${d.moduleTitle}`;
  const mistakes = d.mistakes.map(m =>
    `<tr><td style="padding:10px 12px;border-left:4px solid ${INK};background:#f8f9fb;font-size:14px;line-height:22px;color:#3d4450;"><b style="color:${INK};">${esc(m.question)}</b><br>Why: ${esc(m.whyWrong)}<br><span style="color:#6b7380;">Tip: ${esc(m.tip)}</span></td></tr><tr><td style="height:8px;"></td></tr>`).join('');
  return {
    subject,
    html: layout({
      lang: d.lang, title: subject, preheader: `${d.courseTitle} · notes and guidelines written from your own answers.`,
      body:
        h('Your study notes') + p(`${esc(t.hello)} ${esc(d.name)},`) +
        p(`DAMMI studied your answers and your teacher's comments in <b>${esc(d.moduleTitle)}</b> (${esc(d.courseTitle)}) and wrote these notes for you.`) +
        (d.mistakes.length ? h2('Your mistakes') + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${mistakes}</table>` : '') +
        (d.notes.length ? h2('Revision notes') + list(d.notes) : '') +
        (d.guidelines.length ? h2('How to improve') + list(d.guidelines, true) : '') +
        `<p style="margin:0 0 6px;font-size:12px;line-height:19px;color:#8a93a0;">AI-generated from your lesson and results. Check important points against the lesson itself.</p>` +
        button(t.open, url),
    }),
    text: plain(`${t.hello} ${d.name},`, subject, d.mistakes.length ? `Your mistakes:\n${d.mistakes.map(m => `- ${m.question} (${m.whyWrong}) Tip: ${m.tip}`).join('\n')}` : '', d.notes.length ? `Revision notes:\n${d.notes.map(n => `- ${n}`).join('\n')}` : '', d.guidelines.length ? `How to improve:\n${d.guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}` : '', `${t.open}: ${url}`),
  };
}

/** A reply in a message thread (teacher to learner, or learner to teacher). */
export function messageReplyEmail(d: Base & { from: string; subject: string; excerpt: string; link?: string; markReview?: boolean }): Mail {
  const t = UI[d.lang || 'en'];
  const url = abs(d.link || '/student/messages');
  const subject = d.markReview ? `Mark review: ${d.subject}` : `New reply: ${d.subject}`;
  return {
    subject,
    html: layout({
      lang: d.lang, title: subject, preheader: d.excerpt.slice(0, 110),
      body: h(d.markReview ? 'Mark review update' : 'You have a new reply') + p(`${esc(t.hello)} ${esc(d.name)},`) + p(`<b>${esc(d.from)}</b> wrote in <b>${esc(d.subject)}</b>:`) + panel(multiline(d.excerpt)) + button('Read and reply', url),
    }),
    text: plain(`${t.hello} ${d.name},`, `${d.from} wrote in "${d.subject}":`, d.excerpt, `Reply: ${url}`),
  };
}

/** Sent to staff when a learner asks a question or reports a mark. */
export function staffAlertEmail(d: Base & { learner: string; subject: string; courseTitle?: string; excerpt: string; kind: 'question' | 'mark-dispute' | 'task' | 'assignment'; link?: string }): Mail {
  const url = abs(d.link || '/teacher/messages');
  const heading = d.kind === 'mark-dispute' ? 'A learner reported a mark' : d.kind === 'task' ? 'A task is waiting to be graded' : d.kind === 'assignment' ? 'A new PDF was handed in' : 'A learner sent a message';
  const subject = `${heading}: ${d.learner}`;
  return {
    subject,
    html: layout({
      lang: d.lang, title: subject, preheader: `${d.learner} · ${d.subject}`,
      body: h(heading) + p(`Hello ${esc(d.name)},`) + kv([['Learner', d.learner], ['About', d.subject], [UI.en.course, d.courseTitle || '']]) + (d.excerpt ? panel(multiline(d.excerpt)) : '') + button('Open', url),
    }),
    text: plain(`Hello ${d.name},`, `${heading}: ${d.learner}`, `About: ${d.subject}`, d.excerpt, `Open: ${url}`),
  };
}

/** Confirmation after enrolling in a course. */
export function enrolmentEmail(d: Base & { courseTitle: string; duration?: string; modules?: number; link?: string }): Mail {
  const t = UI[d.lang || 'en'];
  const url = abs(d.link);
  const subject = `You are enrolled in ${d.courseTitle}`;
  return {
    subject,
    html: layout({
      lang: d.lang, title: subject, preheader: 'Start with module 1 whenever you are ready.',
      body: h(`Welcome to ${d.courseTitle}`) + p(`${esc(t.hello)} ${esc(d.name)},`) + p('Your enrolment is confirmed. Work through the modules at your own pace, take the quizzes, submit your tasks and track your marks any time.') +
        kv([[t.course, d.courseTitle], ['Duration', d.duration || ''], ['Modules', d.modules ? String(d.modules) : '']]) +
        panel('Marks at Daily Essential are out of <b>20</b>. The pass mark is <b>10/20</b>.') + button('Start module 1', url),
    }),
    text: plain(`${t.hello} ${d.name},`, subject, 'Marks are out of 20; the pass mark is 10/20.', `Start: ${url}`),
  };
}

/** Progress summary (can be sent weekly). */
export function progressReportEmail(d: Base & { overall?: { mark: number; label: string }; courses: { title: string; mark: number; completion: number }[]; todo: string[]; link?: string }): Mail {
  const t = UI[d.lang || 'en'];
  const url = abs(d.link || '/student/track');
  const subject = d.overall ? `Your progress report — ${d.overall.mark}/20` : 'Your progress report';
  const rows = d.courses.map(c =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #e6e9ee;font-size:14px;color:${INK};font-weight:600;">${esc(c.title)}<br><span style="font-weight:400;font-size:12px;color:#6b7380;">${c.completion}% of modules done</span></td>` +
    `<td style="padding:10px 0;border-bottom:1px solid #e6e9ee;text-align:right;font-size:16px;font-weight:700;color:${c.mark >= 10 ? BRAND : '#a33a3a'};white-space:nowrap;">${c.mark}/20</td></tr>`).join('');
  return {
    subject,
    html: layout({
      lang: d.lang, title: subject, preheader: d.todo[0] ? `Next: ${d.todo[0]}` : 'See how you are doing.',
      body:
        h('Your progress report') + p(`${esc(t.hello)} ${esc(d.name)},`) +
        (d.overall ? markBadge(d.overall.mark, d.lang || 'en') : '') +
        (d.courses.length ? h2('Courses') + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">${rows}</table>` : p('You are not enrolled in a course yet.')) +
        (d.todo.length ? h2('What to do next') + list(d.todo.slice(0, 6)) : '') + button('Open my tracker', url),
    }),
    text: plain(`${t.hello} ${d.name},`, subject, d.courses.map(c => `- ${c.title}: ${c.mark}/20 (${c.completion}% done)`).join('\n'), d.todo.length ? `Next:\n${d.todo.slice(0, 6).map(i => `- ${i}`).join('\n')}` : '', `${t.open}: ${url}`),
  };
}

/** Admission application status for the guardian. */
export function admissionUpdateEmail(d: { guardianName: string; childName: string; reference: string; status: string; lang?: MailLang; link?: string }): Mail {
  const url = abs(d.link || '/admissions');
  const status = d.status.replace(/_/g, ' ').toLowerCase();
  const subject = `Application ${d.reference}: ${status}`;
  return {
    subject,
    html: layout({
      lang: d.lang, title: subject, preheader: `Update for ${d.childName}`,
      body: h('Your application was updated') + p(`${esc(UI[d.lang || 'en'].hello)} ${esc(d.guardianName)},`) + p(`The application for <b>${esc(d.childName)}</b> is now <b>${esc(status)}</b>.`) + kv([['Reference', d.reference], ['Status', status]]) + button('Track my application', url),
    }),
    text: plain(`Hello ${d.guardianName},`, `The application for ${d.childName} (${d.reference}) is now ${status}.`, `Track: ${url}`),
  };
}

export const EMAIL_TEMPLATES = ['notification', 'grade', 'assignment', 'notes', 'reply', 'staff-alert', 'enrolment', 'progress', 'admission'] as const;
export type EmailTemplateName = (typeof EMAIL_TEMPLATES)[number];

/** Sample data for every template, used by the admin preview and the test send. */
export function sampleEmail(name: EmailTemplateName, lang: MailLang = 'en'): Mail {
  const base = { name: 'Amina Ahmed', lang };
  switch (name) {
    case 'grade': return gradeEmail({ ...base, courseTitle: 'Physics', itemTitle: 'Guided practical activity (module 3)', kind: 'task', marks: 8.5, max: 10, gradedBy: 'Mrs. Adebayo', feedback: 'Clear method and good use of units.\nNext time, show the final calculation step by step.', link: '/courses/physics/reader/2' });
    case 'assignment': return assignmentPostedEmail({ ...base, title: 'Motion graphs report', courseTitle: 'Physics', dueAt: new Date(Date.now() + 7 * 864e5).toISOString(), maxMarks: 20, description: 'Plot the data provided in class and explain what the graph tells you about acceleration.', postedBy: 'Mrs. Adebayo' });
    case 'notes': return studyNotesEmail({ ...base, courseTitle: 'Physics', moduleTitle: 'Motion, speed, velocity, and acceleration', mistakes: [{ question: 'Speed vs velocity', whyWrong: 'Velocity includes direction, speed does not.', tip: 'Think "velocity = speed + direction".' }], notes: ['Speed = distance ÷ time.', 'Acceleration is the change in velocity per second.'], guidelines: ['Redo the quiz after rereading section 2.', 'Draw one speed-time graph by hand.'], link: '/courses/physics/reader/1' });
    case 'reply': return messageReplyEmail({ ...base, from: 'Mrs. Adebayo', subject: 'Mark review: Physics, module 3', excerpt: 'I checked your work again and corrected the mark to 9/10. Thank you for pointing it out.', markReview: true });
    case 'staff-alert': return staffAlertEmail({ name: 'Mrs. Adebayo', lang, learner: 'Amina Ahmed', subject: 'Mark review: Physics, module 3 (8/10)', courseTitle: 'Physics', excerpt: 'I believe my calculation in step 4 was correct.', kind: 'mark-dispute' });
    case 'enrolment': return enrolmentEmail({ ...base, courseTitle: 'Physics', duration: '8 weeks', modules: 8, link: '/courses/physics/reader/0' });
    case 'progress': return progressReportEmail({ ...base, overall: { mark: 13.4, label: 'Assez bien' }, courses: [{ title: 'Physics', mark: 14.5, completion: 62 }, { title: 'Mathematics', mark: 9.5, completion: 38 }], todo: ['Take the quiz in module 4 (Physics)', 'Hand in "Motion graphs report"', 'Read module 3 (Mathematics)'] });
    case 'admission': return admissionUpdateEmail({ lang, guardianName: 'Mr. Ahmed', childName: 'Amina Ahmed', reference: 'DE-2026-A1B2', status: 'DOCS_REVIEW' });
    default: return notificationEmail({ ...base, title: 'New assignment: Motion graphs report', message: 'Physics. Due Friday. Open Assignments to hand in your PDF.', link: '/student/assignments' });
  }
}
