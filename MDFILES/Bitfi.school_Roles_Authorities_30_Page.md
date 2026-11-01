# Bitfi.school — Roles, Authorities, Responsibilities & Relationships Specification

**Document:** `Bitfi.school_Roles_Authorities_30_Page.md`  
**Version:** 1.0  
**Date:** 8 October 2026  
**Purpose:** Complete role and authority model for Bitfi.school  
**Scope:** Students, families, educators, academic leadership, administration, operations, support, governance, AI governance and Bitfi platform personnel

---

# 1. Purpose of This Document

This document defines the complete human and system role model for Bitfi.school.

Bitfi.school is intended to serve as a complete school operating platform rather than a simple learning management system. A complete school platform must understand not only what users can do, but also:

- who they are;
- which institution they belong to;
- what authority they possess;
- which people and records they may access;
- what decisions they can make;
- which decisions require approval;
- who reports to whom;
- who can communicate with whom;
- which AI capabilities they can use;
- which actions must be audited;
- which responsibilities belong to another role.

The goal is to prevent a common weakness in school software: creating a generic `admin` role with unrestricted access.

Bitfi.school should instead use a structured authority model.

The platform should distinguish:

1. Identity
2. Role
3. Scope
4. Permission
5. Responsibility
6. Authority
7. Delegation
8. Approval
9. Relationship
10. Data classification
11. AI access
12. Auditability

A user can hold more than one role.

For example:

> A teacher may also be a department head.

A principal may also have a teacher profile.

A guardian may have three children.

An administrator may be responsible for two campuses.

Therefore, roles must be modeled as relationships rather than as a single database field.

---

# 2. Core Bitfi.school Role Philosophy

Bitfi.school should follow five principles.

## 2.1 Least privilege

Users receive only the access required for their responsibilities.

## 2.2 Scope-based authority

Authority should normally be limited to:

- organization;
- campus;
- department;
- program;
- class;
- course;
- student relationship;
- operational function.

## 2.3 Separation of duties

Important actions should not always be controlled by one person.

For example:

```text
Teacher enters grade
        ↓
Department Head reviews if required
        ↓
Academic authority finalizes
```

## 2.4 Human authority over high-impact decisions

AI may recommend.

Authorized humans decide.

Examples include:

- final grades;
- disciplinary actions;
- student placement;
- exclusion;
- safeguarding escalation;
- sensitive interventions.

## 2.5 Everything important is auditable

Important actions should produce an audit event.

---

# 3. Bitfi.school Authority Architecture

The recommended hierarchy is:

```text
BITFI PLATFORM
       │
       ▼
ORGANIZATION
       │
       ├── CAMPUS
       │     │
       │     ├── ACADEMIC LEADERSHIP
       │     │
       │     ├── DEPARTMENTS
       │     │     │
       │     │     └── TEACHERS
       │     │
       │     ├── CLASSES
       │     │     └── STUDENTS
       │     │
       │     └── OPERATIONS
       │
       └── FAMILIES
```

This hierarchy is only the organizational structure.

A permission engine determines what each role can actually do.

---

# 4. Role Categories

Bitfi.school should divide roles into eight categories.

## Category A — Learners

1. Student
2. Student Representative
3. Student Mentor / Peer Tutor

## Category B — Family

4. Parent
5. Guardian
6. Authorized Family Contact

## Category C — Teaching

7. Teacher
8. Teaching Assistant
9. Substitute Teacher
10. Class Advisor
11. Mentor Teacher

## Category D — Academic Leadership

12. Subject / Department Head
13. Curriculum Coordinator
14. Academic Coordinator
15. Examination Officer
16. Academic Director
17. Vice Principal
18. Principal / Head of School

## Category E — Student Support

19. Counselor
20. Special Education / Inclusion Specialist
21. Safeguarding Officer
22. School Nurse / Health Officer

## Category F — Administration and Operations

23. School Administrator
24. Admissions Officer
25. Registrar / Records Officer
26. Finance Officer
27. HR Officer
28. Librarian
29. IT Administrator
30. Facilities Manager
31. Transport Manager
32. Events Coordinator

## Category G — Governance and Compliance

33. Compliance Officer
34. Data Protection / Privacy Officer
35. Internal Auditor
36. AI Governance Officer
37. Board / Governance Member

## Category H — Bitfi Platform

38. Organization Owner
39. Organization Super Administrator
40. Bitfi Support Agent
41. Bitfi Security Administrator
42. Bitfi AI Operations Administrator
43. Bitfi Platform Administrator

The number of roles can be reduced for smaller schools. Bitfi should support role bundles.

---

# 5. Role Model

Every role should have:

```text
Role
├── Identity
├── Purpose
├── Scope
├── Responsibilities
├── Permissions
├── Restrictions
├── Relationships
├── Approval Authority
├── AI Access
├── Data Access
└── Audit Requirements
```

Example:

```yaml
role: teacher
scope:
  - assigned_courses
  - assigned_classes
  - assigned_students
authority:
  grade: draft
  attendance: write
  curriculum: contribute
  discipline: recommend
ai:
  tutor: yes
  teacher_copilot: yes
  admin_analytics: limited
```

---

# 6. Student Role

## Purpose

The Student is the primary learner and central beneficiary of Bitfi.school.

Students use Bitfi.school to:

- learn;
- complete assignments;
- attend classes;
- access resources;
- communicate appropriately;
- receive feedback;
- track progress;
- prepare for assessments;
- use the AI learning assistant;
- manage academic tasks.

## Core responsibilities

Students should:

1. Attend required learning activities.
2. Complete assignments.
3. Submit work honestly.
4. Follow school policies.
5. Communicate respectfully.
6. Protect account credentials.
7. Review feedback.
8. Ask for help when needed.
9. Maintain academic integrity.
10. Use AI according to school policy.

## Student permissions

Students may:

- view their profile;
- view their courses;
- view their schedule;
- view assignments;
- submit work;
- view permitted grades;
- view feedback;
- use approved AI tools;
- communicate through permitted channels;
- download authorized documents.

Students may not:

- modify official grades;
- access another student's records;
- access teacher private notes;
- access administrative data;
- modify attendance;
- approve official records.

## Student AI relationship

The AI Tutor serves as an educational assistant.

The AI should:

- explain;
- guide;
- quiz;
- provide hints;
- generate practice;
- create revision plans.

The AI should not:

- impersonate a teacher;
- modify grades;
- secretly communicate with parents;
- reveal confidential information;
- replace official school decisions.

---

# 7. Student Representative

## Purpose

Represents students in approved school activities.

Responsibilities:

- communicate student feedback;
- participate in student councils;
- assist with events;
- represent student interests.

