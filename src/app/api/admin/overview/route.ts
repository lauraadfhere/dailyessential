import { NextResponse } from 'next/server';
import { fetchCourses, fetchEvaluations, fetchNews, fetchSubscriptions, fetchTickets } from '../../../../lib/platform-data';
import { isParseConfigured, parseQuery } from '../../../../lib/parse-server';

export async function GET() {
  try {
    const [courses, evaluations, news, subscriptions, tickets, students] = await Promise.all([
      fetchCourses(100),
      fetchEvaluations(),
      fetchNews(),
      fetchSubscriptions(),
      fetchTickets(100),
      isParseConfigured()
        ? parseQuery<{ objectId: string }>('StudentProfile', { limit: 0, count: 1 }).catch(() => ({ results: [] as { objectId: string }[], count: 0 }))
        : Promise.resolve({ results: [] as { objectId: string }[], count: 0 }),
    ]);

    const studentCount = typeof (students as { count?: number }).count === 'number'
      ? (students as { count: number }).count
      : (students.results?.length || 0);

    return NextResponse.json({
      source: isParseConfigured() ? 'parse' : 'demo',
      stats: {
        students: studentCount,
        courses: courses.length,
        evaluationsPending: evaluations.filter(item => item.status === 'pending').length,
        newsPublished: news.filter(item => item.status === 'published').length,
        subscriptionsActive: subscriptions.filter(item => item.status === 'active').length,
        ticketsOpen: tickets.filter(item => item.status === 'open' || item.status === 'in-progress').length,
      },
      evaluations,
      news,
      subscriptions,
      tickets,
      courses,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Overview failed' }, { status: 500 });
  }
}
