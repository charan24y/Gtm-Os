/**
 * Hunter.io Email Finder & Verification Adapter
 * Grounded domain email searches and deliverability verification.
 */

export interface HunterSearchResult {
  status: 'MATCH' | 'NO_MATCH' | 'ERROR' | 'RATE_LIMITED';
  domain: string;
  organization?: string;
  emails: Array<{
    value: string;
    type: 'personal' | 'generic';
    confidence: number;
    first_name?: string;
    last_name?: string;
    position?: string;
  }>;
  raw_payload?: Record<string, unknown>;
  error?: string;
}

export interface HunterVerifyResult {
  status: 'VALID' | 'INVALID' | 'RISKY' | 'UNKNOWN' | 'ERROR';
  email: string;
  score: number;
  reason?: string;
  error?: string;
}

export class HunterProvider {
  private apiKey = process.env.HUNTER_API_KEY || '';
  private baseUrl = 'https://api.hunter.io/v2';

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async searchDomain(domain: string): Promise<HunterSearchResult> {
    if (!this.isConfigured()) {
      return {
        status: 'ERROR',
        domain,
        emails: [],
        error: 'HUNTER_API_KEY is not configured. Add it in .env.local to enable real domain email finding.',
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/domain-search?domain=${encodeURIComponent(domain)}&api_key=${this.apiKey}`,
        { method: 'GET' }
      );

      if (response.status === 429) {
        return { status: 'RATE_LIMITED', domain, emails: [], error: 'Hunter.io rate limit reached.' };
      }

      if (!response.ok) {
        const text = await response.text();
        return { status: 'ERROR', domain, emails: [], error: `Hunter API error (${response.status}): ${text}` };
      }

      const json = await response.json();
      const data = json.data;

      if (!data || !data.emails || data.emails.length === 0) {
        return { status: 'NO_MATCH', domain, emails: [], raw_payload: json };
      }

      return {
        status: 'MATCH',
        domain,
        organization: data.organization,
        emails: data.emails.map((e: {
          value: string;
          type: 'personal' | 'generic';
          confidence: number;
          first_name?: string;
          last_name?: string;
          position?: string;
        }) => ({
          value: e.value,
          type: e.type,
          confidence: e.confidence,
          first_name: e.first_name,
          last_name: e.last_name,
          position: e.position,
        })),
        raw_payload: json,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Hunter request error';
      return { status: 'ERROR', domain, emails: [], error: message };
    }
  }

  async verifyEmail(email: string): Promise<HunterVerifyResult> {
    if (!this.isConfigured()) {
      return {
        status: 'ERROR',
        email,
        score: 0,
        error: 'HUNTER_API_KEY is not configured. Add it in .env.local to verify email deliverability.',
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/email-verifier?email=${encodeURIComponent(email)}&api_key=${this.apiKey}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        return { status: 'ERROR', email, score: 0, error: `Hunter verification failed (${response.status})` };
      }

      const json = await response.json();
      const data = json.data;
      const statusMap: Record<string, HunterVerifyResult['status']> = {
        valid: 'VALID',
        invalid: 'INVALID',
        accept_all: 'RISKY',
        webmail: 'RISKY',
        disposable: 'INVALID',
      };

      return {
        status: statusMap[data.status] || 'UNKNOWN',
        email,
        score: data.score || 0,
        reason: data.result,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Hunter verify error';
      return { status: 'ERROR', email, score: 0, error: message };
    }
  }
}

export const hunterProvider = new HunterProvider();
