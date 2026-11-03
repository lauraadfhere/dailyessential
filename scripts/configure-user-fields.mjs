import { readFile } from 'node:fs/promises';

// Load environment variables from .env.local
const localEnv = await readFile(new URL('../.env.local', import.meta.url), 'utf8').catch(() => '');
for (const line of localEnv.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const url = process.env.PARSE_SERVER_URL;
const appId = process.env.PARSE_APPLICATION_ID;
const masterKey = process.env.PARSE_MASTER_KEY;

if (!url || !appId || !masterKey) {
  throw new Error('Set PARSE_SERVER_URL, PARSE_APPLICATION_ID and PARSE_MASTER_KEY in .env.local before configuring user fields.');
}

// Define custom fields for _User class
const userFields = {
  fields: {
    displayName: { type: 'String' },
    portalRole: { type: 'String' },
    avatarUrl: { type: 'String' },
    avatarPublicId: { type: 'String' },
    phone: { type: 'String' },
    bio: { type: 'String' },
    department: { type: 'String' }
  }
};

console.log('Configuring custom fields for _User class...');

// Update _User schema with custom fields
const response = await fetch(`${url.replace(/\/$/, '')}/schemas/_User`, {
  method: 'PUT',
  headers: {
    'X-Parse-Application-Id': appId,
    'X-Parse-Master-Key': masterKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(userFields)
});

if (response.ok) {
  console.log('✓ _User: custom fields added (displayName, portalRole)');
} else if (response.status === 400) {
  const errorData = await response.json();
  if (errorData.error && errorData.error.includes('already exists')) {
    console.log('✓ _User: custom fields already exist');
  } else {
    throw new Error(`_User: ${response.status} ${JSON.stringify(errorData)}`);
  }
} else {
  throw new Error(`_User: ${response.status} ${await response.text()}`);
}

console.log('\n✓ User fields configuration complete!');
