# Bitfi.school dashboard access

## Development access

The development accounts below are stored in Parse and are validated by the login screen. They are not real school accounts and must be replaced before launch.

| Portal role | Login URL | Email | Password | Dashboard URL |
| --- | --- | --- | --- |
| Student (Amina Ahmed) | `http://localhost:3000/login/student?lang=fr` | `student@bifti.school` | `BiftiStudent!2026` | `http://localhost:3000/student/dashboard` |
| Teacher (Mrs. Adebayo) | `http://localhost:3000/login/teacher?lang=fr` | `teacher@bifti.school` | `BiftiTeacher!2026` | `http://localhost:3000/teacher/dashboard` |
| Examiner (Mr. Okafor) | `http://localhost:3000/login/examiner?lang=fr` | `examiner@bifti.school` | `BiftiExaminer!2026` | `http://localhost:3000/examiner/dashboard` |

## Complete role workspaces

All roles from the authority specification are available in the new role-aware workspace. Open the role directory at:

`http://localhost:3000/workspace`

Example direct links:

- Student overview: `http://localhost:3000/workspace/student/overview`
- Teacher assignments: `http://localhost:3000/workspace/teacher/assignments`
- Principal reports: `http://localhost:3000/workspace/principal/reports`
- Finance workspace: `http://localhost:3000/workspace/finance-officer/finance`
- Roles and authorities: `http://localhost:3000/workspace/super-administrator/roles`

## Before production

1. Create each user in Parse `_User` with a unique email and strong password.
2. Create the matching `Membership` and scoped `UserRole` records.
3. Replace browser session storage with a secure, server-managed HTTP-only session.
4. Protect all dashboard and workspace routes by checking the authenticated membership, role, scope, and permissions.
5. Never place a Parse master key in browser code or share real passwords in this file.
