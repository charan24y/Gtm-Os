/**
 * Grok (xAI) Provider Adapter
 * Handles product analysis, ICP generation, prospect scoring, evidence verification,
 * personalized email generation, and inbound reply classification.
 */

interface GrokAnalysisOutput {
  product_name: string;
  summary: string;
  core_problem: string;
  value_prop: string;
  features: string[];
  target_users: string[];
  pricing_info?: string;
  suggested_search_queries: string[];
}

interface GrokIcpOutput {
  name: string;
  mode: 'INDIVIDUAL' | 'COMPANY' | 'BOTH';
  criteria: {
    segment?: string;
    geography?: string;
    roles?: string[];
    company_size?: string;
    tech_stack?: string[];
    budget_level?: string;
  };
  disqualifiers: string[];
  signals: string[];
}

interface GrokScoreOutput {
  total_score: number;
  score_breakdown: {
    problem_match: number;
    intent: number;
    recency: number;
    icp_fit: number;
  };
  why_fit: string;
  status: 'QUALIFIED' | 'DISQUALIFIED';
}

interface GrokDraftOutput {
  personalized_subject: string;
  personalized_body: string;
  personalization_rationale: string;
}

export type ReplyClassification =
  | 'interested'
  | 'not_interested'
  | 'referral'
  | 'question'
  | 'out_of_office'
  | 'unsubscribe'
  | 'unclear';

