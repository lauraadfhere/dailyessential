export type ParseUserRole = 'student' | 'teacher' | 'examiner' | 'admin';

const serverUrl = process.env.NEXT_PUBLIC_PARSE_SERVER_URL;
const appId = process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID;
const restKey = process.env.NEXT_PUBLIC_PARSE_REST_KEY;

export interface ParseUser {
  sessionToken: string;
  objectId: string;
  username: string;
  email: string;
  displayName?: string;
  portalRole?: ParseUserRole;
}

/** Parse REST helper. It activates when the public Parse environment values are supplied. */
export async function parseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!serverUrl || !appId) throw new Error('Parse is not configured. Add NEXT_PUBLIC_PARSE_SERVER_URL and NEXT_PUBLIC_PARSE_APPLICATION_ID.');
  
  const headers: Record<string, string> = {
    'X-Parse-Application-Id': appId,
    'Content-Type': 'application/json',
    ...init.headers as Record<string, string>
  };
  
  // Add REST API key if available (required by some Parse servers)
  if (restKey) {
    headers['X-Parse-REST-API-Key'] = restKey;
  }
  
  const response = await fetch(`${serverUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, { 
    ...init, 
    headers,
    cache: 'no-store' 
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Parse request failed (${response.status}): ${errorText}`);
  }
  
  return response.json() as Promise<T>;
}

export async function signInWithParse(username: string, password: string) {
  return parseRequest<ParseUser>(`login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
}

export async function getUserWithSession(sessionToken: string) {
  return parseRequest<ParseUser>('users/me', {
    headers: { 'X-Parse-Session-Token': sessionToken }
  });
}
