import { notFound, redirect } from 'next/navigation';
import { roleBySlug } from '../../../lib/school-model';
export default async function RoleWorkspace({ params }: { params: Promise<{ role: string }> }) { const { role } = await params; if (!roleBySlug(role)) notFound(); redirect(`/workspace/${role}/overview`); }
