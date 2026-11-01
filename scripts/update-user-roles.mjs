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

console.log('Updating existing users with portalRole field...\n');

const usersToUpdate = [
  { email: 'student@bifti.school', displayName: 'Amina Ahmed', portalRole: 'student' },
  { email: 'teacher@bifti.school', displayName: 'Mrs. Adebayo', portalRole: 'teacher' },
  { email: 'examiner@bifti.school', displayName: 'Mr. Okafor', portalRole: 'examiner' },
];

for (const userData of usersToUpdate) {
  try {
    // First, find the user by email
    const findResponse = await fetch(`${url.replace(/\/$/, '')}/users?where=${encodeURIComponent(JSON.stringify({ email: userData.email }))}`, {
      method: 'GET',
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Master-Key': masterKey,
        'Content-Type': 'application/json'
      }
    });

    if (!findResponse.ok) {
      console.error(`❌ ${userData.email}: Failed to find user (${findResponse.status})`);
      continue;
    }

    const findData = await findResponse.json();
    
    if (!findData.results || findData.results.length === 0) {
      console.log(`⚠️  ${userData.email}: User not found in database`);
      continue;
    }

    const user = findData.results[0];
    const userId = user.objectId;

    // Update the user with portalRole and displayName
    const updateResponse = await fetch(`${url.replace(/\/$/, '')}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Master-Key': masterKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        portalRole: userData.portalRole,
        displayName: userData.displayName
      })
    });

    if (updateResponse.ok) {
      console.log(`✓ ${userData.email}: Updated with portalRole="${userData.portalRole}"`);
    } else {
      const errorData = await updateResponse.json();
      console.error(`❌ ${userData.email}: Update failed - ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    console.error(`❌ ${userData.email}: Error - ${error.message}`);
  }
}

console.log('\n✓ User roles update complete!');
