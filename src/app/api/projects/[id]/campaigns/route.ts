import { NextResponse } from 'next/server';
import { gtmDb } from '@/lib/db/store';
import { campaignEngine } from '@/lib/campaigns/engine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { name, objective, prospectIds } = body;

    if (!name || !objective || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return NextResponse.json(
        { error: 'Campaign name, objective, and at least one prospectId are required.' },
        { status: 400 }
      );
    }

    const { campaign, drafts } = await campaignEngine.createCampaignWithDrafts(
      projectId,
      name,
      objective,
      prospectIds
    );

    return NextResponse.json({ campaign, drafts }, { status: 201 });
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
    const campaignId = searchParams.get('campaignId');

    if (campaignId) {
      const drafts = await gtmDb.listCampaignProspects(campaignId);
      return NextResponse.json({ campaignId, drafts });
    }

    return NextResponse.json({ error: 'campaignId parameter required' }, { status: 400 });
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
    const body = await request.json();
    const { campaignId, prospectId, action } = body;

    if (!campaignId || !prospectId || !action) {
      return NextResponse.json(
        { error: 'campaignId, prospectId, and action (APPROVE/REJECT) are required.' },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      const updated = await campaignEngine.approveDraft(campaignId, prospectId);
      return NextResponse.json({ draft: updated, message: 'Draft approved by human operator.' });
    }

    if (action === 'REJECT') {
      const updated = await campaignEngine.rejectDraft(campaignId, prospectId);
      return NextResponse.json({ draft: updated, message: 'Draft rejected.' });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
