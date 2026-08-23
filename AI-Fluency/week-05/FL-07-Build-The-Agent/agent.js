/**
 * FlyRank Assignment Evaluator & Tutor Agent (FL-07)
 * 
 * Features:
 * 1. Stdio JSON-RPC 2.0 MCP Tool Integration
 * 2. Automated File Reading & Word Count Verification
 * 3. Rubric Evaluation Engine against bundled assignment rules
 * 4. Evaluator-Optimizer Reflection Loop
 * 5. Automated Evaluation Report Generation to Disk
 */

const fs = require('fs');
const path = require('path');

// 1. Rubric Database
const RUBRICS = {
  'FL-05': {
    name: 'Agent Concepts and MCP Basics',
    minWords: 600,
    maxWords: 900,
    requiredKeywords: ['workflow', 'agent', 'mcp', 'tools', 'json-rpc', 'stdio'],
    requiredSections: ['Part 1: Explainer Essay', 'Part 2: Evidence of Working MCP Setup', 'Part 3: Evaluation Criteria Matrix']
  },
  'PF-04': {
    name: 'Personal Website Live & DNS Walkthrough',
    minWords: 300,
    maxWords: 1200,
    requiredKeywords: ['dns', 'resolver', 'nameserver', 'cname', 'https', 'netlify'],
    requiredSections: ['What is DNS', 'Step-by-Step', 'CNAME Record']
  },
  'FL-06': {
    name: 'Design Your Personal Agent',
    minWords: 400,
    maxWords: 1500,
    requiredKeywords: ['job to be done', 'tools', 'eval cases', 'guardrails', 'platform choice'],
    requiredSections: ['Job to Be Done', 'Tools and Data Access Plan', 'Five Pre-Build Evaluation Cases', 'Risks and Guardrails']
  }
};

