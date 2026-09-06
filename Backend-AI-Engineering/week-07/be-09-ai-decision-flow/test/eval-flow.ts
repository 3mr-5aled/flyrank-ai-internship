import { WORKFLOW_PRESETS } from '../src/lib/templates';
import { executeWorkflowCore } from '../src/lib/workflow-engine';

async function runEvaluations() {
  console.log('====================================================');
  console.log('  AI DECISION FLOW (BE-09) EVALUATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  // Test 1: Customer Support - Billing & Refund Path
  {
    total++;
    const preset = WORKFLOW_PRESETS.find((p) => p.id === 'customer-support-triage')!;
    const input = 'I was charged twice $49 on invoice #1042. Please refund my payment immediately.';
    console.log(`[TEST 1] Customer Support Triage -> Billing & Refund`);
    console.log(`Input: "${input}"`);

    const result = await executeWorkflowCore({
      nodes: preset.nodes,
      edges: preset.edges,
      inputText: input,
    });

    console.log(`Result Path:`, result.path);
    console.log(
      `Decisions:`,
      result.steps
        .filter((s) => s.decision)
        .map((s) => `${s.nodeLabel}: ${s.decision} (${s.reason})`)
    );
    console.log(`Final Action:`, result.finalAction);

    const isBillingYes = result.steps.some(
      (s) => s.nodeId === 'decision-1' && s.decision === 'YES'
    );
    const isRefundYes = result.steps.some(
      (s) => s.nodeId === 'decision-2' && s.decision === 'YES'
    );
    const isCorrectAction = result.finalAction?.includes('Refund');

    if (isBillingYes && isRefundYes && isCorrectAction) {
      console.log('✅ TEST 1 PASSED: Correctly branched to Auto-Refund approval.\n');
      passed++;
    } else {
      console.error('❌ TEST 1 FAILED\n');
    }
  }

  // Test 2: Customer Support - Technical Bug Path
  {
    total++;
    const preset = WORKFLOW_PRESETS.find((p) => p.id === 'customer-support-triage')!;
    const input = 'Our production database crashed with a 500 internal server error and stack trace.';
    console.log(`[TEST 2] Customer Support Triage -> Technical Bug Escalation`);
    console.log(`Input: "${input}"`);

    const result = await executeWorkflowCore({
      nodes: preset.nodes,
      edges: preset.edges,
      inputText: input,
    });

    console.log(`Result Path:`, result.path);
    console.log(
      `Decisions:`,
      result.steps
        .filter((s) => s.decision)
        .map((s) => `${s.nodeLabel}: ${s.decision} (${s.reason})`)
    );
    console.log(`Final Action:`, result.finalAction);

    const isBillingNo = result.steps.some(
      (s) => s.nodeId === 'decision-1' && s.decision === 'NO'
    );
    const isBugYes = result.steps.some(
      (s) => s.nodeId === 'decision-3' && s.decision === 'YES'
    );
    const isEngineeringAlert = result.finalAction?.includes('Jira Bug');

    if (isBillingNo && isBugYes && isEngineeringAlert) {
      console.log('✅ TEST 2 PASSED: Correctly branched to Engineering Jira Bug alert.\n');
      passed++;
    } else {
      console.error('❌ TEST 2 FAILED\n');
    }
  }

  // Test 3: Content Moderation - Toxic Content Ban
  {
    total++;
    const preset = WORKFLOW_PRESETS.find((p) => p.id === 'content-moderation-gate')!;
    const input = 'You stupid idiot, I will find you and attack you right now!';
    console.log(`[TEST 3] Content Moderation Gate -> Toxic Language Ban`);
    console.log(`Input: "${input}"`);

    const result = await executeWorkflowCore({
      nodes: preset.nodes,
      edges: preset.edges,
      inputText: input,
    });

    console.log(`Result Path:`, result.path);
    console.log(
      `Decisions:`,
      result.steps.filter((s) => s.decision).map((s) => `${s.nodeLabel}: ${s.decision}`)
    );
    console.log(`Final Action:`, result.finalAction);

    const isToxicYes = result.steps.some(
      (s) => s.nodeId === 'decision-mod-1' && s.decision === 'YES'
    );
    const isBanAction = result.finalAction?.includes('Post Removal & Suspend');

    if (isToxicYes && isBanAction) {
      console.log('✅ TEST 3 PASSED: Correctly flagged toxic language and banned account.\n');
      passed++;
    } else {
      console.error('❌ TEST 3 FAILED\n');
    }
  }

  // Test 4: Sales Lead - Enterprise High Touch
  {
    total++;
    const preset = WORKFLOW_PRESETS.find((p) => p.id === 'sales-lead-qualification')!;
    const input =
      'We are an enterprise organization with 500 developers needing custom SSO, SOC2 compliance, and immediate procurement.';
    console.log(`[TEST 4] Sales Lead Qualification -> VIP Executive Routing`);
    console.log(`Input: "${input}"`);

    const result = await executeWorkflowCore({
      nodes: preset.nodes,
      edges: preset.edges,
      inputText: input,
    });

    console.log(`Result Path:`, result.path);
    console.log(
      `Decisions:`,
      result.steps.filter((s) => s.decision).map((s) => `${s.nodeLabel}: ${s.decision}`)
    );
    console.log(`Final Action:`, result.finalAction);

    const isEnterpriseYes = result.steps.some(
      (s) => s.nodeId === 'decision-sales-1' && s.decision === 'YES'
    );
    const isVipAction = result.finalAction?.includes('VP of Sales');

    if (isEnterpriseYes && isVipAction) {
      console.log('✅ TEST 4 PASSED: Correctly qualified enterprise lead for executive call.\n');
      passed++;
    } else {
      console.error('❌ TEST 4 FAILED\n');
    }
  }

  console.log('====================================================');
  console.log(
    `SUMMARY: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`
  );
  console.log('====================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runEvaluations().catch((err) => {
  console.error('Evaluation run error:', err);
  process.exit(1);
});
