import { readFile } from 'node:fs/promises';

const localEnv = await readFile(new URL('../.env.local', import.meta.url), 'utf8').catch(() => '');
for (const line of localEnv.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const url = process.env.PARSE_SERVER_URL;
const appId = process.env.PARSE_APPLICATION_ID;
const masterKey = process.env.PARSE_MASTER_KEY;
if (!url || !appId || !masterKey) {
  throw new Error('Set PARSE_SERVER_URL, PARSE_APPLICATION_ID and PARSE_MASTER_KEY in .env.local before applying the schema.');
}

const base = url.replace(/\/$/, '');
const headers = {
  'X-Parse-Application-Id': appId,
  'X-Parse-Master-Key': masterKey,
  'Content-Type': 'application/json',
};

const schema = JSON.parse(await readFile(new URL('../schema/parse-schema.json', import.meta.url), 'utf8'));

/** Master-only CLP — app uses master/REST on the server; keep classes private by default. */
const restrictedCLP = {
  find: {},
  get: {},
  count: {},
  create: {},
  update: {},
  delete: {},
  addField: {},
};

async function getExistingSchema(className) {
  const response = await fetch(`${base}/schemas/${className}`, { headers });
  if (response.status === 404) return null;
  if (!response.ok) {
    const text = await response.text();
    // Back4App returns 400 + code 103 when the class does not exist yet.
    if (response.status === 400 && /does not exist/i.test(text)) return null;
    throw new Error(`${className}: unable to read schema (${response.status}) ${text}`);
  }
  return response.json();
}

for (const definition of schema.classes) {
  const existing = await getExistingSchema(definition.className);

  if (!existing) {
    const createResponse = await fetch(`${base}/schemas/${definition.className}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...definition, classLevelPermissions: restrictedCLP }),
    });
    if (!createResponse.ok) throw new Error(`${definition.className}: create failed (${createResponse.status}) ${await createResponse.text()}`);
    console.log(`${definition.className}: created and secured`);
    continue;
  }

  const existingFields = existing.fields || {};
  const missingFields = {};
  for (const [fieldName, fieldDef] of Object.entries(definition.fields || {})) {
    if (!existingFields[fieldName]) missingFields[fieldName] = fieldDef;
  }

  const putBody = { classLevelPermissions: restrictedCLP };
  if (Object.keys(missingFields).length) putBody.fields = missingFields;

  const putResponse = await fetch(`${base}/schemas/${definition.className}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(putBody),
  });
  if (!putResponse.ok) throw new Error(`${definition.className}: update failed (${putResponse.status}) ${await putResponse.text()}`);

  const added = Object.keys(missingFields);
  console.log(`${definition.className}: optimized (${added.length ? `+fields ${added.join(', ')}` : 'fields up to date'}; CLP secured)`);
}

console.log('\n✓ Schema optimize complete.');
