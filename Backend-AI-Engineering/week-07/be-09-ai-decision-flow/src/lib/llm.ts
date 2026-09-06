import OpenAI from 'openai';

export interface DecisionLLMResult {
  decision: 'YES' | 'NO';
  reason: string;
  raw: string;
  model: string;
  source: 'openai' | 'mock-simulation';
}

// Initialize OpenAI client if API key is provided
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_or_openrouter_api_key_here') {
    return null;
  }

  const baseURL = process.env.OPENAI_BASE_URL || process.env.LLM_BASE_URL || 'https://api.openai.com/v1';

  return new OpenAI({
    apiKey,
    baseURL,
  });
}

/**
 * Intelligent deterministic fallback evaluation when no LLM API key is present
 * or when the user wants offline simulation.
 */
function evaluateSimulatedDecision(prompt: string, inputText: string): { decision: 'YES' | 'NO'; reason: string } {
  const normalizedPrompt = prompt.toLowerCase();
  const normalizedInput = inputText.toLowerCase();

  // Keyword-based semantic matching heuristics for realistic workflow execution
  // 1. Billing / Refund / Charge / Pricing
  if (normalizedPrompt.includes('billing') || normalizedPrompt.includes('invoice') || normalizedPrompt.includes('charge') || normalizedPrompt.includes('pay')) {
    const isBilling = /bill|charge|invoice|fee|price|refund|subscription|charged|credit card|dollar|\$/i.test(normalizedInput);
    return {
      decision: isBilling ? 'YES' : 'NO',
      reason: isBilling
        ? 'Input mentions payment, charge, invoice, or billing terms.'
        : 'No billing or payment references detected in input message.'
    };
  }

  // 2. Refund requested
  if (normalizedPrompt.includes('refund') || normalizedPrompt.includes('money back')) {
    const isRefund = /refund|money back|reimburse|cancel charge|return money/i.test(normalizedInput);
    return {
      decision: isRefund ? 'YES' : 'NO',
      reason: isRefund
        ? 'Customer explicitly requested a refund or reimbursement.'
        : 'Customer did not request a monetary refund.'
    };
  }

  // 3. Technical bug / error / crash / outage
  if (normalizedPrompt.includes('bug') || normalizedPrompt.includes('crash') || normalizedPrompt.includes('error') || normalizedPrompt.includes('broken') || normalizedPrompt.includes('technical')) {
    const isBug = /bug|error|crash|broken|fail|exception|glitch|down|outage|stack trace|not working|500/i.test(normalizedInput);
    return {
      decision: isBug ? 'YES' : 'NO',
      reason: isBug
        ? 'Input describes an error, crash, malfunction, or software defect.'
        : 'No technical failure or bug indicators found.'
    };
  }

  // 4. Sales / enterprise / quote / purchase / seats
  if (normalizedPrompt.includes('sales') || normalizedPrompt.includes('enterprise') || normalizedPrompt.includes('quote') || normalizedPrompt.includes('pricing tier') || normalizedPrompt.includes('lead')) {
    const isSales = /sales|enterprise|quote|demo|purchase|buy|seats|contract|plan|upgrade|proposal/i.test(normalizedInput);
    return {
      decision: isSales ? 'YES' : 'NO',
      reason: isSales
        ? 'Prospect asks about pricing, enterprise tier, sales demo, or license expansion.'
        : 'Inquiry is not a commercial or enterprise sales lead.'
    };
  }

  // 5. Urgent / high priority / emergency / security
  if (normalizedPrompt.includes('urgent') || normalizedPrompt.includes('emergency') || normalizedPrompt.includes('security') || normalizedPrompt.includes('breach') || normalizedPrompt.includes('compromise')) {
    const isUrgent = /urgent|asap|critical|emergency|hack|breach|security|compromised|exploit|leaked|ddos/i.test(normalizedInput);
    return {
      decision: isUrgent ? 'YES' : 'NO',
      reason: isUrgent
        ? 'High urgency or security threat patterns identified.'
        : 'Standard priority without urgent escalation triggers.'
    };
  }

  // 6. Toxic / abusive / offensive / content moderation
  if (normalizedPrompt.includes('toxic') || normalizedPrompt.includes('abuse') || normalizedPrompt.includes('hate') || normalizedPrompt.includes('inappropriate') || normalizedPrompt.includes('harass')) {
    const isToxic = /threat|kill|idiot|stupid|swear|curse|scam|fraud|illegal|hate/i.test(normalizedInput);
    return {
      decision: isToxic ? 'YES' : 'NO',
      reason: isToxic
        ? 'Content moderation flag: aggressive or prohibited wording identified.'
        : 'Text passed safety check; no hostile language detected.'
    };
  }

  // 7. General fallback: look for words from prompt in input
  const promptKeywords = normalizedPrompt
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'does', 'what', 'node'].includes(w));

  const matched = promptKeywords.some(kw => normalizedInput.includes(kw));
  return {
    decision: matched ? 'YES' : 'NO',
    reason: matched
      ? `Input aligns with prompt query regarding "${promptKeywords.find(kw => normalizedInput.includes(kw))}".`
      : 'Input does not satisfy the condition outlined in the node prompt.'
  };
}

