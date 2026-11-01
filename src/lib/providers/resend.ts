/**
 * Resend Email Adapter & Svix Webhook Verification
 * Dispatches approval-gated personalized communications and verifies incoming webhooks.
 */

import { Webhook } from 'svix';

export interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  sentTo?: string;
  note?: string;
  error?: string;
}

export class ResendProvider {
  private apiKey = process.env.RESEND_API_KEY || '';
  private defaultFrom = process.env.RESEND_FROM_EMAIL || 'GTM OS <onboarding@resend.dev>';
  private webhookSecret = process.env.RESEND_WEBHOOK_SECRET || '';

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'RESEND_API_KEY is not configured in .env.local. Real email sending is safely paused.',
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.defaultFrom,
          to: [params.to],
          subject: params.subject,
          text: params.text,
          html: params.html || (params.text ? `<p style="white-space: pre-wrap;">${params.text}</p>` : undefined),
          ...(params.replyTo ? { reply_to: params.replyTo } : {}),
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        // Resend Sandbox Restriction Detection:
        // Free tier requires custom domain verification to send to external recipients,
        // and restricts sandbox sends to the registered account owner (e.g. lok.mba14@gmail.com).
        const errMsg = json.message || '';
        const emailMatch = errMsg.match(/to your own email address \(([^)]+)\)/i);
        const registeredEmail = emailMatch ? emailMatch[1] : 'lok.mba14@gmail.com';

        if (
          errMsg.includes('You can only send testing emails to your own email address') ||
          errMsg.includes('validation_error') ||
          response.status === 403 ||
          response.status === 422
        ) {
          console.log(`[ResendProvider] Routing to registered account inbox (${registeredEmail}) due to Resend sandbox policy for target: ${params.to}`);

          const fallbackRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              from: this.defaultFrom,
              to: [registeredEmail],
              subject: `[GTM OS Demo -> ${params.to}] ${params.subject}`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; border: 1px solid #2455FF; border-radius: 8px; background: #0E1017; color: #E9E9E7; margin-bottom: 20px;">
                  <div style="color: #C7FF35; font-weight: bold; font-size: 14px; text-transform: uppercase; margin-bottom: 6px;">⚡ GTM OS Live Acquisition Outreach</div>
                  <div style="font-size: 12px; color: #777B88;"><strong>Target Lead:</strong> ${params.to}</div>
                  <div style="font-size: 12px; color: #777B88;"><strong>Sandbox Routing:</strong> Delivered to your verified Resend account (<code>${registeredEmail}</code>) because <code>onboarding@resend.dev</code> operates in free test mode.</div>
                </div>
                <div style="font-size: 14px; line-height: 1.6; color: #111;">
                  ${params.html || (params.text ? `<p style="white-space: pre-wrap;">${params.text}</p>` : '')}
                </div>
              `,
            }),
          });

          const fallbackJson = await fallbackRes.json();
          if (fallbackRes.ok && fallbackJson.id) {
            return {
              success: true,
              messageId: fallbackJson.id,
              sentTo: registeredEmail,
              note: `Delivered to your registered inbox ${registeredEmail} (Sandbox Routing for ${params.to}). Check your Gmail!`,
            };
          }
        }

        return {
          success: false,
          error: json.message || `Resend error (${response.status})`,
        };
      }

      return {
        success: true,
        messageId: json.id,
        sentTo: params.to,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Resend error';
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Verify Svix webhook signature sent by Resend
   */
  verifyWebhook(
    payload: string,
    headers: {
      id?: string | null;
      timestamp?: string | null;
      signature?: string | null;
    }
  ): { valid: boolean; data?: unknown; error?: string } {
    if (!this.webhookSecret) {
      // In development, if secret is not set, log warning
      console.warn('RESEND_WEBHOOK_SECRET not configured. Bypassing signature verification in dev mode.');
      try {
        return { valid: true, data: JSON.parse(payload) };
      } catch (err: unknown) {
        return { valid: false, error: 'Malformed JSON payload' };
      }
    }

    if (!headers.id || !headers.timestamp || !headers.signature) {
      return { valid: false, error: 'Missing Svix headers (svix-id, svix-timestamp, svix-signature)' };
    }

    try {
      const wh = new Webhook(this.webhookSecret);
      const verified = wh.verify(payload, {
        'svix-id': headers.id,
        'svix-timestamp': headers.timestamp,
        'svix-signature': headers.signature,
      });
      return { valid: true, data: verified };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signature verification failed';
      return { valid: false, error: msg };
    }
  }
}

export const resendProvider = new ResendProvider();
