import { readFile } from 'node:fs/promises';

const localEnv = await readFile(new URL('../.env.local', import.meta.url), 'utf8').catch(() => '');
for (const line of localEnv.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}
const url = process.env.PARSE_SERVER_URL || process.env.NEXT_PUBLIC_PARSE_SERVER_URL;
const appId = process.env.PARSE_APPLICATION_ID || process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID;

if (!url || !appId) throw new Error('Parse configuration not found');

console.log('Testing Parse login API...\n');
console.log(`Server: ${url}`);
console.log(`App ID: ${appId}\n`);

const testUsers = [
  { username: 'student@bifti.school', password: 'BiftiStudent!2026' },
  { username: 'teacher@bifti.school', password: 'BiftiTeacher!2026' },
  { username: 'examiner@bifti.school', password: 'BiftiExaminer!2026' },
];

for (const user of testUsers) {
  console.log(`Testing: ${user.username}`);
  
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/login?username=${encodeURIComponent(user.username)}&password=${encodeURIComponent(user.password)}`, {
      method: 'GET',
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-REST-API-Key': process.env.PARSE_REST_KEY || '',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`  ✓ Login successful`);
      console.log(`  - Session token: ${data.sessionToken?.substring(0, 20)}...`);
      console.log(`  - Object ID: ${data.objectId}`);
      console.log(`  - Portal role: ${data.portalRole || '(not set)'}`);
      console.log(`  - Display name: ${data.displayName || '(not set)'}`);
    } else {
      const errorText = await response.text();
      console.log(`  ❌ Login failed (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  console.log('');
}
