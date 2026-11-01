import ConsoleShell from '../../../components/console-shell';
import { consoleConfigs } from '../../../lib/console-config';

export default function ExaminerSettingsPage() {
  const perms = consoleConfigs.examiner.permissions;
  return (
    <ConsoleShell role="examiner" showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h1 className="text-lg font-semibold text-[#2f3338]">Examiner settings</h1>
        <p className="mt-1 text-sm text-[#6b7380]">Authorizations granted to the examiner portal role.</p>
      </div>
      <div className="flex flex-wrap gap-2 px-5 py-6">
        {perms.map(code => (
          <span key={code} className="rounded-full bg-[#e8f5ff] px-3 py-1 text-xs font-semibold text-[#2e9fff]">{code}</span>
        ))}
      </div>
    </ConsoleShell>
  );
}