Permissions should be limited.

A representative should not receive administrative access simply because they represent students.

---

# 8. Peer Tutor / Student Mentor

## Purpose

A student may help other students academically under teacher supervision.

Capabilities:

- participate in peer tutoring;
- share approved resources;
- assist with study sessions.

Restrictions:

- cannot access private grades;
- cannot access confidential student information;
- cannot impersonate teachers;
- cannot issue official feedback.

---

# 9. Parent Role

## Purpose

The Parent receives authorized information about their child.

A parent can:

- view child schedules;
- view assignments;
- view published grades;
- view attendance;
- receive announcements;
- communicate with authorized school staff;
- view invoices if finance access is enabled;
- access school documents.

Parents should not automatically see:

- teacher private notes;
- counselor records;
- confidential safeguarding records;
- other students;
- internal staff discussions.

---

# 10. Guardian Role

Guardian is a relationship-based role.

A guardian may be:

- parent;
- legal guardian;
- authorized caregiver;
- other legally recognized responsible adult.

The platform should support granular relationships.

Example:

```text
Student
 ├── Guardian A: full academic access
 ├── Guardian B: communication access
 └── Guardian C: emergency contact only
```

The school should control the authorization.

---

# 11. Authorized Family Contact

This role exists for individuals who are not primary guardians but are permitted to receive specific information.

Examples:

- emergency contact;
- authorized caregiver;
- sponsor;
- approved family representative.

Access must be explicitly configured.

---

# 12. Teacher Role

## Purpose

The Teacher is responsible for teaching assigned students and courses.

## Core duties

Teachers:

- prepare lessons;
- deliver instruction;
- take attendance;
- create assignments;
- assess work;
- provide feedback;
- monitor progress;
- communicate with students;
- communicate with families according to policy;
- use approved educational resources.

## Teacher permissions

Teachers may:

- access assigned classes;
- create lessons;
- create assignments;
- record attendance;
- grade assigned work;
- provide feedback;
- view learning analytics for authorized students;
- use Teacher Copilot;
- recommend interventions.

Teachers should not:

- modify another teacher's classes without permission;
- access unrelated students;
- access confidential counseling information;
- change institutional policies.

## Teacher authority

Teacher authority is primarily instructional.

A teacher should have strong authority over:

- classroom learning;
- lesson delivery;
- assignment creation;
- formative assessment.

Teacher authority should be limited for:

- final academic decisions;
- disciplinary decisions;
- safeguarding decisions;
- financial decisions.

---

# 13. Teaching Assistant

A Teaching Assistant supports the teacher.

Responsibilities:

- classroom support;
- assignment support;
- resource preparation;
- student assistance.

Permissions can include:

- attendance;
- assignment support;
- feedback drafts.

They should normally not have final-grade authority.

---

# 14. Substitute Teacher

A substitute teacher receives temporary authority.

Important principle:

> Substitute access must expire automatically.

Example:

```text
Teacher absent
      ↓
Substitute assigned
      ↓
Access active for class
      ↓
End of assignment
      ↓
Access automatically revoked
```

---

# 15. Class Advisor

The Class Advisor is responsible for a particular class/cohort.

Responsibilities:

- monitor class progress;
- coordinate teachers;
- review attendance;
- communicate with families;
- identify support needs;
- coordinate class activities.

The advisor may have broader visibility than a subject teacher but less authority than a department head.

---

# 16. Mentor Teacher

A mentor teacher supports another teacher.

Responsibilities:

- professional support;
- lesson observation;
- teaching resources;
- coaching;
- onboarding.

Mentor access should not automatically include confidential HR information.

---

# 17. Department Head

The Department Head manages a subject department.

Examples:

- Mathematics
- English
- French
- Science
- Computer Science

Responsibilities:

- curriculum coordination;
- teacher coordination;
- assessment moderation;
- resource quality;
- department performance;
- teacher support.

Authority:

```text
Teacher
   ↓
Department Head
   ↓
Academic Leadership
```

The Department Head may review grades or assessments according to school policy.

---

# 18. Curriculum Coordinator

The Curriculum Coordinator manages curriculum structure.

Responsibilities:

- learning objectives;
- curriculum mapping;
- progression;
- resource alignment;
- assessment alignment.

The Coordinator works closely with:

- teachers;
- department heads;
- academic director;
- AI curriculum tools.

---

# 19. Academic Coordinator

The Academic Coordinator connects classroom activity with institutional academic planning.

Responsibilities:

- academic schedules;
- course structures;
- progression;
- teacher coordination;
- academic reporting.

---

# 20. Examination Officer

The Examination Officer manages official assessments.

Responsibilities:

- examination scheduling;
- examination security;
- assessment administration;
- grading workflows;
- result publication;
- exam documentation.

Sensitive authority:

- exam access;
- assessment release;
- result workflows.

Exam security actions must be audited.

---

# 21. Academic Director

The Academic Director is responsible for institutional academic quality.

Responsibilities:

- academic policy;
- curriculum quality;
- assessment quality;
- teacher development;
- performance review;
- academic reporting.

Authority:

- approve academic structures;
- approve curriculum changes;
- oversee department heads;
- approve academic interventions.

---

# 22. Vice Principal

The Vice Principal supports the Principal.

Possible areas:

- academic affairs;
- student affairs;
- operations;
- discipline.

The exact authority should be configurable.

A Vice Principal may receive delegated authority from the Principal.

Delegation must be:

- explicit;
- scoped;
- time-limited where appropriate;
- auditable.

---

# 23. Principal / Head of School

The Principal is the highest operational authority within the school.

Responsibilities:

- institutional leadership;
- academic oversight;
- staff leadership;
- student welfare;
- policy execution;
- school performance;
- family/community relationships.

The Principal may approve:

- major academic decisions;
- staffing decisions according to policy;
- disciplinary decisions;
- operational policies.

The Principal should not automatically access data outside legitimate institutional purposes.

---

# 24. Counselor

The Counselor supports student wellbeing and guidance.

This role requires restricted data access.

Potential capabilities:

- counseling appointments;
- authorized notes;
- support plans;
- referrals.

Counselor information should be classified as restricted.

Teachers should not automatically see counselor notes.

---

# 25. Inclusion / Special Education Specialist

Supports students requiring educational accommodations.

Responsibilities:

- accommodation plans;
- accessibility;
- differentiated learning;
- teacher guidance;
- progress monitoring.

Information must be shared only with authorized personnel.

---

# 26. Safeguarding Officer

The Safeguarding Officer manages child protection and safety processes.

This role requires strong authority for approved safeguarding workflows.

Capabilities:

- receive reports;
- investigate according to policy;
- manage cases;
- record actions;
- escalate concerns;
- coordinate authorized personnel.

