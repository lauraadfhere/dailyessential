# Backend Access Configuration

## Overview

The Bitfi.school application uses **Back4App** (Parse Server) as the backend for authentication and data storage.

## Backend Configuration

### Environment Variables

All backend configuration is in `.env.local`:

```env
# Parse Server Configuration
NEXT_PUBLIC_PARSE_SERVER_URL=https://parseapi.back4app.com
NEXT_PUBLIC_PARSE_APPLICATION_ID=45V1BFalVXH8cn9K5dP8b9U5jldWSe3I7e2F8znL
NEXT_PUBLIC_PARSE_JAVASCRIPT_KEY=FuPSqs58OL7wcPnQaJfNKlDlZ3gxt4Y0ypPix26P

# Server-only keys (never expose to browser)
PARSE_SERVER_URL=https://parseapi.back4app.com
PARSE_APPLICATION_ID=45V1BFalVXH8cn9K5dP8b9U5jldWSe3I7e2F8znL
PARSE_MASTER_KEY=cRaoBxM8g3XfjN9IhPZBaNjFSSlAbj6iyJjVOV6b
```

## User Types and Roles

### Portal Roles

The application supports three main portal roles:

1. **student** - Student access portal
2. **teacher** - Teacher/Staff access portal  
3. **examiner** - Examiner & Controller portal

### User Schema

Each user in the Parse `_User` table has the following custom fields:

- `displayName` (String) - User's full display name
- `portalRole` (String) - The portal role: 'student', 'teacher', or 'examiner'
- `username` (String) - Login username (usually email)
- `email` (String) - User's email address
- `password` (String) - Hashed password (managed by Parse)

## Setup Instructions

### 1. Configure User Fields

Run this once to add custom fields to the _User class:

```bash
npm run users:configure
```

This adds `displayName` and `portalRole` fields to the Parse _User schema.

### 2. Apply Database Schema

Apply the full database schema (Organization, Campus, Membership, Roles, etc.):

```bash
npm run schema:apply
```

### 3. Seed Demo Users

Create the demo user accounts:

```bash
npm run users:seed
```

This creates three demo accounts:

| Role | Email | Password | Display Name |
|------|-------|----------|--------------|
| Student | student@bifti.school | BiftiStudent!2026 | Amina Ahmed |
| Teacher | teacher@bifti.school | BiftiTeacher!2026 | Mrs. Adebayo |
| Examiner | examiner@bifti.school | BiftiExaminer!2026 | Mr. Okafor |

## Authentication Flow

### 1. User Login

When a user logs in via `/login/[role]`:

1. Form submits email and password
2. Backend calls `signInWithParse(username, password)`
3. Parse validates credentials and returns user object with `sessionToken`
4. Frontend validates `portalRole` matches the login page role
5. If valid, session data is stored in `sessionStorage`:
   - `bifti.session` - Session token
   - `bifti.userId` - User object ID
   - `bifti.role` - Portal role
   - `bifti.userEmail` - User email
   - `bifti.displayName` - Display name
6. User is redirected to appropriate dashboard

### 2. Role Validation

The system validates that users access the correct portal:

- If a teacher tries to login via `/login/student`, they get an error
- The error message tells them which portal to use
- This prevents unauthorized cross-portal access

### 3. Session Management

Current session is stored in browser `sessionStorage`:

```javascript
sessionStorage.getItem('bifti.session') // Session token
sessionStorage.getItem('bifti.role')    // Portal role
sessionStorage.getItem('bifti.userId')  // User ID
```

## API Functions

### `signInWithParse(username, password)`

Authenticates user and returns full user object including:
- sessionToken
- objectId  
- email
- displayName
- portalRole

### `getUserWithSession(sessionToken)`

Retrieves current user data using a session token.

### `parseRequest<T>(path, init)`

Low-level Parse REST API wrapper for custom queries.

## Troubleshooting

### Error: "User account does not have a portalRole set"

**Solution**: Run `npm run users:seed` to recreate demo users with proper roles.

### Error: "This account is registered as a [role]"

**Cause**: User is trying to access wrong portal (e.g., teacher accessing student portal)

**Solution**: Use the correct login URL for your role:
- Students: `/login/student`
- Teachers: `/login/teacher`
- Examiners: `/login/examiner`

### Error: "Parse is not configured"

**Cause**: Missing environment variables

**Solution**: Ensure `.env.local` exists with all Parse configuration values.

### Error: "Parse request failed (401)"

**Cause**: Invalid credentials or expired session

**Solution**: 
1. Check username/password are correct
2. Ensure user exists in Parse dashboard
3. Try reseeding users with `npm run users:seed`

## Security Notes

⚠️ **Important Security Considerations**:

1. Never commit `.env.local` to git
2. The `PARSE_MASTER_KEY` should only be used server-side
3. Current session management uses sessionStorage (development only)
4. Before production:
   - Implement HTTP-only cookies for session management
   - Add server-side session validation
   - Enable role-based access control (RBAC) with Parse ACLs
   - Add rate limiting to login endpoint
   - Enable 2FA for sensitive roles

## Testing Access

### Development Server

```bash
npm run dev
```

### Test Login URLs

- Student: http://localhost:3000/login/student
- Teacher: http://localhost:3000/login/teacher  
- Examiner: http://localhost:3000/login/examiner

Use the credentials from the demo users table above.

## Parse Dashboard Access

To manage users and data directly:

1. Go to [Back4App Dashboard](https://dashboard.back4app.com/)
2. Login with your Back4App account
3. Select your Bitfi.school application
4. Navigate to:
   - **Database Browser** - View/edit data
   - **User Management** - Manage _User records
   - **API Reference** - View API endpoints

## Next Steps

For production deployment:

1. ✅ Configure custom user fields
2. ✅ Apply database schema
3. ✅ Seed demo users
4. ⏳ Implement server-side authentication middleware
5. ⏳ Add password reset functionality
6. ⏳ Implement proper session management
7. ⏳ Set up Parse Cloud Functions for business logic
8. ⏳ Configure Parse ACLs for data security
9. ⏳ Add role-based permissions system
10. ⏳ Enable audit logging
