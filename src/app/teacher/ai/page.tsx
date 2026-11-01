import ConsoleShell from '../../../components/console-shell';
import MarkingPanel from '../../../components/ai/marking-panel';
import TestBuilder from '../../../components/ai/test-builder';
import { Callout, PageFrame, Panel, StatGrid } from '../../../components/platform/kit';

export default function TeacherAiPage() {
  return (
    <ConsoleShell role="teacher" showSidebar>
      <PageFrame
        eyebrow="AI teaching tools"
        title="AI assistant"
        description="Draft assessments and rubric marking with the school AI engine. Every draft is a proposal — you review, edit and publish."
      >
        <StatGrid
          items={[
            { label: 'Provider', value: 'NVIDIA NIM', detail: 'Premium reasoning model', tone: 'info' },
            { label: 'Draft tests', value: 'Review first', detail: 'Nothing reaches students automatically' },
            { label: 'Marking', value: 'Rubric-based', detail: 'Low-confidence answers are flagged' },
            { label: 'Audit', value: 'Logged', detail: 'Every AI call is recorded' },
          ]}
        />

        <TestBuilder />

        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <MarkingPanel />
          <Panel title="How the school AI works" description="Human in the loop, always.">
            <ul className="space-y-3 text-[13px] leading-6 text-[#4a515a]">
              <li><strong className="text-[#2f3338]">Draft, never final.</strong> Generated questions and marks are proposals until a teacher approves them.</li>
              <li><strong className="text-[#2f3338]">Objective marking stays code.</strong> MCQs and true/false are scored exactly; AI handles long answers only.</li>
              <li><strong className="text-[#2f3338]">Confidence flag.</strong> Anything under 70% confidence lands in your review queue instead of being published.</li>
              <li><strong className="text-[#2f3338]">Private student text.</strong> Answers are sent as delimited data, never as instructions to the model.</li>
              <li><strong className="text-[#2f3338]">Every call logged.</strong> Feature, model, latency and outcome go to the AILog class.</li>
            </ul>
          </Panel>
        </div>

        <Callout tone="info" title="AI cannot award a final grade.">
          Use AI marks as a first pass. Confirm or override every score in the gradebook — overrides are recorded and improve future prompts.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
