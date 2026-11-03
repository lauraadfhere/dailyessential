import { fetchStudentByIdOrEmail } from './platform-data';
import { isParseConfigured } from './parse-server';

export type PortalProfile = {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  backupSerial: string;
  barcodeValue: string;
  classGroup: string;
  gradeLevel: string;
  programme: string;
  campus: string;
  status: string;
  deliveryMode: string;
  guardian: string;
  guardianEmail: string;
  attendance: string;
  avatarUrl: string;
  phone: string;
  country: string;
  address: string;
};

function avatarFor(_name: string) {
  return '/brand/icon-512.png';
}

export const staffProfiles: Record<string, PortalProfile> = {
  'teacher@bifti.school': {
    id: 'staff-teacher',
    fullName: 'Mrs. Adebayo',
    email: 'teacher@bifti.school',
    studentId: 'STF-T-1001',
    backupSerial: 'BFT-STF-1001',
    barcodeValue: 'BFTSTF1001',
    classGroup: 'Teaching staff',
    gradeLevel: 'Staff',
    programme: 'Digital Literacy',
    campus: 'Main Campus',
    status: 'active',
    deliveryMode: 'In person',
    guardian: '',
    guardianEmail: '',
    attendance: '—',
    avatarUrl: avatarFor('Mrs Adebayo'),
    phone: '+234 8011001001',
    country: 'Nigeria',
    address: 'Main Campus, Daily Essential School',
  },
  'examiner@bifti.school': {
    id: 'staff-examiner',
    fullName: 'Mr. Okafor',
    email: 'examiner@bifti.school',
    studentId: 'STF-E-2001',
    backupSerial: 'BFT-STF-2001',
    barcodeValue: 'BFTSTF2001',
    classGroup: 'Examinations',
    gradeLevel: 'Staff',
    programme: 'Assessment Office',
    campus: 'Main Campus',
    status: 'active',
    deliveryMode: 'Hybrid',
    guardian: '',
    guardianEmail: '',
    attendance: '—',
    avatarUrl: avatarFor('Mr Okafor'),
    phone: '+234 8011002001',
    country: 'Nigeria',
    address: 'Examination Office, Daily Essential School',
  },
  'admin@bifti.school': {
    id: 'staff-admin',
    fullName: 'Daily Essential Admin',
    email: 'admin@bifti.school',
    studentId: 'STF-A-3001',
    backupSerial: 'BFT-STF-3001',
    barcodeValue: 'BFTSTF3001',
    classGroup: 'Administration',
    gradeLevel: 'Staff',
    programme: 'School Operations',
    campus: 'Main Campus',
    status: 'active',
    deliveryMode: 'Hybrid',
    guardian: '',
    guardianEmail: '',
    attendance: '—',
    avatarUrl: avatarFor('Daily Essential Admin'),
    phone: '+234 8011003001',
    country: 'Nigeria',
    address: 'Admin Office, Daily Essential School',
  },
};

export const demoProfile: PortalProfile = {
  id: 'demo',
  fullName: 'Amina Ahmed',
  email: 'student@bifti.school',
  studentId: 'BF-2026-1000',
  backupSerial: 'BFT-SR-50000',
  barcodeValue: 'BFT2026000',
  classGroup: 'JSS 2 Blue',
  gradeLevel: 'JSS 2',
  programme: 'UI / UX Design',
  campus: 'Main Campus',
  status: 'active',
  deliveryMode: 'Hybrid',
  guardian: 'Ahmed Guardian',
  guardianEmail: 'guardian001@family.bifti.school',
  attendance: '92%',
  avatarUrl: avatarFor('Amina Ahmed'),
  phone: '+234 8010000001',
  country: 'Nigeria',
  address: 'Main Campus, Daily Essential School',
};

function defaultKeyForRole(role: string) {
  if (role === 'teacher') return 'teacher@bifti.school';
  if (role === 'examiner') return 'examiner@bifti.school';
  if (role === 'admin') return 'admin@bifti.school';
  return 'student@bifti.school';
}

export type ResolvedProfile = { profile: PortalProfile; source: 'staff' | 'parse' | 'demo' };

/** Resolve a portal profile from a staff email, a Parse learner row or the demo learner. */
export async function resolveProfile(key: string, role = ''): Promise<ResolvedProfile> {
  const lookup = key || defaultKeyForRole(role.toLowerCase());

  if (staffProfiles[lookup]) {
    return { profile: staffProfiles[lookup], source: 'staff' };
  }

  const profile = await fetchStudentByIdOrEmail(lookup);
  if (profile) {
    return {
      profile: { ...profile, avatarUrl: profile.avatarUrl || avatarFor(profile.fullName || lookup) },
      source: 'parse',
    };
  }

  // A named account with no StudentProfile row gets an empty profile of its own. It must never
  // inherit another learner's record (the old fallback exposed, and let PATCH edit, someone else's data).
  if (key && lookup !== demoProfile.email && lookup !== demoProfile.studentId) {
    const email = lookup.includes('@') ? lookup : '';
    return {
      profile: {
        ...demoProfile,
        id: 'none',
        fullName: email ? email.split('@')[0] : 'Learner',
        email,
        studentId: '',
        backupSerial: '',
        barcodeValue: '',
        classGroup: '',
        gradeLevel: '',
        programme: '',
        guardian: '',
        guardianEmail: '',
        attendance: '—',
        phone: '',
        address: '',
      },
      source: 'demo',
    };
  }

  if (isParseConfigured()) {
    const first = await fetchStudentByIdOrEmail(demoProfile.studentId);
    if (first) {
      return {
        profile: { ...first, avatarUrl: first.avatarUrl || avatarFor(first.fullName || 'Student') },
        source: 'parse',
      };
    }
  }

  return { profile: demoProfile, source: 'demo' };
}
