import { NextRequest, NextResponse } from 'next/server';
import { fetchDocuments } from '../../../lib/platform-data';
import { isResponse, requireRole, requireUser } from '../../../lib/authz';
import { getOrganizationPointer, isParseConfigured, parseCreate, parseGet } from '../../../lib/parse-server';

export async function GET(request: NextRequest) {
  const session = await requireUser(request, { documents: [] });
  if (isResponse(session)) return session;
  try {
    const { searchParams } = request.nextUrl;
    const documents = await fetchDocuments({
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      programme: searchParams.get('programme') || undefined,
      limit: Math.min(Number(searchParams.get('limit') || 40), 100),
    });

    const id = searchParams.get('id');
    if (id) {
      if (!isParseConfigured()) return NextResponse.json({ error: 'Parse not configured' }, { status: 503 });
      const row = await parseGet<Record<string, unknown>>('LearningDocument', id);
      if (row.status !== 'published' && !['teacher', 'examiner', 'admin'].includes(session.portalRole || '')) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json({
        document: {
          id: row.objectId,
          title: row.title,
          summary: row.summary || '',
          category: row.category || 'General',
          programme: row.programme || '',
          fileUrl: row.fileUrl,
          mimeType: row.mimeType || 'application/pdf',
          pages: row.pages || 0,
          status: row.status,
          uploadedByName: row.uploadedByName || 'Daily Essential Library',
        },
      });
    }

    return NextResponse.json({ count: documents.length, documents, source: documents.length ? 'parse' : 'empty' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load documents', documents: [] },
      { status: 500 },
    );
  }
}

/** Publishing library documents is a staff action. */
export async function POST(request: NextRequest) {
  const session = await requireRole(request, ['teacher', 'examiner', 'admin']);
  if (isResponse(session)) return session;
  try {
    if (!isParseConfigured()) return NextResponse.json({ error: 'Parse not configured' }, { status: 503 });
    const body = await request.json();
    if (!body.title || !body.fileUrl) {
      return NextResponse.json({ error: 'title and fileUrl are required' }, { status: 400 });
    }
    const organization = await getOrganizationPointer();
    const created = await parseCreate('LearningDocument', {
      organization,
      title: String(body.title),
      summary: String(body.summary || ''),
      category: String(body.category || 'General'),
      programme: String(body.programme || ''),
      fileUrl: String(body.fileUrl),
      filePublicId: body.filePublicId ? String(body.filePublicId) : undefined,
      resourceType: String(body.resourceType || 'raw'),
      mimeType: String(body.mimeType || 'application/pdf'),
      pages: Number(body.pages || 0),
      status: ['published', 'draft'].includes(String(body.status)) ? String(body.status) : 'published',
      visibility: String(body.visibility || 'students'),
      uploadedByName: session.displayName || session.email || 'Daily Essential Staff',
    });
    return NextResponse.json({ ok: true, id: created.objectId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Create failed' }, { status: 500 });
  }
}
