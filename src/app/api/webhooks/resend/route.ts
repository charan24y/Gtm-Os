import { NextResponse } from 'next/server';
import { resendProvider } from '@/lib/providers/resend';
import { grokProvider } from '@/lib/providers/grok';
import { gtmDb } from '@/lib/db/store';
import { EmailEventType, SuppressionReason } from '@/lib/db/types';

export async function POST(request: Request) {
  try {
    const rawPayload = await request.text();
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    // 1. Verify Svix signature
    const verifyResult = resendProvider.verifyWebhook(rawPayload, {
      id: svixId,
      timestamp: svixTimestamp,
      signature: svixSignature,
    });

    if (!verifyResult.valid) {
      return NextResponse.json({ error: verifyResult.error || 'Invalid signature' }, { status: 401 });
    }

    const event = (verifyResult.data || JSON.parse(rawPayload)) as {
      type: string;
      data: {
        email_id?: string;
        from?: string;
        to?: string | string[];
        subject?: string;
        text?: string;
        html?: string;
        bounce_type?: string;
        reason?: string;
      };
    };

    const recipient = Array.isArray(event.data?.to) ? event.data.to[0] : event.data?.to || '';
    const workspaceId = 'ws-default-1';

    let eventType: EmailEventType = 'DELIVERED';
    let suppressionReason: SuppressionReason | null = null;

    switch (event.type) {
      case 'email.delivered':
        eventType = 'DELIVERED';
        break;
      case 'email.bounced':
        eventType = 'BOUNCED';
        suppressionReason = 'HARD_BOUNCE';
        break;
      case 'email.complained':
        eventType = 'COMPLAINED';
        suppressionReason = 'SPAM_COMPLAINT';
        break;
      case 'email.opened':
        eventType = 'OPENED';
        break;
      case 'email.clicked':
        eventType = 'CLICKED';
        break;
      case 'email.replied':
      case 'inbound.email':
        eventType = 'REPLIED';
        break;
      default:
        eventType = 'DELIVERED';
    }

    // Record email event in email_events table
    const recordedEvent = await gtmDb.recordEmailEvent({
      event_type: eventType,
      payload: event as unknown as Record<string, unknown>,
    });

    // If hard bounce or spam complaint, automatically add to suppression list
    if (suppressionReason && recipient) {
      await gtmDb.addToSuppression(workspaceId, recipient, suppressionReason);
      await gtmDb.recordAudit({
        workspace_id: workspaceId,
        action: 'SUPPRESSION_ADDED',
        resource_type: 'SUPPRESSION_LIST',
        details: { email: recipient, reason: suppressionReason, source_event: event.type },
      });
    }

    // If reply received, classify with Grok
    let replyClassification = null;
    if (eventType === 'REPLIED' && (event.data?.text || event.data?.html)) {
      const replyBody = event.data.text || event.data.html || '';
      replyClassification = await grokProvider.classifyReply(replyBody);

      // If prospect replied asking to unsubscribe, automatically suppress
      if (replyClassification.classification === 'unsubscribe' && recipient) {
        await gtmDb.addToSuppression(workspaceId, recipient, 'UNSUBSCRIBE');
      }

      await gtmDb.recordAudit({
        workspace_id: workspaceId,
        action: 'REPLY_CLASSIFIED',
        resource_type: 'EMAIL_EVENT',
        resource_id: recordedEvent.id,
        details: {
          recipient,
          classification: replyClassification.classification,
          reasoning: replyClassification.reasoning,
        },
      });
    }

    return NextResponse.json({
      received: true,
      eventType,
      suppressed: Boolean(suppressionReason),
      classification: replyClassification,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
