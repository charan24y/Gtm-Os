import { NextResponse } from 'next/server';
import { gtmDb } from '@/lib/db/store';
import { grokProvider } from '@/lib/providers/grok';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const icp = await gtmDb.getLatestIcp(projectId);
    if (!icp) {
      return NextResponse.json({ error: 'No ICP profile found for this project.' }, { status: 404 });
    }
    return NextResponse.json({ icp });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json().catch(() => ({}));
    const mode = (body.mode as 'INDIVIDUAL' | 'COMPANY' | 'BOTH') || 'BOTH';

    const analysis = await gtmDb.getLatestAnalysis(projectId);
    if (!analysis) {
      return NextResponse.json(
        { error: 'Product analysis must be generated and reviewed before creating an ICP.' },
        { status: 400 }
      );
    }

    const grokIcp = await grokProvider.generateIcp(
      {
        product_name: analysis.product_name,
        summary: analysis.summary,
        core_problem: analysis.core_problem,
        value_prop: analysis.value_prop,
        features: analysis.features,
        target_users: analysis.target_users,
        pricing_info: analysis.pricing_info,
        suggested_search_queries: [],
      },
      mode
    );

    const previousIcp = await gtmDb.getLatestIcp(projectId);
    const nextVersion = (previousIcp?.version || 0) + 1;

    const saved = await gtmDb.createIcp({
      project_id: projectId,
      name: grokIcp.name,
      mode,
      version: nextVersion,
      status: 'DRAFT',
      criteria: grokIcp.criteria,
      disqualifiers: grokIcp.disqualifiers,
      signals: grokIcp.signals,
    });

    return NextResponse.json({ icp: saved }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { icpId, action, userId = 'usr-founder-1' } = body;

    const targetIcpId = icpId || (await gtmDb.getLatestIcp(projectId))?.id;
    if (!targetIcpId) {
      return NextResponse.json({ error: 'ICP ID is required.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const approved = await gtmDb.approveIcp(targetIcpId, userId);
      return NextResponse.json({ icp: approved, message: 'ICP approved successfully.' });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
