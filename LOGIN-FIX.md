# Login Fix - 403 Unauthorized Error

## Problem

Login was failing with:
```
Parse request failed (403): {"error":"unauthorized"}
```

## Root Cause

**Back4App Parse Server requires the REST API Key (`X-Parse-REST-API-Key`) for authentication requests.**

The frontend was only sending:
- `X-Parse-Application-Id`
- `Content-Type`

But Parse expected:
- `X-Parse-Application-Id`
- `X-Parse-REST-API-Key` ✨ **This was missing!**

## Solution

### 1. Added REST API Key to Environment Variables

**File**: `.env.local`
```env
NEXT_PUBLIC_PARSE_REST_KEY=8AqeCIdPT7mxdyEKsWjN71h9O3XW68h2RuBec9wV
```

### 2. Updated Parse Library to Include REST Key

**File**: `src/lib/parse.ts`

```typescript
const restKey = process.env.NEXT_PUBLIC_PARSE_REST_KEY;

export async function parseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  // ... existing code ...
  
  const headers: Record<string, string> = {
    'X-Parse-Application-Id': appId,
    'Content-Type': 'application/json',
    ...init.headers as Record<string, string>
  };
  
  // ✅ Add REST API key if available
  if (restKey) {
    headers['X-Parse-REST-API-Key'] = restKey;
  }
  
  const response = await fetch(url, { 
    ...init, 
    headers,
    cache: 'no-store' 
  });
  // ...
}
```

### 3. Updated User Records with Portal Roles

Created and ran: `npm run users:update`

This script:
- Finds existing users by email
- Updates them with `portalRole` and `displayName` fields
- Confirms the data is properly set

## Verification

Test script confirmed all logins now work:

```bash
npm run test:login
```

Results:
```
✓ student@bifti.school: Login successful
  - Portal role: student
  - Display name: Amina Ahmed

✓ teacher@bifti.school: Login successful
  - Portal role: teacher
  - Display name: Mrs. Adebayo

✓ examiner@bifti.school: Login successful
  - Portal role: examiner
  - Display name: Mr. Okafor
```

## Test the Fix

### 1. Restart Development Server

If your dev server is running, restart it to pick up the new environment variable:

```bash
# Press Ctrl+C to stop the server
npm run dev
```

### 2. Try Logging In

**Student Portal:**
- URL: http://localhost:3000/login/student
- Email: `student@bifti.school`
- Password: `BiftiStudent!2026`

**Teacher Portal:**
- URL: http://localhost:3000/login/teacher
- Email: `teacher@bifti.school`
- Password: `BiftiTeacher!2026`

**Examiner Portal:**
- URL: http://localhost:3000/login/examiner
- Email: `examiner@bifti.school`
- Password: `BiftiExaminer!2026`

### 3. Expected Behavior

✅ **Success**: Redirects to dashboard (e.g., `/student/dashboard`)  
✅ **Role Validation**: Attempting to use wrong portal shows error message  
✅ **Session Data**: User info stored in sessionStorage

## What Was Fixed

| Issue | Status |
|-------|--------|
| 403 Unauthorized error | ✅ Fixed - Added REST API key |
| User portalRole not set | ✅ Fixed - Updated all users |
| Type definitions incomplete | ✅ Fixed - Added 'examiner' role |
| No role validation | ✅ Fixed - Validates on login |
| Missing session data | ✅ Fixed - Stores all user info |

## Files Modified

1. ✅ `.env.local` - Added `NEXT_PUBLIC_PARSE_REST_KEY`
2. ✅ `.env.example` - Added REST key template
3. ✅ `src/lib/parse.ts` - Include REST key in headers
4. ✅ `scripts/update-user-roles.mjs` - NEW: Update existing users
5. ✅ `scripts/test-login.mjs` - NEW: Test login functionality
6. ✅ `scripts/seed-demo-users.mjs` - Fixed error handling
7. ✅ `package.json` - Added `users:update` script

## Quick Commands Reference

```bash
# Configure user fields (run once)
npm run users:configure

# Apply database schema (run once)
npm run schema:apply

# Update existing user roles (run once)
npm run users:update

# Seed new demo users (optional if users already exist)
npm run users:seed

# Start development server
npm run dev
```

## Troubleshooting

### Still Getting 403 Error?

1. **Check environment variables are loaded:**
   ```bash
   # Stop and restart dev server
   npm run dev
   ```

2. **Verify REST key is set:**
   ```bash
   # Check .env.local has NEXT_PUBLIC_PARSE_REST_KEY
   cat .env.local | findstr NEXT_PUBLIC_PARSE_REST_KEY
   ```

3. **Clear browser cache:**
   - Open DevTools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

### Users Don't Have portalRole?

```bash
npm run users:update
```

### Need to Create New Users?

```bash
npm run users:seed
```

## Security Note

⚠️ The REST API Key is now exposed to the browser via `NEXT_PUBLIC_PARSE_REST_KEY`.

**For Back4App**, this is acceptable because:
- REST keys are meant for client-side use
- Master Key remains server-side only
- Parse ACLs should be configured for data protection

**Before production:**
- Configure Parse Class-Level Permissions (CLPs)
- Set up Parse Access Control Lists (ACLs)
- Implement server-side session validation
- Use environment-specific keys (dev/staging/prod)

## Success! 🎉

Your login should now work correctly. The 403 error is resolved by including the REST API key in all Parse requests.
