import { NextResponse } from 'next/server';
import { campaignEngine } from '@/lib/campaigns/engine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { prospectId, workspaceId = 'ws-default-1' } = body;

    if (!prospectId) {
      return NextResponse.json({ error: 'prospectId is required.' }, { status: 400 });
    }

    const result = await campaignEngine.sendApprovedOutreach(
      campaignId,
      prospectId,
      workspaceId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, blocked: true },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Approved outreach email successfully dispatched via Resend.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