/**
 * Executes an AI decision for a given node prompt and input context.
 * Strictly guarantees a YES or NO response.
 */
export async function evaluateNodeDecision(params: {
  prompt: string;
  nodeLabel?: string;
  inputText: string;
}): Promise<DecisionLLMResult> {
  const { prompt, nodeLabel, inputText } = params;
  const client = getOpenAIClient();
  const defaultModel = process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!client) {
    // Deterministic smart mock fallback
    const simulated = evaluateSimulatedDecision(prompt, inputText);
    return {
      decision: simulated.decision,
      reason: simulated.reason,
      raw: `[SIMULATED] Decision: ${simulated.decision}. Rationale: ${simulated.reason}`,
      model: `${defaultModel} (simulated-evaluator)`,
      source: 'mock-simulation',
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: defaultModel,
      temperature: 0.1,
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `You are an AI decision engine in an automated workflow.
Evaluate the given Decision Question against the provided Input Context.
You MUST answer with EXACTLY ONE binary decision: YES or NO.

Format your output strictly as:
DECISION: [YES or NO]
REASON: [One clear sentence explaining why]

Rules:
- DECISION must only be YES or NO.
- Do not add conversational fluff or other greetings.`
        },
        {
          role: 'user',
          content: `Node Label: ${nodeLabel || 'Decision Step'}
Decision Question: ${prompt}

Input Context:
"""
${inputText}
"""`
        }
      ]
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    
    // Parse DECISION: YES/NO and REASON
    let decision: 'YES' | 'NO' = 'NO';
    let reason = 'Evaluation completed.';

    const decisionMatch = content.match(/DECISION:\s*(YES|NO)/i);
    if (decisionMatch) {
      decision = decisionMatch[1].toUpperCase() as 'YES' | 'NO';
    } else if (content.toUpperCase().startsWith('YES')) {
      decision = 'YES';
    } else if (content.toUpperCase().startsWith('NO')) {
      decision = 'NO';
    } else if (/\bYES\b/i.test(content) && !/\bNO\b/i.test(content)) {
      decision = 'YES';
    } else {
      decision = 'NO';
    }

    const reasonMatch = content.match(/REASON:\s*(.+)/i);
    if (reasonMatch) {
      reason = reasonMatch[1].trim();
    } else {
      reason = content.replace(/DECISION:\s*(YES|NO)/i, '').trim() || 'AI binary classification complete.';
    }

    return {
      decision,
      reason,
      raw: content,
      model: defaultModel,
      source: 'openai',
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`[evaluateNodeDecision] LLM request failed (${errorMessage}), falling back to intelligent simulation.`);
    
    const fallback = evaluateSimulatedDecision(prompt, inputText);
    return {
      decision: fallback.decision,
      reason: `${fallback.reason} (Fallback invoked: ${errorMessage})`,
      raw: `[FALLBACK] ${fallback.decision} - ${errorMessage}`,
      model: `${defaultModel} (fallback)`,
      source: 'mock-simulation',
    };
  }
}