Safeguarding records should be highly restricted.

AI must not autonomously decide safeguarding outcomes.

---

# 27. School Nurse / Health Officer

Where the school provides health services, the Health Officer manages authorized health-related records.

Access should be tightly restricted.

Teachers should receive only information necessary for legitimate educational or safety purposes.

---

# 28. School Administrator

The School Administrator manages day-to-day administrative operations.

Responsibilities:

- user records;
- class records;
- scheduling;
- documentation;
- school configuration;
- support tickets.

This role should not automatically receive unrestricted academic or health access.

---

# 29. Admissions Officer

Responsibilities:

- applications;
- applicant records;
- enrollment;
- document collection;
- admissions communications.

Admissions information should be separated from ongoing academic records where appropriate.

---

# 30. Registrar / Records Officer

The Registrar manages official records.

Responsibilities:

- student records;
- transcripts;
- certificates;
- enrollment status;
- academic history;
- document verification.

Official record modifications must be strongly audited.

---

# 31. Finance Officer

Responsibilities:

- fees;
- invoices;
- payments;
- refunds;
- financial reports.

Finance access must be isolated from academic records unless needed.

Teachers should normally have no finance access.

---

# 32. HR Officer

Responsibilities:

- employee records;
- contracts;
- leave;
- onboarding;
- HR documents.

Student records should generally be outside this role's scope.

---

# 33. Librarian

Responsibilities:

- catalog;
- lending;
- returns;
- resources;
- library users.

The librarian can provide learning resources without accessing confidential academic records.

---

# 34. IT Administrator

Responsibilities:

- accounts;
- devices;
- integrations;
- technical configuration;
- security settings.

IT administrators should not automatically have unrestricted access to educational content.

Technical access and data access must be separated.

---

# 35. Facilities Manager

Responsibilities:

- buildings;
- classrooms;
- maintenance;
- inventory;
- incidents;
- equipment.

---

# 36. Transport Manager

Responsibilities:

- routes;
- buses;
- drivers;
- schedules;
- transportation assignments.

Transport information should be limited to operational necessity.

---

# 37. Events Coordinator

Responsibilities:

- events;
- calendars;
- registrations;
- venues;
- communications.

---

# 38. Compliance Officer

Responsibilities:

- policy compliance;
- internal controls;
- regulatory workflows;
- compliance reports.

The Compliance Officer should have read access to relevant evidence without automatically receiving unrestricted access to all personal information.

---

# 39. Data Protection / Privacy Officer

Responsibilities:

- privacy governance;
- data requests;
- retention policies;
- access reviews;
- privacy incidents;
- data mapping.

This role should be independent enough to challenge inappropriate data use.

---

# 40. Internal Auditor

The Internal Auditor reviews institutional controls.

Capabilities:

- read-only audit access;
- audit reports;
- control testing;
- activity review.

Auditors should not modify the records they audit.

---

# 41. AI Governance Officer

This role is essential for an AI-native school platform.

Responsibilities:

- approve AI use cases;
- classify AI risk;
- review AI incidents;
- evaluate model behavior;
- maintain AI policies;
- monitor AI usage;
- coordinate AI audits.

The AI Governance Officer should be able to disable risky AI capabilities.

---

# 42. Board / Governance Member

Governance members oversee institutional strategy.

They may receive:

- institutional reports;
- financial summaries;
- strategic metrics;
- compliance reports.

They should not receive individual student information unless specifically authorized and necessary.

---

# 43. Organization Owner

The Organization Owner represents the customer organization.

Responsibilities:

- subscription;
- organization ownership;
- high-level configuration;
- administrator appointment.

This role owns the Bitfi tenant but should still respect system-level privacy and security controls.

---

# 44. Organization Super Administrator

The Super Administrator manages technical school configuration.

Permissions:

- users;
- roles;
- permissions;
- integrations;
- policies;
- school configuration.

Super Admin access must remain auditable.

---

# 45. Bitfi Support Agent

Bitfi support personnel assist customer organizations.

Support access should be:

- temporary;
- approved;
- scoped;
- logged.

Support staff should not casually browse student records.

---

# 46. Bitfi Security Administrator

Responsible for Bitfi security operations.

Responsibilities:

- security monitoring;
- incident response;
- access control;
- threat detection;
- security investigations.

Production access must use strong controls.

---

# 47. Bitfi AI Operations Administrator

Manages AI infrastructure.

Responsibilities:

- model configuration;
- model routing;
- AI service monitoring;
- AI costs;
- evaluation infrastructure;
- model availability.

This role should not automatically access school content.

---

# 48. Bitfi Platform Administrator

Global technical platform role.

Responsibilities:

- infrastructure;
- tenant provisioning;
- platform configuration;
- service health;
- deployment.

Global technical authority must not imply unrestricted access to customer educational content.

---

# 49. Role Relationships

Bitfi.school should model relationships explicitly.

Important relationships include:

```text
Student → enrolled_in → Class

Teacher → teaches → Course

Teacher → assigned_to → Class

Parent → guardian_of → Student

Department Head → manages → Department

Department → contains → Courses

Principal → leads → Campus

Counselor → supports → Student

Advisor → advises → Class

Registrar → manages_records_for → Student

AI Tutor → assists → Student

Teacher Copilot → assists → Teacher
```

Relationships should be stored independently from roles.

---

# 50. Student Relationship Graph

A student may be connected to:

```text
Student
 ├── Guardians
 ├── Teachers
 ├── Advisor
 ├── Counselor
 ├── Classes
 ├── Courses
 ├── Assignments
 ├── Assessments
 ├── Grades
 ├── Attendance
 └── Support Plans
```

The authorization engine should determine which relationship permits access.

---

# 51. Teacher Relationship Graph

```text
Teacher
 ├── Department
 ├── Courses
 ├── Classes
 ├── Students
 ├── Department Head
 ├── Academic Coordinator
 └── Principal
```

A teacher's student visibility comes from actual teaching relationships.

---

# 52. Parent Relationship Graph

```text
Parent
 ├── Student A
 ├── Student B
 └── Student C
```

Each relationship can have different access.

---

# 53. Reporting Hierarchy

Recommended default:

```text
Principal
│
├── Vice Principal
│
├── Academic Director
│    ├── Department Heads
│    │    └── Teachers
│    │         └── Students
│    └── Curriculum Coordinator
│
├── Student Support Lead
│    ├── Counselors
│    └── Inclusion Specialists
│
└── Operations Lead
     ├── Administrator
     ├── Finance
     ├── HR
     ├── Facilities
     ├── Library
     └── Transport
```

This is configurable.

---

