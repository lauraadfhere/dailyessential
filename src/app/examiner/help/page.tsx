import Link from 'next/link';
import ConsoleShell from '../../../components/console-shell';

export default function ExaminerHelpPage() {
  return (
    <ConsoleShell role="examiner">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2e9fff]">Examiner 101</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#2f3338]">Help for examiners</h1>
        <p className="mt-3 text-sm leading-7 text-[#6b7380]">Same Disqus-style console as admin and teachers — with grading, results and quality authorizations only.</p>
        <div className="mt-8 space-y-3">
          {[
            ['Grade pending papers', '/examiner/grading'],
            ['Verify results', '/examiner/results'],
            ['Quality control', '/examiner/quality'],
          ].map(([title, href]) => (
            <Link key={href} href={href} className="block rounded border border-[#e1e5eb] bg-white p-5 hover:border-[#2e9fff]/50">
              <h2 className="font-semibold text-[#2f3338]">{title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
