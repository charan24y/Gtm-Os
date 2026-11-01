/**
 * Apollo.io Enrichment Adapter
 * Enriches B2B companies and decision-maker contacts with honest verification statuses.
 */

export interface ApolloEnrichmentResult {
  status: 'MATCH' | 'NO_MATCH' | 'ERROR' | 'RATE_LIMITED';
  organization?: {
    name: string;
    domain: string;
    industry?: string;
    employee_count?: number;
    linkedin_url?: string;
  };
  contact?: {
    name: string;
    email?: string;
    title?: string;
    email_status: 'VALID' | 'UNVERIFIED' | 'NOT_FOUND';
  };
  raw_payload?: Record<string, unknown>;
  error?: string;
}

export class ApolloProvider {
  private apiKey = process.env.APOLLO_API_KEY || '';
  private baseUrl = 'https://api.apollo.io/v1';

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async enrichOrganization(domain: string): Promise<ApolloEnrichmentResult> {
    if (!this.isConfigured()) {
      return {
        status: 'ERROR',
        error: 'APOLLO_API_KEY is not configured. Add it in .env.local to enable real B2B organization enrichment.',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/organizations/enrich?domain=${encodeURIComponent(domain)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': this.apiKey,
        },
      });

      if (response.status === 429) {
        return { status: 'RATE_LIMITED', error: 'Apollo API rate limit reached.' };
      }

      if (response.status === 404) {
        return { status: 'NO_MATCH' };
      }

      if (!response.ok) {
        const text = await response.text();
        return { status: 'ERROR', error: `Apollo returned HTTP ${response.status}: ${text}` };
      }

      const json = await response.json();
      const org = json.organization;

      if (!org) {
        return { status: 'NO_MATCH', raw_payload: json };
      }

      return {
        status: 'MATCH',
        organization: {
          name: org.name || domain,
          domain: org.primary_domain || domain,
          industry: org.industry,
          employee_count: org.estimated_num_employees,
          linkedin_url: org.linkedin_url,
        },
        raw_payload: json,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Apollo request error';
      return { status: 'ERROR', error: message };
    }
  }

  async matchPerson(domain: string, title?: string): Promise<ApolloEnrichmentResult> {
    if (!this.isConfigured()) {
      return {
        status: 'ERROR',
        error: 'APOLLO_API_KEY is not configured. Add it in .env.local to enable contact enrichment.',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/people/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          domain,
          ...(title ? { organization_title: title } : {}),
        }),
      });

      if (response.status === 429) {
        return { status: 'RATE_LIMITED', error: 'Apollo API rate limit reached.' };
      }

      if (response.status === 404) {
        return { status: 'NO_MATCH' };
      }

      if (!response.ok) {
        const text = await response.text();
        return { status: 'ERROR', error: `Apollo returned HTTP ${response.status}: ${text}` };
      }

      const json = await response.json();
      const person = json.person;

      if (!person) {
        return { status: 'NO_MATCH', raw_payload: json };
      }

      return {
        status: 'MATCH',
        contact: {
          name: person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
          email: person.email || undefined,
          title: person.title,
          email_status: person.email_status === 'verified' ? 'VALID' : person.email ? 'UNVERIFIED' : 'NOT_FOUND',
        },
        raw_payload: json,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Apollo request error';
      return { status: 'ERROR', error: message };
    }
  }
}

export const apolloProvider = new ApolloProvider();