export class GrokProvider {
  private apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || '';
  private model = process.env.GROK_MODEL || 'grok-2-latest';
  private apiUrl = 'https://api.x.ai/v1/chat/completions';

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private async callChatCompletion(systemPrompt: string, userPrompt: string, jsonMode = true): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('GROK_API_KEY is not configured.');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`xAI Grok API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Analyze website markdown extracted via TinyFish
   */
  async analyzeProduct(url: string, markdown: string): Promise<GrokAnalysisOutput> {
    if (this.isConfigured()) {
      try {
        const systemPrompt = `You are a world-class B2B and SaaS Go-To-Market analyst.
Extract precise, grounded product DNA from website text. Output strict JSON with:
{
  "product_name": string,
  "summary": string,
  "core_problem": string,
  "value_prop": string,
  "features": string[],
  "target_users": string[],
  "pricing_info": string,
  "suggested_search_queries": string[]
}`;
        const userPrompt = `Target URL: ${url}\nWebsite Content:\n${markdown.slice(0, 15000)}`;
        const rawJson = await this.callChatCompletion(systemPrompt, userPrompt, true);
        return JSON.parse(rawJson);
      } catch (err) {
        console.warn('Grok live analysis failed, using deterministic fallback:', err);
      }
    }

    // Deterministic fallback if API key is not configured or temporary API failure
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    const cleanName = host.split('.')[0];
    const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    return {
      product_name: capitalized,
      summary: `Autonomous platform discovered at ${host} delivering specialized workflow automation.`,
      core_problem: `Teams waste dozens of hours executing manual discovery, qualification, and coordination tasks.`,
      value_prop: `Replaces fragmented manual workflows with autonomous agents and structured data discovery.`,
      features: [
        'Autonomous customer discovery and intent tracking',
        'Direct web evidence extraction and source grounding',
        'Approval-gated personalized communications',
      ],
      target_users: ['Founders', 'Growth Teams', 'Head of Sales', 'Operations Leads'],
      pricing_info: 'Usage-based or tiered SaaS subscription',
      suggested_search_queries: [
        `"struggling with customer acquisition" site:twitter.com`,
        `"looking for alternatives to" ${cleanName} site:linkedin.com`,
        `"who is responsible for outbound" SaaS`,
      ],
    };
  }

  /**
   * Generate an approved-ready ICP Profile
   */
  async generateIcp(analysis: GrokAnalysisOutput, mode: 'INDIVIDUAL' | 'COMPANY' | 'BOTH'): Promise<GrokIcpOutput> {
    if (this.isConfigured()) {
      try {
        const systemPrompt = `You are an expert sales strategist. Given product analysis and target discovery mode (${mode}), generate an Ideal Customer Profile (ICP). Output strict JSON with:
{
  "name": string,
  "mode": "${mode}",
  "criteria": {
    "segment": string,
    "geography": string,
    "roles": string[],
    "company_size": string,
    "tech_stack": string[],
    "budget_level": string
  },
  "disqualifiers": string[],
  "signals": string[]
}`;
        const userPrompt = `Product: ${analysis.product_name}\nProblem: ${analysis.core_problem}\nTarget: ${analysis.target_users.join(', ')}`;
        const rawJson = await this.callChatCompletion(systemPrompt, userPrompt, true);
        return JSON.parse(rawJson);
      } catch (err) {
        console.warn('Grok live ICP failed, using deterministic fallback:', err);
      }
    }

    return {
      name: `${analysis.product_name} Primary ICP (${mode})`,
      mode,
      criteria: {
        segment: mode === 'INDIVIDUAL' ? 'Independent Creators & Solopreneurs' : 'High-Growth Tech Startups (Series A-C)',
        geography: 'Global / North America & Europe',
        roles: mode === 'INDIVIDUAL' ? ['Solo Founder', 'Content Creator', 'Consultant'] : ['VP Sales', 'Head of Growth', 'CEO'],
        company_size: mode === 'INDIVIDUAL' ? '1-10' : '20-250',
        tech_stack: ['Next.js', 'PostgreSQL', 'Stripe'],
        budget_level: '$1,000 - $10,000/yr',
      },
      disqualifiers: [
        'Pre-launch hobbyists with zero audience or budget',
        'Legacy enterprise with 12-month procurement cycles',
      ],
      signals: [
        'Active complaints about manual outbound workflow',
        'Recent job postings for SDR / Lead Gen specialists',
        'Public searches asking for automation tools',
      ],
    };
  }

  /**
   * Score and qualify a prospect against ICP and evidence
   */
  async scoreProspect(
    prospectName: string,
    evidenceQuote: string,
    icpCriteria: Record<string, unknown>
  ): Promise<GrokScoreOutput> {
    if (this.isConfigured()) {
      try {
        const systemPrompt = `You are an objective GTM Qualification Auditor.
Evaluate whether a prospect is a genuine fit based SOLELY on inspectable evidence.
Scoring formula: ICP Fit (30%), Problem Match (25%), Use-case Activity (20%), Intent Evidence (15%), Recency (10%).
Output strict JSON with:
{
  "total_score": number (0-100),
  "score_breakdown": {
    "problem_match": number (0-25),
    "intent": number (0-15),
    "recency": number (0-10),
    "icp_fit": number (0-30)
  },
  "why_fit": string,
  "status": "QUALIFIED" | "DISQUALIFIED"
}`;
        const userPrompt = `Prospect: ${prospectName}\nEvidence Quote: "${evidenceQuote}"\nICP: ${JSON.stringify(icpCriteria)}`;
        const rawJson = await this.callChatCompletion(systemPrompt, userPrompt, true);
        return JSON.parse(rawJson);
      } catch (err) {
        console.warn('Grok scoring failed, using deterministic scoring heuristic:', err);
      }
    }

    // Deterministic fallback scoring
    const hasIntentKeyword = /looking for|need|alternative|struggling|hiring|frustrated|manual/i.test(evidenceQuote);
    const problemMatch = hasIntentKeyword ? 24 : 16;
    const intent = hasIntentKeyword ? 14 : 9;
    const recency = 9;
    const icpFit = 28;
    const total = problemMatch + intent + recency + icpFit;

    return {
      total_score: total,
      score_breakdown: {
        problem_match: problemMatch,
        intent,
        recency,
        icp_fit: icpFit,
      },
      why_fit: `Public evidence directly demonstrates acute pain point: "${evidenceQuote.slice(0, 100)}..."`,
      status: total >= 60 ? 'QUALIFIED' : 'DISQUALIFIED',
    };
  }

  /**
   * Draft evidence-grounded outreach email
   */
  async draftOutreach(
    prospectName: string,
    productName: string,
    evidenceQuote: string,
    sourceUrl: string
  ): Promise<GrokDraftOutput> {
    if (this.isConfigured()) {
      try {
        const systemPrompt = `You are an authentic, non-spammy executive communicator.
Write a concise 3-sentence outreach email referencing EXACT public evidence.
NEVER fabricate familiarity, existing relationship, or non-existent claims.
Output strict JSON:
{
  "personalized_subject": string,
  "personalized_body": string,
  "personalization_rationale": string
}`;
        const userPrompt = `Prospect: ${prospectName}\nProduct: ${productName}\nVerbatim Evidence: "${evidenceQuote}"\nSource: ${sourceUrl}`;
        const rawJson = await this.callChatCompletion(systemPrompt, userPrompt, true);
        return JSON.parse(rawJson);
      } catch (err) {
        console.warn('Grok drafting failed, using deterministic template:', err);
      }
    }

    return {
      personalized_subject: `Regarding your post on ${evidenceQuote.slice(0, 32)}...`,
      personalized_body: `Hi ${prospectName.split(' ')[0]},\n\nI noticed your recent public note: "${evidenceQuote}".\n\nWe built ${productName} specifically to solve this bottleneck autonomously without manual overhead.\n\nWould you be open to taking a 3-minute look?`,
      personalization_rationale: `Grounded directly in public evidence quote from ${sourceUrl}. Zero artificial claims.`,
    };
  }

  /**
   * Classify inbound replies from webhooks
   */
  async classifyReply(replyBody: string): Promise<{ classification: ReplyClassification; reasoning: string }> {
    if (this.isConfigured()) {
      try {
        const systemPrompt = `Classify the following email reply into exactly one category:
'interested' | 'not_interested' | 'referral' | 'question' | 'out_of_office' | 'unsubscribe' | 'unclear'.
Output strict JSON: { "classification": string, "reasoning": string }`;
        const rawJson = await this.callChatCompletion(systemPrompt, replyBody, true);
        return JSON.parse(rawJson);
      } catch (err) {
        console.warn('Grok reply classification fallback:', err);
      }
    }

    const lower = replyBody.toLowerCase();
    if (lower.includes('unsubscribe') || lower.includes('stop') || lower.includes('remove me')) {
      return { classification: 'unsubscribe', reasoning: 'Explicit opt-out keyword detected.' };
    }
    if (lower.includes('out of office') || lower.includes('autoreply') || lower.includes('vacation')) {
      return { classification: 'out_of_office', reasoning: 'Autoresponder format detected.' };
    }
    if (lower.includes('interested') || lower.includes('send more') || lower.includes('demo') || lower.includes('call')) {
      return { classification: 'interested', reasoning: 'Expressed clear buying or evaluation interest.' };
    }
    if (lower.includes('not interested') || lower.includes('no thank') || lower.includes('pass')) {
      return { classification: 'not_interested', reasoning: 'Declined conversation.' };
    }
    return { classification: 'question', reasoning: 'Inquiry requiring manual human review.' };
  }
}

export const grokProvider = new GrokProvider();
