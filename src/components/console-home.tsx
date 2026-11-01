import Link from 'next/link';
import ConsoleShell from './console-shell';
import { canAccess, consoleConfigs, type ConsoleRole } from '../lib/console-config';

const icons = [
  <svg key="1" aria-hidden="true" className="h-20 w-20 text-[#2e9fff]" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 64 64"><path strokeLinecap="round" strokeLinejoin="round" d="M18 20h20a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H28l-8 7V26a6 6 0 0 1 6-6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m26 30 4 4 8-8" /></svg>,
  <svg key="2" aria-hidden="true" className="h-20 w-20 text-[#2e9fff]" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 64 64"><path strokeLinecap="round" strokeLinejoin="round" d="M14 42c4-10 10-16 18-18" /><circle cx="40" cy="22" r="3.5" /><circle cx="28" cy="34" r="3.5" /><circle cx="46" cy="36" r="3.5" /><path strokeLinecap="round" d="M16 46h32" /></svg>,
  <svg key="3" aria-hidden="true" className="h-20 w-20 text-[#2e9fff]" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 64 64"><rect x="14" y="16" width="36" height="32" rx="4" /><path strokeLinecap="round" d="M22 26h20M22 34h14M22 42h10" /></svg>,
  <svg key="4" aria-hidden="true" className="h-20 w-20 text-[#2e9fff]" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 64 64"><path strokeLinecap="round" strokeLinejoin="round" d="M12 44 24 30l10 8 18-22" /><circle cx="24" cy="30" r="2.5" fill="currentColor" stroke="none" /><circle cx="34" cy="38" r="2.5" fill="currentColor" stroke="none" /><circle cx="52" cy="16" r="2.5" fill="currentColor" stroke="none" /></svg>,
];

export default function ConsoleHome({ role }: { role: ConsoleRole }) {
  const config = consoleConfigs[role];
  const cards = config.homeCards.filter(card => canAccess(role, card.permission));

  return (
    <ConsoleShell
      role={role}
      greeting={`Hey ${config.greetingName}, check out what's been happening across your ${config.campusCount} ${config.campusLabel.toLowerCase()}. Select a workspace below.`}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {cards.map((card, index) => (
          <article key={card.href} className="flex min-h-[280px] flex-col rounded-md border border-[#e1e5eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex flex-1 flex-col items-center justify-center px-6 pt-10 text-center">
              {icons[index % icons.length]}
              <h2 className="mt-5 text-lg font-semibold text-[#2f3338]">{card.title}</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[#6b7380]">{card.description}</p>
            </div>
            <div className="border-t border-[#eef1f4] p-4">
              <Link href={card.href} className="flex h-11 items-center justify-center rounded border border-[#2e9fff]/45 text-[15px] font-medium text-[#2e9fff] transition hover:bg-[#f3f9ff]">
                {card.action}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </ConsoleShell>
  );
}
