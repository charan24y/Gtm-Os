/**
 * Campaign and Outreach Engine
 * Enforces strict human approval gates, suppression checks, idempotency, and audit logging.
 */

import { gtmDb } from '../db/store';
import { grokProvider } from '../providers/grok';
import { resendProvider } from '../providers/resend';
import { Campaign, CampaignProspect } from '../db/types';

export class CampaignEngine {
  /**
   * Create campaign and generate evidence-backed drafts in PENDING_APPROVAL status
   */
  async createCampaignWithDrafts(
    projectId: string,
    name: string,
    objective: string,
    prospectIds: string[]
  ): Promise<{ campaign: Campaign; drafts: CampaignProspect[] }> {
    const project = await gtmDb.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found.`);
    }

    const campaign = await gtmDb.createCampaign({
      project_id: projectId,
      name,
      objective,
      status: 'DRAFT',
    });

    const drafts: CampaignProspect[] = [];

    for (const pId of prospectIds) {
      const prospectList = await gtmDb.listProspects(projectId);
      const prospect = prospectList.find((p) => p.id === pId);
      if (!prospect) continue;

      const evidenceList = await gtmDb.listEvidenceForProspect(pId);
      const primaryEvidence = evidenceList[0];
      const quote = primaryEvidence?.verbatim_quote || prospect.why_fit;
      const sourceUrl = primaryEvidence?.source_url || prospect.canonical_url;

      // Generate draft with Grok, grounded strictly in public evidence
      const draftContent = await grokProvider.draftOutreach(
        prospect.name,
        project.name,
        quote,
        sourceUrl
      );

      const cp = await gtmDb.addCampaignProspect({
        campaign_id: campaign.id,
        prospect_id: pId,
        personalized_subject: draftContent.personalized_subject,
        personalized_body: draftContent.personalized_body,
        personalization_rationale: draftContent.personalization_rationale,
        status: 'PENDING_APPROVAL',
      });

      drafts.push(cp);
    }

    return { campaign, drafts };
  }

  /**
   * Explicit Human Approval Gate
   */
  async approveDraft(campaignId: string, prospectId: string): Promise<CampaignProspect> {
    const updated = await gtmDb.updateCampaignProspectStatus(campaignId, prospectId, 'APPROVED');
    if (!updated) {
      throw new Error(`Draft for campaign ${campaignId} and prospect ${prospectId} not found.`);
    }
    return updated;
  }

  async rejectDraft(campaignId: string, prospectId: string): Promise<CampaignProspect> {
    const updated = await gtmDb.updateCampaignProspectStatus(campaignId, prospectId, 'REJECTED');
    if (!updated) {
      throw new Error(`Draft for campaign ${campaignId} and prospect ${prospectId} not found.`);
    }
    return updated;
  }

  /**
   * Send approved outreach with multi-layer safeguards
   */
  async sendApprovedOutreach(
    campaignId: string,
    prospectId: string,
    workspaceId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const drafts = await gtmDb.listCampaignProspects(campaignId);
    const draft = drafts.find((d) => d.prospect_id === prospectId);

    if (!draft) {
      return { success: false, error: 'Campaign draft not found.' };
    }

    // Safeguard 1: Explicit human approval gate
    if (draft.status !== 'APPROVED') {
      return {
        success: false,
        error: `Action blocked: Draft status is '${draft.status}'. Explicit human approval is required before sending.`,
      };
    }

    // Retrieve contact recipient email
    const contact = await gtmDb.getContact(prospectId);
    if (!contact || !contact.email) {
      return { success: false, error: 'No contact email found for this prospect.' };
    }

    const recipientEmail = contact.email.trim().toLowerCase();

    // Safeguard 2: Suppression list check
    const isSuppressed = await gtmDb.isSuppressed(workspaceId, recipientEmail);
    if (isSuppressed) {
      await gtmDb.updateCampaignProspectStatus(campaignId, prospectId, 'FAILED');
      return {
        success: false,
        error: `Action blocked: Recipient ${recipientEmail} is on the workspace suppression list.`,
      };
    }

    // Safeguard 3: Dispatch via Resend provider
    const resendResult = await resendProvider.sendEmail({
      to: recipientEmail,
      subject: draft.personalized_subject,
      text: draft.personalized_body,
    });

    if (!resendResult.success) {
      return {
        success: false,
        error: resendResult.error || 'Failed to dispatch email via provider.',
      };
    }

    // Persist sent message record
    const message = await gtmDb.createEmailMessage({
      campaign_prospect_id: draft.id,
      provider_message_id: resendResult.messageId,
      from_email: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to_email: recipientEmail,
      status: 'DISPATCHED',
    });

    // Update draft status to SENT
    await gtmDb.updateCampaignProspectStatus(campaignId, prospectId, 'SENT');

    // Audit log
    await gtmDb.recordAudit({
      workspace_id: workspaceId,
      action: 'EMAIL_DISPATCHED',
      resource_type: 'EMAIL_MESSAGE',
      resource_id: message.id,
      details: {
        campaign_id: campaignId,
        prospect_id: prospectId,
        recipient: recipientEmail,
        provider_message_id: resendResult.messageId,
      },
    });

    return {
      success: true,
      messageId: resendResult.messageId,
    };
  }
}

export const campaignEngine = new CampaignEngine();
