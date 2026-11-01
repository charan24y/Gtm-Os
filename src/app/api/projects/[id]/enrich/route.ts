import { NextResponse } from 'next/server';
import { gtmDb } from '@/lib/db/store';
import { apolloProvider } from '@/lib/providers/apollo';
import { hunterProvider } from '@/lib/providers/hunter';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { prospectId, provider = 'ALL' } = body;

    const prospect = (await gtmDb.listProspects(projectId)).find((p) => p.id === prospectId);
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found.' }, { status: 404 });
    }

    const contact = (await gtmDb.getContact(prospectId)) || (await gtmDb.upsertContact({
      prospect_id: prospectId,
      email_status: 'UNKNOWN',
    }));

    // Extract domain from canonical_url
    let domain = '';
    try {
      domain = new URL(prospect.canonical_url).hostname.replace('www.', '');
    } catch {
      domain = prospect.canonical_url.split('/')[0];
    }

    const enrichmentOutcomes = [];

    // 1. Apollo enrichment for organizations / contacts
    if (provider === 'ALL' || provider === 'APOLLO') {
      const apolloResult = await apolloProvider.enrichOrganization(domain);

      await gtmDb.addEnrichmentRecord({
        contact_id: contact.id,
        provider: 'APOLLO',
        status: apolloResult.status,
        raw_payload: apolloResult.raw_payload || { error: apolloResult.error },
      });

      enrichmentOutcomes.push({ provider: 'APOLLO', result: apolloResult });
    }

    // 2. Hunter enrichment for email finding / verification
    if (provider === 'ALL' || provider === 'HUNTER') {
      const hunterResult = await hunterProvider.searchDomain(domain);

      let status: 'MATCH' | 'NO_MATCH' | 'ERROR' | 'RATE_LIMITED' = hunterResult.status;
      let discoveredEmail: string | undefined = hunterResult.emails?.[0]?.value;

      if (discoveredEmail) {
        // If email found, verify deliverability
        const verify = await hunterProvider.verifyEmail(discoveredEmail);
        await gtmDb.upsertContact({
          prospect_id: prospectId,
          email: discoveredEmail,
          email_status: verify.status === 'VALID' ? 'VALID' : 'UNVERIFIED',
          provider: 'HUNTER',
          enriched_at: new Date().toISOString(),
        });
      }

      await gtmDb.addEnrichmentRecord({
        contact_id: contact.id,
        provider: 'HUNTER',
        status,
        raw_payload: hunterResult.raw_payload || { error: hunterResult.error },
      });

      enrichmentOutcomes.push({ provider: 'HUNTER', result: hunterResult });
    }

    const updatedContact = await gtmDb.getContact(prospectId);

    return NextResponse.json({
      prospectId,
      contact: updatedContact,
      enrichment: enrichmentOutcomes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
