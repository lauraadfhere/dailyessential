import type { NextRequest } from 'next/server';
import { searchPlatform } from '../../../lib/search-index';

export const dynamic = 'force-dynamic';

/**
 * Site-wide search used by the header search field and the /search page.
 * Static index, so results are instant and never depend on the database.
 */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') || '').slice(0, 120);
  const requested = Number(request.nextUrl.searchParams.get('limit'));
  const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 50) : 24;

  // Keywords stay server-side; suggestions only need the destination details.
  const results = searchPlatform(query, limit).map(({ keywords, ...entry }) => entry);
  const counts = results.reduce<Record<string, number>>((totals, entry) => {
    totals[entry.kind] = (totals[entry.kind] || 0) + 1;
    return totals;
  }, {});

  return Response.json(
    { query: query.trim(), results, counts, total: results.length },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } },
  );
}