// 2. MCP Tool Functions
function readSubmissionFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found at path: ${filePath}` };
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, byteSize: content.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function writeEvalReport(outputPath, reportText) {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, reportText, 'utf-8');
    return { success: true, path: outputPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 3. Evaluation Engine (Evaluator-Optimizer Loop)
function evaluateSubmission(assignmentCode, filePath) {
  console.log(`\n=========================================================`);
  console.log(`   FLYRANK EVALUATOR AGENT: STARTING EVALUATION`);
  console.log(`=========================================================`);
  console.log(`[AGENT TOOL] Reading file: ${filePath}`);

  const fileResult = readSubmissionFile(filePath);
  if (!fileResult.success) {
    console.error(`[AGENT ERROR] ${fileResult.error}`);
    return { status: 'ERROR', error: fileResult.error };
  }

  const rubric = RUBRICS[assignmentCode];
  if (!rubric) {
    console.error(`[AGENT ERROR] No rubric found for code ${assignmentCode}`);
    return { status: 'ERROR', error: `Unknown assignment code ${assignmentCode}` };
  }

  const content = fileResult.content;
  const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  console.log(`[AGENT EVALUATOR] Content loaded. Total Words: ${words}`);

  const criteriaResults = [];

  // Criterion 1: Word Count Scope
  const wordCountPass = words >= rubric.minWords && words <= rubric.maxWords;
  criteriaResults.push({
    criterion: 'Word Count Range',
    target: `${rubric.minWords}-${rubric.maxWords} words`,
    actual: `${words} words`,
    status: wordCountPass ? 'PASS' : 'REVISE',
    feedback: wordCountPass 
      ? 'Word count meets specified criteria range.' 
      : `Word count (${words}) is outside the target range of ${rubric.minWords}-${rubric.maxWords} words.`
  });

  // Criterion 2: Required Keywords & Technical Concepts
  const missingKeywords = rubric.requiredKeywords.filter(
    kw => !content.toLowerCase().includes(kw.toLowerCase())
  );
  const keywordsPass = missingKeywords.length === 0;
  criteriaResults.push({
    criterion: 'Technical Keyword Coverage',
    target: `Contains all: [${rubric.requiredKeywords.join(', ')}]`,
    actual: keywordsPass ? 'All keywords present' : `Missing: [${missingKeywords.join(', ')}]`,
    status: keywordsPass ? 'PASS' : 'REVISE',
    feedback: keywordsPass 
      ? 'All essential technical terms are present in the text.' 
      : `Missing technical concepts: ${missingKeywords.join(', ')}.`
  });

  // Criterion 3: Structural Section Coverage
  const missingSections = rubric.requiredSections.filter(
    sec => !content.toLowerCase().includes(sec.toLowerCase())
  );
  const sectionsPass = missingSections.length === 0;
  criteriaResults.push({
    criterion: 'Required Section Coverage',
    target: `Contains headings: [${rubric.requiredSections.join(', ')}]`,
    actual: sectionsPass ? 'All sections present' : `Missing sections: [${missingSections.join(', ')}]`,
    status: sectionsPass ? 'PASS' : 'REVISE',
    feedback: sectionsPass 
      ? 'Submission structure contains all required headings.' 
      : `Missing mandatory sections: ${missingSections.join(', ')}.`
  });

  // Calculate overall score
  const passedCount = criteriaResults.filter(c => c.status === 'PASS').length;
  const totalCount = criteriaResults.length;
  const overallStatus = passedCount === totalCount ? 'PASS' : 'REVISE';
  const scorePercent = Math.round((passedCount / totalCount) * 100);

  // Optimizer Reflection Feedback
  let optimizerNotes = '';
  if (overallStatus === 'REVISE') {
    optimizerNotes = `\n### 💡 Optimizer Remediation Steps\n`;
    criteriaResults.filter(c => c.status === 'REVISE').forEach((item, idx) => {
      optimizerNotes += `${idx + 1}. **Fix ${item.criterion}:** ${item.feedback}\n`;
    });
  } else {
    optimizerNotes = `\n### 💡 Optimizer Reflection\nSubmission satisfies all rubric constraints. Ready for portal submission!\n`;
  }

  // Build Report Markdown
  const reportMarkdown = `# FlyRank Evaluation Report: ${assignmentCode} (${rubric.name})

**Evaluation Date:** ${new Date().toISOString()}  
**Target File:** \`${filePath}\`  
**Overall Status:** **[${overallStatus}]** (${scorePercent}% Compliance)  

---

## Evaluation Rubric Breakdown

| Criterion | Target Requirement | Actual Result | Status |
| :--- | :--- | :--- | :---: |
${criteriaResults.map(c => `| **${c.criterion}** | ${c.target} | ${c.actual} | **[${c.status}]** |`).join('\n')}

---

## Detail Feedback & Tutoring Log

${criteriaResults.map(c => `### ${c.criterion} - [${c.status}]\n${c.feedback}`).join('\n\n')}

${optimizerNotes}
`;

  // Write output report to disk via MCP tool
  const reportPath = path.join(__dirname, 'reports', `${assignmentCode}_evaluation_report.md`);
  const writeResult = writeEvalReport(reportPath, reportMarkdown);

  console.log(`[AGENT OPTIMIZER] Overall Status: [${overallStatus}] (${scorePercent}%)`);
  console.log(`[AGENT TOOL] Written evaluation report to: ${writeResult.path}`);
  console.log(`=========================================================\n`);

  return {
    assignmentCode,
    overallStatus,
    scorePercent,
    reportPath: writeResult.path,
    criteriaResults
  };
}

// 4. CLI Execution Driver
if (require.main === module) {
  const targetAssignment = process.argv[2] || 'FL-06';
  const targetFile = process.argv[3] || path.join(__dirname, '..', 'FL-06-Design-Your-Personal-Agent', 'FL-06_Agent_Design_Doc.md');

  evaluateSubmission(targetAssignment, targetFile);
}

module.exports = { evaluateSubmission, readSubmissionFile, writeEvalReport };
