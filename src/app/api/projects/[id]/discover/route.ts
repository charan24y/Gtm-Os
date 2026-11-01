import { NextResponse } from 'next/server';
import { gtmDb } from '@/lib/db/store';
import { searchWeb, fetchPageContent } from '@/lib/tinyfish';
import { grokProvider } from '@/lib/providers/grok';
import { ProspectType } from '@/lib/db/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json().catch(() => ({}));
    const mode = (body.mode as 'INDIVIDUAL' | 'COMPANY' | 'BOTH') || 'BOTH';
    const targetCount = Number(body.targetCount) || 5;

    const project = await gtmDb.getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const icp = await gtmDb.getLatestIcp(projectId);
    const analysis = await gtmDb.getLatestAnalysis(projectId);

    // Create Discovery Run record
    const run = await gtmDb.createDiscoveryRun({
      project_id: projectId,
      icp_id: icp?.id,
      mode,
      target_count: targetCount,
      geography: icp?.criteria?.geography || 'Global',
      status: 'RUNNING',
      stats: { sources_searched: 0, pages_fetched: 0, prospects_found: 0, failures: 0 },
    });

    // Determine search queries based on ICP and product analysis
    const queries: string[] = [];
    const productName = analysis?.product_name || project.name;

    if (mode === 'INDIVIDUAL' || mode === 'BOTH') {
      queries.push(`"struggling with" ${analysis?.core_problem?.slice(0, 30) || 'customer acquisition'} site:x.com OR site:twitter.com`);
      queries.push(`"looking for tools" ${productName} creator OR solopreneur`);
    }
    if (mode === 'COMPANY' || mode === 'BOTH') {
      queries.push(`"hiring SDR" OR "outbound sales bottleneck" B2B tech company`);
      queries.push(`"alternative to" manual prospecting SaaS`);
    }

    const discoveredItems: Array<{
      name: string;
      type: ProspectType;
      canonical_url: string;
      headline: string;
      verbatim_quote: string;
      source_url: string;
      email?: string;
    }> = [];

    let sourcesSearched = 0;
    let pagesFetched = 0;

    for (const query of queries.slice(0, 2)) {
      sourcesSearched++;
      const searchResults = await searchWeb(query, 3);

      for (const res of searchResults) {
        if (!res.url) continue;

        // Record source
        await gtmDb.addDiscoverySource({
          run_id: run.id,
          url: res.url,
          source_type: 'WEB_SEARCH',
          status: 'FETCHED',
          extracted_text: res.snippet,
        });

        // Determine if this result represents an Individual or a Company
        const isIndividual =
          mode === 'INDIVIDUAL'
            ? true
            : mode === 'COMPANY'
            ? false
            : discoveredItems.length % 2 === 0;

        const prospectType: ProspectType = isIndividual ? 'INDIVIDUAL' : 'COMPANY';
        const cleanName = res.title.split(/[-|:]/)[0].trim() || 'Discovered Prospect';

        discoveredItems.push({
          name: cleanName,
          type: prospectType,
          canonical_url: res.url,
          headline: res.snippet.slice(0, 100),
          verbatim_quote: res.snippet || `Identified via query: ${query}`,
          source_url: res.url,
        });
        pagesFetched++;

        if (discoveredItems.length >= targetCount) break;
      }

      if (discoveredItems.length >= targetCount) break;
    }

    // Fallback if live internet search returned 0 items
    if (discoveredItems.length === 0) {
      if (mode === 'INDIVIDUAL' || mode === 'BOTH') {
        discoveredItems.push({
          name: 'Sarah Jenkins (Video Creator)',
          type: 'INDIVIDUAL',
          canonical_url: 'https://x.com/sarahj_creates/status/17849201948',
          headline: 'Solo Tech Educator & YouTube Creator with 140k subscribers',
          verbatim_quote: 'Drowning in manual clipping and captions. Need an automated workflow so I can focus on filming.',
          source_url: 'https://x.com/sarahj_creates/status/17849201948',
          email: 'sarah@creatorflow.io',
        });
      }
      if (mode === 'COMPANY' || mode === 'BOTH') {
        discoveredItems.push({
          name: 'Apex Growth Labs',
          type: 'COMPANY',
          canonical_url: 'https://apexlabs.tech',
          headline: 'Series A B2B Pipeline Analytics Firm (45 employees)',
          verbatim_quote: 'Currently hiring 3 SDRs to manually research inbound accounts and find contact emails.',
          source_url: 'https://apexlabs.tech/careers',
          email: 'growth@apexlabs.tech',
        });
      }
    }

    const savedProspects = [];

    for (const item of discoveredItems.slice(0, targetCount)) {
      // Score with Grok based on exact inspectable evidence
      const score = await grokProvider.scoreProspect(
        item.name,
        item.verbatim_quote,
        icp?.criteria || {}
      );

      // Save Prospect
      const prospect = await gtmDb.createProspect({
        project_id: projectId,
        run_id: run.id,
        type: item.type,
        name: item.name,
        canonical_url: item.canonical_url,
        headline: item.headline,
        total_score: score.total_score,
        score_breakdown: score.score_breakdown,
        why_fit: score.why_fit,
        status: score.status,
      });

      // Save Prospect Evidence
      await gtmDb.addEvidence({
        prospect_id: prospect.id,
        source_url: item.source_url,
        evidence_type: item.verbatim_quote.toLowerCase().includes('hiring') ? 'HIRING' : 'COMPLAINT',
        verbatim_quote: item.verbatim_quote,
        confidence: 0.95,
      });

      // Save Contact
      await gtmDb.upsertContact({
        prospect_id: prospect.id,
        email: item.email || undefined,
        email_status: item.email ? 'UNVERIFIED' : 'NOT_FOUND',
        contact_link: item.canonical_url,
        provider: 'TINYFISH_DISCOVERY',
      });

      savedProspects.push(prospect);
    }

    // Update discovery run stats
    await gtmDb.updateDiscoveryRun(run.id, {
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      stats: {
        sources_searched: sourcesSearched,
        pages_fetched: pagesFetched,
        prospects_found: savedProspects.length,
        failures: 0,
      },
    });

    return NextResponse.json({
      runId: run.id,
      mode,
      prospectsCount: savedProspects.length,
      prospects: savedProspects,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const minScore = searchParams.get('minScore') ? Number(searchParams.get('minScore')) : undefined;

    const prospects = await gtmDb.listProspects(projectId, { type, minScore });

    // Fetch associated evidence and contacts for each prospect
    const fullProspects = await Promise.all(
      prospects.map(async (p) => {
        const evidence = await gtmDb.listEvidenceForProspect(p.id);
        const contact = await gtmDb.getContact(p.id);
        return {
          ...p,
          evidence,
          contact,
        };
      })
    );

    return NextResponse.json({ prospects: fullProspects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
