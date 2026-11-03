import { NextRequest, NextResponse } from 'next/server';
import { isResponse, requireRole } from '../../../../lib/authz';
import { fetchCourses, fetchEvaluations, fetchNews, fetchSubscriptions, fetchTickets } from '../../../../lib/platform-data';
import { isParseConfigured, parseServerRequest } from '../../../../lib/parse-server';

/** Count rows in a Parse class without downloading them. Returns null when the class is unreachable. */
async function countOf(className: string, where: Record<string, unknown> = {}) {
  try {
    const data = await parseServerRequest<{ count?: number }>(
      `classes/${className}?limit=0&count=1&where=${encodeURIComponent(JSON.stringify(where))}`,
    );
    return typeof data.count === 'number' ? data.count : null;
  } catch {
    return null;
  }
}

let cached: { at: number; body: unknown } | null = null;
const TTL_MS = 15_000;

/** Administrator dashboard data. All queries run in parallel; statistics use server-side counts. */
export async function GET(request: NextRequest) {
  const session = await requireRole(request, ['admin']);
  if (isResponse(session)) return session;

  const fresh = request.nextUrl.searchParams.get('fresh') === '1';
  if (!fresh && cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json(cached.body, { headers: { 'Cache-Control': 'private, max-age=10', 'X-Cache': 'HIT' } });
  }

  try {
    const configured = isParseConfigured();
    const [courses, evaluations, news, subscriptions, tickets, students, pendingEvals, activeSubs, openTickets, publishedNews] = await Promise.all([
      fetchCourses(100),
      fetchEvaluations({ demo: false }),
      fetchNews({ demo: false }),
      fetchSubscriptions({ demo: false }),
      fetchTickets(100),
      configured ? countOf('StudentProfile') : Promise.resolve(null),
      configured ? countOf('EvaluationRequest', { status: 'pending' }) : Promise.resolve(null),
      configured ? countOf('LessonSubscription', { status: 'active' }) : Promise.resolve(null),
      configured ? countOf('SupportTicket', { status: { $in: ['open', 'in-progress'] } }) : Promise.resolve(null),
      configured ? countOf('NewsUpdate', { status: 'published' }) : Promise.resolve(null),
    ]);

    const body = {
      source: configured ? 'parse' : 'unconfigured',
      generatedAt: new Date().toISOString(),
      stats: {
        students: students ?? 0,
        courses: courses.length,
        evaluationsPending: pendingEvals ?? evaluations.filter(item => item.status === 'pending').length,
        newsPublished: publishedNews ?? news.filter(item => item.status === 'published').length,
        subscriptionsActive: activeSubs ?? subscriptions.filter(item => item.status === 'active').length,
        ticketsOpen: openTickets ?? tickets.filter(item => item.status === 'open' || item.status === 'in-progress').length,
      },
      evaluations,
      news,
      subscriptions,
      tickets,
      courses,
    };
    cached = { at: Date.now(), body };
    return NextResponse.json(body, { headers: { 'Cache-Control': 'private, max-age=10', 'X-Cache': 'MISS' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Overview failed' }, { status: 500 });
  }
}