# 54. Authority Levels

Bitfi should define authority levels.

## Level 0 — Personal

Own data only.

## Level 1 — Operational

Assigned tasks and records.

## Level 2 — Supervisory

Team/class/department.

## Level 3 — Institutional

School-wide authority.

## Level 4 — Organization

Multi-campus organization.

## Level 5 — Platform

Bitfi infrastructure.

Higher level does not automatically mean unrestricted personal-data access.

---

# 55. Permission Types

Permissions should include:

```text
view
create
edit
delete
publish
approve
reject
assign
grade
export
archive
restore
configure
delegate
audit
```

Example:

```text
Teacher:
view students
create assignments
grade submissions
publish feedback

Principal:
view institutional analytics
approve policies
delegate authority
```

---

# 56. Scope Types

Permissions can be scoped to:

```text
self
student
class
course
department
campus
organization
platform
```

Example:

```text
teacher.grade_submission
scope = assigned_course
```

---

# 57. Approval Relationships

Certain actions should require approval.

Examples:

### Curriculum change

```text
Teacher
 ↓
Department Head
 ↓
Academic Director
```

### Official grade correction

```text
Teacher
 ↓
Department Head
 ↓
Registrar
```

### School-wide policy

```text
Administrator
 ↓
Principal
 ↓
Governance
```

The exact chain should be configurable.

---

# 58. Delegation

Bitfi should support temporary delegation.

Example:

```text
Principal
 ↓
Delegates academic approval
 ↓
Vice Principal
 ↓
Valid until date
```

Delegation fields:

- delegator;
- delegate;
- permission;
- scope;
- start;
- expiration;
- reason;
- audit record.

---

# 59. Emergency Authority

Schools may require emergency access.

Emergency access should use:

- explicit reason;
- limited scope;
- temporary duration;
- strong audit;
- review after use.

Emergency access should not become a permanent backdoor.

---

# 60. Role Conflicts

Users can hold multiple roles.

Example:

```text
Teacher + Department Head
```

The authorization engine should calculate the union of permitted actions but enforce restrictions.

A user should never gain access merely because two roles accidentally combine to create an unsafe permission.

---

# 61. Data Access by Role

Example:

| Data | Student | Teacher | Parent | Principal | Counselor | Finance |
|---|---:|---:|---:|---:|---:|---:|
| Own profile | RW | RW | RW | RW | RW | RW |
| Grades | R | RW | R | R | Limited | - |
| Attendance | R | RW | R | R | Limited | - |
| Assignments | RW | RW | R | R | - | - |
| Finance | - | - | R | R | - | RW |
| Counseling | - | - | Restricted | Restricted | RW | - |
| HR | - | - | - | Limited | - | - |
| Audit | - | Limited | - | R | Limited | Limited |

---

# 62. AI Access by Role

## Student

- AI Tutor
- Study Coach
- approved content generation

## Teacher

- Teacher Copilot
- lesson generation
- assessment assistance
- class analytics

## Department Head

- department analytics
- curriculum intelligence

## Principal

- institutional analytics
- strategic AI reports

## Parent

- child information assistant

## Counselor

- support workflow assistance under strict policy

## AI Governance Officer

- AI monitoring
- evaluation
- policy

---

# 63. AI Authority Model

AI should have its own role classification.

Example:

```text
AI_TUTOR
AI_TEACHER_COPILOT
AI_ADMIN_COPILOT
AI_ANALYTICS_AGENT
AI_CURRICULUM_AGENT
AI_COMMUNICATION_AGENT
```

These are not human administrators.

They are controlled software agents.

---

# 64. AI Cannot Inherit Human Authority

Critical rule:

> AI should never inherit all permissions of the person who invoked it.

Instead:

```text
Teacher
 ↓
Teacher Copilot
 ↓
Allowed tools only
```

The AI receives a restricted tool set.

---

# 65. Teacher AI Tool Example

Teacher Copilot may call:

```text
get_class_progress
get_assignments
get_curriculum
search_resources
generate_lesson
generate_quiz
draft_feedback
```

It should not call:

```text
delete_student
change_final_grade
access_finance
view_confidential_counseling
```

---

# 66. Student AI Tool Example

Student Tutor may call:

```text
get_my_courses
get_my_assignments
get_my_progress
search_approved_resources
generate_practice
create_study_plan
```

It should not call:

```text
get_other_student
get_teacher_private_notes
change_grade
access_staff_data
```

---

# 67. Parent AI Tool Example

Parent Assistant:

```text
get_linked_children
get_published_assignments
get_published_grades
get_attendance
get_school_announcements
```

Restricted:

```text
get_private_teacher_notes
get_counselor_notes
get_other_children
```

---

# 68. Communication Authority

Communication must be role-aware.

Students can communicate with:

- teachers;
- approved staff;
- classmates where enabled.

Parents can communicate with:

- teachers;
- administration;
- approved support staff.

Teachers can communicate with:

- assigned students;
- guardians according to policy;
- colleagues.

The school can configure restrictions.

---

# 69. Discipline Authority

A teacher may:

- document classroom incidents;
- recommend action.

A designated administrator may:

- investigate;
- decide disciplinary action.

The Principal may:

- approve major institutional disciplinary decisions.

AI may summarize evidence but should not independently punish students.

---

# 70. Academic Decision Authority

Recommended:

```text
Teacher
→ instruction + assessment

Department Head
→ moderation + department quality

Academic Director
→ institutional academic standards

Principal
→ final institutional authority
```

---

# 71. Grade Authority

Grade workflow:

```text
Teacher creates grade
       ↓
Teacher submits
       ↓
Optional moderation
       ↓
Authorized approval
       ↓
Registrar locks official record
```

After locking, changes require controlled correction.

---

# 72. Attendance Authority

Teacher:

- records attendance.

Class Advisor:

- reviews patterns.

Administrator:

- manages attendance policy.

Principal:

- reviews institutional trends.

AI:

- identifies unusual patterns.

AI does not automatically punish absence.

---

# 73. Curriculum Authority

```text
Teacher
→ proposes content

Department Head
→ reviews

Curriculum Coordinator
→ aligns

Academic Director
→ approves

Principal
→ institutional adoption where required
```

---

# 74. Student Support Authority

Support workflow:

```text
Teacher observes signal
        ↓
Teacher recommends support
        ↓
Authorized support professional reviews
        ↓
Intervention created
        ↓
Progress monitored
        ↓
Review
```

Sensitive information should remain restricted.

---

# 75. Role Lifecycle

Roles should have states:

```text
Requested
Approved
Active
Suspended
Expired
Revoked
Archived
```

Temporary roles should automatically expire.

---

# 76. Onboarding

