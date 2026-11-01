import { NextRequest, NextResponse } from 'next/server';
import { fetchCourses } from '../../../lib/platform-data';
import { isParseConfigured } from '../../../lib/parse-server';

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || 50), 100);
    const courses = await fetchCourses(limit);
    return NextResponse.json({
      count: courses.length,
      courses,
      source: isParseConfigured() && courses.length ? 'parse' : 'empty',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load courses', courses: [] },
      { status: 500 },
    );
  }
}
