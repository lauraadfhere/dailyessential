import { NextRequest, NextResponse } from 'next/server';
import { escapeRegex, isResponse, requireRole } from '../../../lib/authz';
import { isParseConfigured, parseQuery } from '../../../lib/parse-server';

export type StudentProfileRow = {
  objectId: string;
  fullName: string;
  email: string;
  studentId: string;
  backupSerial: string;
  barcodeValue: string;
  classGroup?: string;
  gradeLevel?: string;
  programme?: string;
  campus?: string;
  status: string;
  deliveryMode?: string;
  guardian?: string;
  guardianEmail?: string;
  attendance?: string;
  avatarUrl?: string;
  phone?: string;
  country?: string;
  address?: string;
};

/** Student directory: staff only (it contains guardian and contact details). */
export async function GET(request: NextRequest) {
  const session = await requireRole(request, ['teacher', 'examiner', 'admin'], { students: [] });
  if (isResponse(session)) return session;
  try {
    if (!isParseConfigured()) {
      return NextResponse.json({ error: 'Parse is not configured', students: [] }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const q = escapeRegex((searchParams.get('q') || '').trim().slice(0, 80));
    const programme = searchParams.get('programme') || '';
    const gradeLevel = searchParams.get('gradeLevel') || '';
    const campus = searchParams.get('campus') || '';
    const status = searchParams.get('status') || '';
    const deliveryMode = searchParams.get('deliveryMode') || '';
    const classGroup = searchParams.get('classGroup') || searchParams.get('className') || '';
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 100) || 100, 1), 200);

    const where: Record<string, unknown> = {};
    if (programme) where.programme = programme;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (campus) where.campus = campus;
    if (status) where.status = status;
    if (deliveryMode) where.deliveryMode = deliveryMode;
    if (classGroup) where.classGroup = classGroup;

    if (q) {
      where.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { studentId: { $regex: q, $options: 'i' } },
        { classGroup: { $regex: q, $options: 'i' } },
        { programme: { $regex: q, $options: 'i' } },
        { barcodeValue: { $regex: q, $options: 'i' } },
      ];
    }

    const data = await parseQuery<StudentProfileRow>('StudentProfile', {
      where: JSON.stringify(where),
      limit,
      order: 'fullName',
      keys: 'fullName,email,studentId,backupSerial,barcodeValue,classGroup,gradeLevel,programme,campus,status,deliveryMode,guardian,guardianEmail,attendance,avatarUrl,phone,country,address',
    });

    const students = (data.results || []).map(row => ({
      id: row.objectId,
      name: row.fullName,
      email: row.email,
      studentId: row.studentId,
      backupSerial: row.backupSerial,
      barcodeValue: row.barcodeValue,
      className: row.classGroup || '',
      gradeLevel: row.gradeLevel || '',
      programme: row.programme || '',
      campus: row.campus || '',
      status: row.status as 'active' | 'pending' | 'inactive',
      deliveryMode: (row.deliveryMode || 'Hybrid') as 'In person' | 'Online' | 'Hybrid',
      guardian: row.guardian || '',
      guardianEmail: row.guardianEmail || '',
      attendance: row.attendance || '',
      avatarUrl: row.avatarUrl || '',
      phone: row.phone || '',
      country: row.country || '',
      address: row.address || '',
      lastEvaluation: '—',
      enrolledAt: '',
    }));

    return NextResponse.json({ count: students.length, students });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load students', students: [] }, { status: 500 });
  }
}
