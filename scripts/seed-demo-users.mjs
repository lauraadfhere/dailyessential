import { readFile } from 'node:fs/promises';

const localEnv = await readFile(new URL('../.env.local', import.meta.url), 'utf8').catch(() => '');
for (const line of localEnv.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}
const url = process.env.PARSE_SERVER_URL;
const appId = process.env.PARSE_APPLICATION_ID;
const masterKey = process.env.PARSE_MASTER_KEY;
if (!url || !appId || !masterKey) throw new Error('Set Parse server, application and master keys in .env.local.');

const users = [
  { username: 'student@bifti.school', email: 'student@bifti.school', password: 'BiftiStudent!2026', displayName: 'Amina Ahmed', portalRole: 'student' },
  { username: 'teacher@bifti.school', email: 'teacher@bifti.school', password: 'BiftiTeacher!2026', displayName: 'Mrs. Adebayo', portalRole: 'teacher' },
  { username: 'examiner@bifti.school', email: 'examiner@bifti.school', password: 'BiftiExaminer!2026', displayName: 'Mr. Okafor', portalRole: 'examiner' },
  { username: 'admin@bifti.school', email: 'admin@bifti.school', password: 'BiftiAdmin!2026', displayName: 'School Admin', portalRole: 'admin' },
];
for (const user of users) {
  const response = await fetch(`${url.replace(/\/$/, '')}/users`, { method: 'POST', headers: { 'X-Parse-Application-Id': appId, 'X-Parse-Master-Key': masterKey, 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
  if (response.ok) {
    console.log(`${user.email}: created`);
  } else if (response.status === 400) {
    const errorData = await response.json();
    if (errorData.code === 202) {
      console.log(`${user.email}: already exists`);
    } else {
      throw new Error(`${user.email}: ${response.status} ${JSON.stringify(errorData)}`);
    }
  } else {
    throw new Error(`${user.email}: ${response.status} ${await response.text()}`);
  }
}