When a new teacher joins:

```text
Create user
 ↓
Verify identity
 ↓
Assign organization
 ↓
Assign role
 ↓
Assign department
 ↓
Assign classes
 ↓
Assign permissions
 ↓
Complete training
 ↓
Activate
```

---

# 77. Offboarding

When a teacher leaves:

```text
Disable login
 ↓
Revoke sessions
 ↓
Revoke tokens
 ↓
Reassign classes
 ↓
Transfer content
 ↓
Preserve audit history
 ↓
Archive account
```

Student records should not disappear when a teacher account is removed.

---

# 78. Role Change

Example:

Teacher becomes Department Head.

The system should:

1. retain teacher history;
2. add department-head role;
3. expand scoped permissions;
4. record change;
5. require approval;
6. preserve audit history.

---

# 79. Permission Review

Schools should conduct periodic access reviews.

Example:

```text
Every term:
Review administrators
Review teachers
Review temporary accounts
Review external users
Review sensitive access
```

---

# 80. Access Request Workflow

If a teacher needs access to something outside normal scope:

```text
Request
 ↓
Reason
 ↓
Approver
 ↓
Grant
 ↓
Expiration
 ↓
Audit
```

---

# 81. Role-Based Dashboard

Each role should receive a different dashboard.

## Student

```text
Today
Assignments
Progress
AI Tutor
Schedule
```

## Teacher

```text
Classes
Attendance
Grading
Planning
AI Copilot
```

## Principal

```text
School Health
Academics
Attendance
Staff
Operations
AI Insights
```

## Finance

```text
Invoices
Payments
Balances
Reports
```

---

# 82. Role-Based Navigation

The interface should hide irrelevant functions.

A student should not see:

- HR;
- finance administration;
- audit;
- role management.

A teacher should not see:

- global infrastructure;
- platform billing.

A Finance Officer should not see:

- teacher private notes.

This improves both security and usability.

---

# 83. Role-Based Notifications

Examples:

Student:

> Assignment due tomorrow.

Teacher:

> 12 submissions require grading.

Parent:

> New published feedback is available.

Principal:

> Attendance decreased significantly this week.

AI Governance Officer:

> AI safety evaluation failed for a deployed workflow.

---

# 84. Role-Based Reports

Student:

- progress report.

Parent:

- child summary.

Teacher:

- class performance.

Department Head:

- subject performance.

Principal:

- institutional report.

Finance:

- financial report.

Auditor:

- control/audit report.

---

# 85. Relationship-Based Security

Bitfi should use relationship checks.

Example:

```text
Can Teacher A view Student B?
```

Not:

```text
Is user a teacher?
```

Instead:

```text
Teacher A
   ↓
teaches
   ↓
Course X
   ↓
contains
   ↓
Student B
```

Only then should access be granted.

---

# 86. Multi-Campus Authority

A Principal may have:

```text
Campus A
```

A Regional Director may have:

```text
Campus A
Campus B
Campus C
```

A teacher may have:

```text
Campus A / Grade 9
```

Permissions should respect the scope.

---

# 87. Multi-Organization Authority

Bitfi should support organizations containing schools.

Example:

```text
Education Group
 ├── School A
 ├── School B
 └── School C
```

Group-level administrators can receive consolidated analytics without automatically seeing all personal records.

---

# 88. Audit Model

Every sensitive action should record:

```text
actor
role
target
action
timestamp
scope
reason
result
IP/device metadata where appropriate
```

AI actions additionally record:

```text
agent
model
tools_used
data_sources
policy_version
approval
```

---

# 89. Role Security Rules

Critical rules:

1. No shared administrator accounts.
2. MFA for privileged roles.
3. Temporary roles expire.
4. Sensitive access is audited.
5. AI permissions are separate.
6. Deleted users lose active access immediately.
7. Historical records remain auditable.
8. Permissions are reviewed periodically.
9. Emergency access requires a reason.
10. High-impact decisions require authorized humans.

---

# 90. Example Full School Workflow

## Student lifecycle

```text
Application
 ↓
Admissions
 ↓
Enrollment
 ↓
Guardian linking
 ↓
Class assignment
 ↓
Teacher assignment
 ↓
Learning
 ↓
Assessment
 ↓
Support
 ↓
Progression
 ↓
Graduation / Completion
 ↓
Alumni
```

Each stage has different responsible roles.

---

# 91. Example Academic Workflow

```text
Curriculum Coordinator
        ↓
Curriculum approved
        ↓
Department Head
        ↓
Teacher
        ↓
Lesson
        ↓
Assignment
        ↓
Student
        ↓
Submission
        ↓
Teacher
        ↓
Grade
        ↓
Analytics
        ↓
Academic Leadership
```

---

# 92. Example Parent Workflow

```text
Parent
 ↓
Select child
 ↓
View weekly overview
 ↓
See assignments
 ↓
Review published feedback
 ↓
Message teacher
 ↓
Receive response
```

---

# 93. Example AI Workflow

```text
Teacher asks AI
 ↓
Authorization check
 ↓
Purpose check
 ↓
Data scope check
 ↓
Retrieve curriculum
 ↓
Retrieve class data
 ↓
Model generation
 ↓
Safety validation
 ↓
Teacher review
 ↓
Publish
```

---

# 94. Role and AI Interaction Matrix

| Role | AI Tutor | Teacher Copilot | Analytics | Content Generation | Admin AI |
|---|---:|---:|---:|---:|---:|
| Student | Yes | No | Own | Limited | No |
| Parent | Limited | No | Child | No | No |
| Teacher | Yes | Yes | Class | Yes | Limited |
| Department Head | Yes | Yes | Department | Yes | Yes |
| Principal | No | No | School | Limited | Yes |
| Counselor | Limited | Limited | Support | Limited | Limited |
| Admin | No | Limited | School | Limited | Yes |
| AI Governance | No | No | AI | No | Yes |

---

# 95. Role and Data Classification Matrix

| Role | Public | Internal | Confidential | Restricted |
|---|---:|---:|---:|---:|
| Student | R | R | Own | No |
| Parent | R | Child | Child | Limited |
| Teacher | R | Assigned | Assigned | Limited |
| Department Head | R | Department | Department | Limited |
| Principal | R | School | School | Controlled |
| Counselor | R | Support | Support | Yes |
| Finance | R | Finance | Finance | Controlled |
| Auditor | R | Audit | Approved | Approved |
| AI Governance | R | AI | Approved | Governance only |

---

# 96. Small School Simplification

A small school does not need 40 employees.

Bitfi should support role bundling.

Example:

```text
Principal
= Principal + Academic Director + Administrator
```

Another:

```text
Teacher
= Teacher + Class Advisor
```

