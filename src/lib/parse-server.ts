/** Server-only Parse REST helpers (master key when available). */

/**
 * Config is read lazily (per call) instead of at module load. On Cloudflare Workers,
 * secrets are only guaranteed to be on `process.env` once a request is being handled.
 */
function parseConfig() {
  return {
    serverUrl: process.env.PARSE_SERVER_URL || process.env.NEXT_PUBLIC_PARSE_SERVER_URL,
    appId: process.env.PARSE_APPLICATION_ID || process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID,
    masterKey: process.env.PARSE_MASTER_KEY,
    restKey: process.env.PARSE_REST_KEY || process.env.NEXT_PUBLIC_PARSE_REST_KEY,
  };
}

export function isParseConfigured() {
  const { serverUrl, appId } = parseConfig();
  return Boolean(serverUrl && appId);
}

export function hasParseMasterKey() {
  return Boolean(parseConfig().masterKey);
}

export async function parseServerRequest<T>(path: string, init: RequestInit = {}, useMaster = true): Promise<T> {
  const { serverUrl, appId, masterKey, restKey } = parseConfig();
  if (!serverUrl || !appId) throw new Error('Parse is not configured.');
  const headers: Record<string, string> = {
    'X-Parse-Application-Id': appId,
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (useMaster && masterKey) headers['X-Parse-Master-Key'] = masterKey;
  else if (restKey) headers['X-Parse-REST-API-Key'] = restKey;

  const response = await fetch(`${serverUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Parse ${path} failed (${response.status}): ${await response.text()}`);
  return response.json() as Promise<T>;
}

export async function parseQuery<T>(className: string, params: Record<string, string | number | undefined> = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const qs = search.toString();
  return parseServerRequest<{ results: T[] }>(`classes/${className}${qs ? `?${qs}` : ''}`);
}

export async function parseGet<T>(className: string, objectId: string) {
  return parseServerRequest<T>(`classes/${className}/${encodeURIComponent(objectId)}`);
}

export async function parseCreate<T extends object>(className: string, body: T) {
  return parseServerRequest<{ objectId: string; createdAt: string }>(`classes/${className}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function parseUpdate(className: string, objectId: string, body: Record<string, unknown>) {
  return parseServerRequest<{ updatedAt: string }>(`classes/${className}/${encodeURIComponent(objectId)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** Create a class with the given fields if it does not exist yet (no-op when it does or no master key). */
export async function parseEnsureClass(className: string, fields: Record<string, { type: string }>) {
  if (!hasParseMasterKey()) return;
  try {
    await parseServerRequest(`schemas/${className}`, { method: 'POST', body: JSON.stringify({ className, fields }) });
  } catch {
    /* already exists */
  }
}

/** Create an object, creating its class on first use and retrying once. */
export async function parseCreateEnsured<T extends object>(className: string, fields: Record<string, { type: string }>, body: T) {
  try {
    return await parseCreate(className, body);
  } catch {
    await parseEnsureClass(className, fields);
    return parseCreate(className, body);
  }
}

export async function getOrganizationPointer() {
  const { results } = await parseQuery<{ objectId: string }>('Organization', {
    where: JSON.stringify({ name: 'BIFTI School' }),
    limit: 1,
  });
  if (!results[0]) throw new Error('BIFTI School organization not found in Parse.');
  return { __type: 'Pointer' as const, className: 'Organization', objectId: results[0].objectId };
}