Another:

```text
Administrator
= Admin + Admissions + Registrar
```

The underlying permissions remain separate even when roles are bundled.

---

# 97. Large School Model

Large organizations should keep functions separate.

Example:

```text
Principal
├── Academic Director
│   ├── Curriculum Coordinator
│   ├── Department Heads
│   └── Examination Officer
│
├── Student Services
│   ├── Counselors
│   ├── Inclusion Specialists
│   └── Safeguarding Officer
│
└── Operations
    ├── Administrator
    ├── Finance
    ├── HR
    ├── IT
    ├── Library
    └── Transport
```

---

# 98. Recommended Default Role Set for MVP

Do not build all 40 roles into the first release UI.

MVP should begin with:

1. Student
2. Parent/Guardian
3. Teacher
4. Class Advisor
5. Department Head
6. Principal
7. School Administrator
8. Finance Officer
9. Counselor
10. IT Administrator
11. Organization Owner
12. Super Administrator

Advanced roles can be activated later.

---

# 99. Recommended Database Role Model

Example entities:

```text
users
roles
permissions
user_roles
role_permissions
organizations
campuses
departments
classes
courses
enrollments
guardianships
staff_assignments
delegations
approval_workflows
access_requests
audit_logs
```

Relationships:

```text
user_roles
user_id
role_id
scope_type
scope_id
starts_at
expires_at
status
```

This is much more flexible than:

```text
users.role = "teacher"
```

---

# 100. Recommended Permission Naming

Use predictable names.

```text
student.view
student.edit
student.enroll

course.view
course.create
course.edit
course.publish

assignment.create
assignment.grade
assignment.publish

attendance.view
attendance.record
attendance.correct

grade.view
grade.enter
grade.approve
grade.lock
grade.correct

ai.tutor.use
ai.teacher_copilot.use
ai.admin_copilot.use
ai.governance.manage

audit.view
roles.manage
permissions.manage
```

---

# 101. Authority Boundary Rules

The following should be treated as high-impact:

- final grades;
- student exclusion;
- major discipline;
- safeguarding decisions;
- sensitive health records;
- access to restricted counseling records;
- institutional policy;
- user privilege escalation;
- large data exports.

These actions should have additional controls.

---

# 102. AI + Human Approval Pattern

For sensitive operations:

```text
AI recommendation
       ↓
Human review
       ↓
Human approval
       ↓
Action
       ↓
Audit
```

For low-risk assistance:

```text
AI draft
       ↓
User uses/edit
```

For high-risk actions:

```text
AI recommendation
       ↓
Required specialist review
       ↓
Authorized decision maker
       ↓
Audit
```

---

# 103. Responsibility Matrix

Use RACI-style concepts.

**R = Responsible**

**A = Accountable**

**C = Consulted**

**I = Informed**

Example:

| Activity | Teacher | Dept Head | Academic Director | Principal |
|---|---|---|---|---|
| Lesson | R | C | I | I |
| Department curriculum | C | R | A | I |
| School curriculum | C | C | R | A |
| Final policy | I | C | R | A |
| Student support | R | C | C | A |

---

# 104. Teacher-to-Student Relationship

The teacher should access students only through legitimate educational relationships.

Relationships can arise from:

- course enrollment;
- class assignment;
- temporary substitute assignment;
- approved support assignment.

When the relationship ends, access should change automatically.

---

# 105. Parent-to-Student Relationship

Parent access depends on an approved guardianship relationship.

If a relationship changes, access should change.

The platform should not assume:

> Same surname = parent.

Relationships must be explicit.

---

# 106. Principal-to-School Relationship

The Principal has institutional authority over an assigned campus or school.

The principal should have broad operational visibility but still operate under privacy and governance rules.

---

# 107. Counselor-to-Student Relationship

Counselor access must be assignment-based or policy-based.

It should not mean:

> counselor = access to every student record.

---

# 108. Administrator-to-Data Relationship

Administrators manage systems.

They do not automatically have unrestricted educational authority.

This distinction is essential.

Technical administration and educational authority are separate.

---

# 109. AI-to-Data Relationship

AI should only receive the minimum context required.

Example:

A tutor does not need the student's complete school record to explain algebra.

A teacher lesson generator may need:

- curriculum;
- class progress;
- approved resources.

It does not need:

- finance;
- health;
- unrelated disciplinary records.

---

# 110. Access Expiration

Roles can have expiration.

Examples:

- substitute teacher;
- temporary counselor;
- visiting examiner;
- external auditor;
- support agent.

Automatic expiration is a security requirement.

---

# 111. External Users

External users may include:

- examiners;
- consultants;
- trainers;
- contractors;
- auditors.

External accounts should have:

- explicit scope;
- expiration;
- MFA;
- limited data;
- audit logs.

---

# 112. Service Accounts

Machine identities should be separated from human identities.

Examples:

```text
notification-service
analytics-service
ai-service
backup-service
integration-google
```

Service accounts should use:

- short-lived credentials;
- scoped permissions;
- secret management;
- audit logs.

---

# 113. API Roles

API clients should have scopes.

Example:

```text
students:read
courses:read
assignments:write
analytics:read
```

Never issue an API key with unrestricted administrative permissions by default.

---

# 114. Role Security Monitoring

Monitor:

- privilege escalation;
- unusual data exports;
- unusual login patterns;
- access to restricted records;
- repeated denied requests;
- emergency access;
- role changes.

Security systems should create alerts without automatically accusing a user of wrongdoing.

---

# 115. Role-Based AI Safety

Student AI:

- strongest content guardrails.

Teacher AI:

- educational productivity.

Admin AI:

- operational analytics.

Counselor AI:

- restricted support workflow.

AI Governance:

- model oversight.

Different roles require different AI policies.

---

# 116. Role-Based UI Personalization

Bitfi should not merely hide menus.

It should personalize workflows.

Student:

> “Continue learning.”

Teacher:

> “Your next class starts in 25 minutes.”

Principal:

> “Three institutional indicators require review.”

Finance Officer:

> “17 invoices require attention.”

---

# 117. Role-Based Homepages

Each role receives a different home dashboard.

The system should permit configurable widgets.

Example:

```text
Dashboard
├── Required actions
├── Important alerts
├── Recent activity
├── Upcoming deadlines
├── AI assistant
└── Analytics
```

---

# 118. Role Search

Administrators should be able to search:

```text
Who can approve grades?
Who can access counseling records?
Who can export student data?
Who can create courses?
Who can use AI analytics?
```

The system should answer with the effective permission configuration.

---

# 119. Effective Permissions

Bitfi should calculate:

```text
Direct role permissions
+
Scoped role permissions
+
Delegated permissions
-
Explicit restrictions
=
Effective permissions
```

This should be visible to administrators.

---

# 120. Permission Simulation

Super administrators should have a safe permission simulator:

> “What can Teacher A access?”

The simulator should show:

```text
Allowed
Denied
Conditional
Requires approval
```

This is extremely useful for debugging.

---

# 121. Role Templates

Bitfi should provide templates:

### Standard Teacher

Teaching + grading + attendance.

### Senior Teacher

Teacher + mentoring.

### Department Head

Teacher + department management.

### Principal

Institutional management.

### School Admin

Administration + configuration.

### Parent

Child access.

### Student

Personal learning.

---

# 122. Custom Roles

Organizations should be able to create custom roles.

Example:

> Robotics Lab Coordinator

Permissions:

- view robotics students;
- manage lab resources;
- create activities;
- manage lab schedule.

Custom roles must not bypass global restrictions.

---

# 123. Role Approval

Sensitive roles may require approval.

Example:

```text
Request Department Head
 ↓
Principal approval
 ↓
Role activated
```

---

# 124. Role Audit

Every role event should be recorded:

```text
created
assigned
modified
delegated
suspended
expired
revoked
```

---

# 125. Role Deactivation

When a role is removed:

- revoke permissions;
- terminate active sessions if necessary;
- revoke tokens;
- remove dashboard access;
- preserve historical records.

---

# 126. Role Relationship with Academic Year

Teacher assignments often change each academic year.

Therefore:

```text
Teacher
 → teaches
 → Course
 → Academic Year
```

The system should not carry old teaching access indefinitely.

---

# 127. Role Relationship with Class

Students belong to classes during defined periods.

Example:

```text
Student A
Class 9B
Academic Year 2026/27
```

When the year changes:

```text
9B → 10B
```

Old records remain historical.

---

# 128. Role Relationship with Course

A teacher may teach:

```text
Mathematics 9A
Mathematics 9B
```

but not:

```text
Mathematics 12A
```

unless assigned.

---

# 129. Role Relationship with Department

A teacher can belong to:

- Mathematics Department

and teach:

- Algebra;
- Geometry.

Department authority may grant additional access.

---

# 130. Role Relationship with Campus

A teacher assigned to Campus A should not automatically access Campus B.

Regional administrators may have multi-campus scope.

---

# 131. Role Relationship with Organization

Organizations can contain multiple campuses.

Organization administrators have organization-level scope.

Campus administrators have campus-level scope.

---

# 132. Role Hierarchy Is Not Enough

Important:

A hierarchy alone cannot solve authorization.

For example:

```text
Principal > Teacher
```

does not mean the Principal should automatically see every private counseling note.

Authority and data sensitivity must be modeled separately.

---

# 133. Sensitive Data Roles

Sensitive data should include:

- health;
- counseling;
- safeguarding;
- identity documents;
- financial information;
- security records.

Access should require legitimate purpose.

---

# 134. AI Governance Relationship

The AI Governance Officer should work with:

- Principal;
- Data Protection Officer;
- IT Security;
- Academic Director;
- teachers;
- Bitfi AI operations.

The purpose is to ensure AI is useful without becoming uncontrolled.

---

# 135. Recommended Governance Committee

Bitfi can provide an institutional AI committee template:

```text
Principal
Academic Director
Teacher Representative
Data Protection Officer
IT/Security
AI Governance Officer
Student/Parent representative where appropriate
```

---

# 136. Role Documentation in Product

Every role should have a human-readable page.

Example:

```text
Teacher

Purpose:
Deliver instruction.

Can:
✓ Create lessons
✓ Grade assignments
✓ Record attendance

Cannot:
✕ Change institutional policy
✕ Access finance
✕ Access private counseling notes

Reports to:
Department Head / Academic Leadership

AI:
Teacher Copilot
```

---

# 137. Role Onboarding

When assigning a role, Bitfi should show:

- responsibilities;
- permissions;
- restrictions;
- training requirements;
- AI capabilities;
- sensitive-data obligations.

The user should acknowledge required policies.

---

# 138. Role Training

Some roles require mandatory training.

Examples:

- administrators;
- safeguarding officers;
- AI governance officers;
- finance;
- privacy;
- security.

The platform can track training completion.

---

# 139. Role Certification

Optional certification status:

```text
Not Required
Required
In Progress
Completed
Expired
```

A role may be restricted until required training is completed.

---

# 140. Role Health Dashboard

Administrators should see:

- active roles;
- expired roles;
- excessive privileges;
- temporary access;
- unreviewed permissions;
- high-risk roles.

---

# 141. Excess Privilege Detection

Bitfi can flag:

> “This user has Finance + Teacher + IT Administrator permissions.”

The system should request review.

AI may assist in detecting unusual combinations but should not automatically revoke critical access.

---

# 142. Separation of Duties

Examples:

### Finance

Invoice creation ≠ payment approval.

### Grades

Grade entry ≠ official lock where policy requires separation.

### Security

Incident investigation ≠ final disciplinary decision.

### AI

Model deployment ≠ AI governance approval for high-risk use.

---

# 143. Role Escalation

A user should be able to request escalation.

Example:

```text
Teacher
 ↓
Requests student-support access
 ↓
Counselor approves
 ↓
Temporary access
 ↓
Expires
```

---

# 144. Role Downgrade

When responsibilities decrease:

```text
Department Head
 ↓
Teacher
```

Department permissions should be removed while teacher permissions remain.

---

# 145. Role Transfer

When a staff member moves campuses:

```text
Campus A Teacher
 ↓
Transfer
 ↓
Campus B Teacher
```

Old access is removed.

New access is created.

---

# 146. Role-Based Reports to Users

Bitfi should explain access transparently.

Example:

> You can view this student's grades because you are assigned as the teacher for Mathematics 9B.

This builds trust.

---

# 147. Denied Access Experience

Instead of:

> Access denied.

Use:

> You do not currently have permission to view this record. Access is restricted to authorized student-support personnel.

Optionally:

> Request access.

---

# 148. Role Request Workflow

```text
User requests role
 ↓
Reason
 ↓
Approver
 ↓
Policy check
 ↓
Role activated
 ↓
Audit
```

---

# 149. Role-Based Data Export

Exports should require appropriate permission.

A teacher may export:

- their class gradebook.

A principal may export:

- approved school reports.

A student may export:

- their own academic information.

Large exports should be logged.

---

# 150. Role-Based Deletion

Deletion should be restricted.

Official academic records may require archival rather than deletion.

Sensitive data retention must follow institutional and applicable legal requirements.

---

# 151. Role-Based AI Export

AI-generated reports containing student information should inherit the underlying data sensitivity.

Example:

A private class analysis remains confidential even if generated by AI.

---

# 152. Parent Access and Student Age

Parent access may need to change according to:

- age;
- institutional policy;
- guardianship;
- applicable law;
- student status.

The platform should support configurable rules rather than assuming one universal policy.

---

# 153. Student Privacy

As students become older, institutions may need more granular privacy controls.

Bitfi should therefore avoid hardcoding one universal parent-access model.

---

# 154. Role-Based Notification Privacy

Notifications should avoid exposing sensitive information on lock screens.

Instead of:

> “Counselor report about John is ready.”

Use:

> “You have a new private school notification.”

---

# 155. Role-Based Search Privacy

Search results must be filtered by authorization.

A user should not discover a record simply because its title contains a searched word.

---

# 156. Role-Based AI Retrieval

RAG must enforce permissions before retrieval.

Incorrect:

```text
Search all documents
 ↓
Filter after AI generation
```

Preferred:

```text
Check permission
 ↓
Search authorized corpus
 ↓
Retrieve
 ↓
Generate
```

---

# 157. Role-Based AI Memory

AI memory must also respect role and scope.

A student tutor should not retain another student's information.

A teacher assistant should not retain confidential information outside its permitted context.

---

# 158. Role-Based AI Conversation

Each AI session should have:

```text
user
role
organization
scope
purpose
policy
retention
```

---

# 159. Role-Based AI Logging

AI logs should capture enough information for safety and debugging without unnecessarily storing sensitive content.

---

# 160. Role-Based AI Escalation

When the AI cannot safely answer:

```text
AI
 ↓
Explain limitation
 ↓
Recommend authorized human
 ↓
Provide appropriate route
```

Example:

> “I cannot access confidential counseling information. Please contact the authorized student-support office.”

---

# 161. Recommended Default Authority Model

Bitfi should ship with:

```text
Student
Parent
Teacher
Class Advisor
Department Head
Academic Director
Principal
Administrator
Counselor
Finance Officer
IT Administrator
Super Administrator
```

Then allow organizations to activate additional roles.

---

# 162. Complete Role Relationship Map

```text
                         GOVERNANCE
                             │
                         PRINCIPAL
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ACADEMIC LEADERSHIP   STUDENT SUPPORT     OPERATIONS
          │                  │                  │
   Academic Director      Counselor          Administrator
          │                  │                  ├── Finance
    Department Head        Safeguarding        ├── HR
          │                Inclusion           ├── IT
       Teacher                                  ├── Library
          │                                     ├── Transport
       Student                                  └── Facilities
          │
       Parent
```

This should be implemented as a relationship graph rather than a rigid organizational chart.

---

# 163. Final Role Philosophy

Bitfi.school should answer three questions for every user:

### Who are you?

Identity and role.

### What are you responsible for?

Responsibilities and scope.

### What are you authorized to do?

Permissions and authority.

A fourth question is required for AI:

### What may the AI do on your behalf?

This must always be narrower than unrestricted user authority for sensitive actions.

---

# 164. Final Recommended Role List

The complete Bitfi.school role catalog should include:

1. Student
2. Student Representative
3. Peer Tutor
4. Parent
5. Guardian
6. Authorized Family Contact
7. Teacher
8. Teaching Assistant
9. Substitute Teacher
10. Class Advisor
11. Mentor Teacher
12. Department Head
13. Curriculum Coordinator
14. Academic Coordinator
15. Examination Officer
16. Academic Director
17. Vice Principal
18. Principal
19. Counselor
20. Inclusion Specialist
21. Safeguarding Officer
22. Health Officer
23. School Administrator
24. Admissions Officer
25. Registrar
26. Finance Officer
27. HR Officer
28. Librarian
29. IT Administrator
30. Facilities Manager
31. Transport Manager
32. Events Coordinator
33. Compliance Officer
34. Privacy Officer
35. Internal Auditor
36. AI Governance Officer
37. Board/Governance Member
38. Organization Owner
39. Organization Super Administrator
40. Bitfi Support Agent
41. Bitfi Security Administrator
42. Bitfi AI Operations Administrator
43. Bitfi Platform Administrator

---

# 165. Final Authority Principles

Bitfi.school should implement these permanent rules:

1. **Student data belongs to the educational relationship, not to a generic administrator.**
2. **Teachers control instructional workflows within their assignments.**
3. **Academic leadership controls institutional academic standards.**
4. **Principals control institutional operations within governance rules.**
5. **Parents receive authorized child information, not unrestricted school information.**
6. **Counselors and safeguarding personnel receive specialized restricted access.**
7. **Finance, HR, health and security data are separated.**
8. **Technical administrators are not automatically educational decision makers.**
9. **AI does not inherit unrestricted human permissions.**
10. **High-impact educational decisions remain under authorized human control.**
11. **Temporary access must expire.**
12. **Delegated authority must be explicit and auditable.**
13. **Every sensitive action must be logged.**
14. **Permissions should be relationship-based and scope-aware.**
15. **Role combinations must be tested for privilege conflicts.**
16. **Organizations can customize roles without bypassing platform safety controls.**
17. **AI access must be purpose-specific.**
18. **Restricted information must remain restricted during AI retrieval and generation.**
19. **Official records require stronger controls than drafts.**
20. **The platform should make authority understandable to users.**

---

# 166. Final Bitfi.school Role Model

The complete concept can be summarized as:

```text
IDENTITY
   ↓
ROLE
   ↓
RELATIONSHIP
   ↓
SCOPE
   ↓
PERMISSION
   ↓
AUTHORITY
   ↓
APPROVAL
   ↓
ACTION
   ↓
AUDIT
```

For AI:

```text
USER
 ↓
ROLE
 ↓
PURPOSE
 ↓
AUTHORIZED CONTEXT
 ↓
AI AGENT
 ↓
ALLOWED TOOLS
 ↓
POLICY CHECK
 ↓
AI RESPONSE
 ↓
HUMAN REVIEW WHEN REQUIRED
 ↓
ACTION
 ↓
AUDIT
```

This model gives Bitfi.school a foundation that can scale from a small academy with five staff members to a multi-campus education organization with thousands of users.

---

# 167. Closing Definition

**Bitfi.school should not treat roles as labels.**

A role is a controlled relationship between a person, an institution, a responsibility, a scope of work and a set of authorized actions.

The platform should therefore be designed around:

> **People + Relationships + Responsibilities + Authority + Data + AI + Governance.**

That becomes the foundation of a secure and scalable Bitfi.school operating system.

**Bitfi.school**

> **One school platform. Every role connected. Every responsibility defined. Every authority controlled. Every important action accountable.**

