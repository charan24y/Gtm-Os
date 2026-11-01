import {
  Workspace,
  WorkspaceMember,
  Project,
  ProductAnalysis,
  IcpProfile,
  DiscoveryRun,
  DiscoverySource,
  Prospect,
  ProspectEvidence,
  Contact,
  EnrichmentRecord,
  Campaign,
  CampaignProspect,
  EmailMessage,
  EmailEvent,
  SuppressionItem,
  JobRun,
  AuditLog,
  ExportItem,
  JobStatus,
  IcpStatus,
  CampaignProspectStatus,
  EmailMessageStatus,
} from './types';
import { createAdminSupabase, isSupabaseConfigured } from './client';

// In-process memory store for local development, tests, or fallback
class InMemoryStore {
  workspaces: Map<string, Workspace> = new Map();
  members: Map<string, WorkspaceMember> = new Map();
  projects: Map<string, Project> = new Map();
  analyses: Map<string, ProductAnalysis> = new Map();
  icps: Map<string, IcpProfile> = new Map();
  discoveryRuns: Map<string, DiscoveryRun> = new Map();
  discoverySources: Map<string, DiscoverySource> = new Map();
  prospects: Map<string, Prospect> = new Map();
  evidence: Map<string, ProspectEvidence> = new Map();
  contacts: Map<string, Contact> = new Map();
  enrichmentRecords: Map<string, EnrichmentRecord> = new Map();
  campaigns: Map<string, Campaign> = new Map();
  campaignProspects: Map<string, CampaignProspect> = new Map();
  emailMessages: Map<string, EmailMessage> = new Map();
  emailEvents: Map<string, EmailEvent> = new Map();
  suppressionList: Map<string, SuppressionItem> = new Map();
  jobRuns: Map<string, JobRun> = new Map();
  auditLogs: Map<string, AuditLog> = new Map();
  exports: Map<string, ExportItem> = new Map();

  constructor() {
    this.seedDefaultWorkspace();
  }

  seedDefaultWorkspace() {
    const defaultWsId = 'ws-default-1';
    const defaultUserId = 'usr-founder-1';
    this.workspaces.set(defaultWsId, {
      id: defaultWsId,
      name: 'Default Workspace',
      owner_id: defaultUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    this.members.set(`${defaultWsId}:${defaultUserId}`, {
      id: `mem-${defaultWsId}-${defaultUserId}`,
      workspace_id: defaultWsId,
      user_id: defaultUserId,
      role: 'OWNER',
      created_at: new Date().toISOString(),
    });
  }
}

const memoryStore = new InMemoryStore();

// Repository layer that checks RLS workspace isolation
export class GtmRepository {
  private supabase = createAdminSupabase();
  private isLive = isSupabaseConfigured();

  // WORKSPACE ISOLATION CHECK
  async verifyWorkspaceAccess(workspaceId: string, userId: string): Promise<boolean> {
    if (this.isLive && this.supabase) {
      const { data, error } = await this.supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single();
      if (!error && data) return true;

      const { data: ws } = await this.supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single();
      return ws?.owner_id === userId;
    }

    // In-memory RLS
    const member = memoryStore.members.get(`${workspaceId}:${userId}`);
    if (member) return true;
    const ws = memoryStore.workspaces.get(workspaceId);
    return ws?.owner_id === userId;
  }

  // WORKSPACES
  async getWorkspace(id: string): Promise<Workspace | null> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('workspaces').select('*').eq('id', id).single();
      return data || null;
    }
    return memoryStore.workspaces.get(id) || null;
  }

  async createWorkspace(name: string, ownerId: string): Promise<Workspace> {
    const ws: Workspace = {
      id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('workspaces').insert(ws).select().single();
      if (data) return data;
    }
    memoryStore.workspaces.set(ws.id, ws);
    memoryStore.members.set(`${ws.id}:${ownerId}`, {
      id: `mem-${ws.id}-${ownerId}`,
      workspace_id: ws.id,
      user_id: ownerId,
      role: 'OWNER',
      created_at: new Date().toISOString(),
    });
    return ws;
  }

  // PROJECTS
  async createProject(workspaceId: string, name: string, productUrl: string): Promise<Project> {
    const project: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      workspace_id: workspaceId,
      name,
      product_url: productUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('projects').insert(project).select().single();
      if (data) return data;
    }
    memoryStore.projects.set(project.id, project);
    return project;
  }

  async getProject(id: string): Promise<Project | null> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('projects').select('*').eq('id', id).single();
      return data || null;
    }
    return memoryStore.projects.get(id) || null;
  }

  async listProjects(workspaceId: string): Promise<Project[]> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('projects').select('*').eq('workspace_id', workspaceId);
      return data || [];
    }
    return Array.from(memoryStore.projects.values()).filter((p) => p.workspace_id === workspaceId);
  }

  // PRODUCT ANALYSES
  async saveAnalysis(analysis: Omit<ProductAnalysis, 'id' | 'created_at'>): Promise<ProductAnalysis> {
    const fullAnalysis: ProductAnalysis = {
      ...analysis,
      id: `ana-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('product_analyses').insert(fullAnalysis).select().single();
      if (data) return data;
    }
    memoryStore.analyses.set(fullAnalysis.id, fullAnalysis);
    return fullAnalysis;
  }

  async getLatestAnalysis(projectId: string): Promise<ProductAnalysis | null> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase
        .from('product_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data || null;
    }
    const all = Array.from(memoryStore.analyses.values())
      .filter((a) => a.project_id === projectId)
      .sort((a, b) => b.version - a.version);
    return all[0] || null;
  }

  // ICP PROFILES
  async createIcp(icp: Omit<IcpProfile, 'id' | 'created_at'>): Promise<IcpProfile> {
    const fullIcp: IcpProfile = {
      ...icp,
      id: `icp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('icp_profiles').insert(fullIcp).select().single();
      if (data) return data;
    }
    memoryStore.icps.set(fullIcp.id, fullIcp);
    return fullIcp;
  }

  async approveIcp(icpId: string, userId: string): Promise<IcpProfile | null> {
    const now = new Date().toISOString();
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase
        .from('icp_profiles')
        .update({ status: 'APPROVED', approved_by: userId, approved_at: now })
        .eq('id', icpId)
        .select()
        .single();
      return data || null;
    }
    const existing = memoryStore.icps.get(icpId);
    if (!existing) return null;
    const updated: IcpProfile = {
      ...existing,
      status: 'APPROVED',
      approved_by: userId,
      approved_at: now,
    };
    memoryStore.icps.set(icpId, updated);
    return updated;
  }

  async getLatestIcp(projectId: string): Promise<IcpProfile | null> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase
        .from('icp_profiles')
        .select('*')
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data || null;
    }
    const all = Array.from(memoryStore.icps.values())
      .filter((i) => i.project_id === projectId)
      .sort((a, b) => b.version - a.version);
    return all[0] || null;
  }

  // DISCOVERY RUNS
  async createDiscoveryRun(run: Omit<DiscoveryRun, 'id' | 'created_at'>): Promise<DiscoveryRun> {
    const fullRun: DiscoveryRun = {
      ...run,
      id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('discovery_runs').insert(fullRun).select().single();
      if (data) return data;
    }
    memoryStore.discoveryRuns.set(fullRun.id, fullRun);
    return fullRun;
  }

  async updateDiscoveryRun(id: string, updates: Partial<DiscoveryRun>): Promise<DiscoveryRun | null> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('discovery_runs').update(updates).eq('id', id).select().single();
      return data || null;
    }
    const existing = memoryStore.discoveryRuns.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    memoryStore.discoveryRuns.set(id, updated);
    return updated;
  }

  // DISCOVERY SOURCES
  async addDiscoverySource(source: Omit<DiscoverySource, 'id' | 'created_at'>): Promise<DiscoverySource> {
    const fullSource: DiscoverySource = {
      ...source,
      id: `src-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('discovery_sources').insert(fullSource).select().single();
      if (data) return data;
    }
    memoryStore.discoverySources.set(fullSource.id, fullSource);
    return fullSource;
  }

  // PROSPECTS & EVIDENCE
  async createProspect(prospect: Omit<Prospect, 'id' | 'created_at'>): Promise<Prospect> {
    const fullProspect: Prospect = {
      ...prospect,
      id: `psp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('prospects').insert(fullProspect).select().single();
      if (data) return data;
    }
    memoryStore.prospects.set(fullProspect.id, fullProspect);
    return fullProspect;
  }

  async listProspects(projectId: string, filters?: { type?: string; minScore?: number }): Promise<Prospect[]> {
    if (this.isLive && this.supabase) {
      let query = this.supabase.from('prospects').select('*').eq('project_id', projectId);
      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.minScore) query = query.gte('total_score', filters.minScore);
      const { data } = await query.order('total_score', { ascending: false });
      return data || [];
    }
    return Array.from(memoryStore.prospects.values())
      .filter((p) => p.project_id === projectId)
      .filter((p) => (!filters?.type ? true : p.type === filters.type))
      .filter((p) => (!filters?.minScore ? true : p.total_score >= filters.minScore))
      .sort((a, b) => b.total_score - a.total_score);
  }

  async addEvidence(ev: Omit<ProspectEvidence, 'id' | 'created_at'>): Promise<ProspectEvidence> {
    const fullEv: ProspectEvidence = {
      ...ev,
      id: `evi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('prospect_evidence').insert(fullEv).select().single();
      if (data) return data;
    }
    memoryStore.evidence.set(fullEv.id, fullEv);
    return fullEv;
  }

  async listEvidenceForProspect(prospectId: string): Promise<ProspectEvidence[]> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('prospect_evidence').select('*').eq('prospect_id', prospectId);
      return data || [];
    }
    return Array.from(memoryStore.evidence.values()).filter((e) => e.prospect_id === prospectId);
  }

  // CONTACTS & ENRICHMENT
  async upsertContact(contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
    const existing = Array.from(memoryStore.contacts.values()).find((c) => c.prospect_id === contact.prospect_id);
    const fullContact: Contact = {
      ...contact,
      id: existing ? existing.id : `cnt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: existing ? existing.created_at : new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('contacts').upsert(fullContact).select().single();
      if (data) return data;
    }
    memoryStore.contacts.set(fullContact.id, fullContact);
    return fullContact;
  }

  async getContact(prospectId: string): Promise<Contact | null> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('contacts').select('*').eq('prospect_id', prospectId).maybeSingle();
      return data || null;
    }
    return Array.from(memoryStore.contacts.values()).find((c) => c.prospect_id === prospectId) || null;
  }

  async addEnrichmentRecord(record: Omit<EnrichmentRecord, 'id' | 'created_at'>): Promise<EnrichmentRecord> {
    const fullRecord: EnrichmentRecord = {
      ...record,
      id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('enrichment_records').insert(fullRecord).select().single();
      if (data) return data;
    }
    memoryStore.enrichmentRecords.set(fullRecord.id, fullRecord);
    return fullRecord;
  }

  // CAMPAIGNS & PROSPECTS
  async createCampaign(campaign: Omit<Campaign, 'id' | 'created_at'>): Promise<Campaign> {
    const fullCampaign: Campaign = {
      ...campaign,
      id: `cmp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('campaigns').insert(fullCampaign).select().single();
      if (data) return data;
    }
    memoryStore.campaigns.set(fullCampaign.id, fullCampaign);
    return fullCampaign;
  }

  async addCampaignProspect(cp: Omit<CampaignProspect, 'id' | 'created_at'>): Promise<CampaignProspect> {
    const fullCp: CampaignProspect = {
      ...cp,
      id: `cp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('campaign_prospects').insert(fullCp).select().single();
      if (data) return data;
    }
    memoryStore.campaignProspects.set(fullCp.id, fullCp);
    return fullCp;
  }

  async updateCampaignProspectStatus(
    campaignId: string,
    prospectId: string,
    status: CampaignProspectStatus
  ): Promise<CampaignProspect | null> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase
        .from('campaign_prospects')
        .update({ status })
        .eq('campaign_id', campaignId)
        .eq('prospect_id', prospectId)
        .select()
        .single();
      return data || null;
    }
    const item = Array.from(memoryStore.campaignProspects.values()).find(
      (x) => x.campaign_id === campaignId && x.prospect_id === prospectId
    );
    if (!item) return null;
    item.status = status;
    memoryStore.campaignProspects.set(item.id, item);
    return item;
  }

  async listCampaignProspects(campaignId: string): Promise<CampaignProspect[]> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase
        .from('campaign_prospects')
        .select('*')
        .eq('campaign_id', campaignId);
      return data || [];
    }
    return Array.from(memoryStore.campaignProspects.values()).filter((c) => c.campaign_id === campaignId);
  }

  // EMAIL MESSAGES & SUPPRESSION
  async isSuppressed(workspaceId: string, email: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase
        .from('suppression_list')
        .select('id')
        .eq('workspace_id', workspaceId)
        .ilike('email', cleanEmail)
        .maybeSingle();
      return Boolean(data);
    }
    const key = `${workspaceId}:${cleanEmail}`;
    return memoryStore.suppressionList.has(key);
  }

  async addToSuppression(workspaceId: string, email: string, reason: SuppressionItem['reason']): Promise<SuppressionItem> {
    const cleanEmail = email.trim().toLowerCase();
    const item: SuppressionItem = {
      id: `sup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      workspace_id: workspaceId,
      email: cleanEmail,
      reason,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      await this.supabase.from('suppression_list').upsert(item);
    }
    memoryStore.suppressionList.set(`${workspaceId}:${cleanEmail}`, item);
    return item;
  }

  async createEmailMessage(msg: Omit<EmailMessage, 'id' | 'sent_at'>): Promise<EmailMessage> {
    const fullMsg: EmailMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sent_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('email_messages').insert(fullMsg).select().single();
      if (data) return data;
    }
    memoryStore.emailMessages.set(fullMsg.id, fullMsg);
    return fullMsg;
  }

  async updateEmailStatus(messageId: string, status: EmailMessageStatus): Promise<void> {
    if (this.isLive && this.supabase) {
      await this.supabase.from('email_messages').update({ status }).eq('id', messageId);
      return;
    }
    const msg = memoryStore.emailMessages.get(messageId);
    if (msg) {
      msg.status = status;
      memoryStore.emailMessages.set(messageId, msg);
    }
  }

  async recordEmailEvent(event: Omit<EmailEvent, 'id' | 'created_at'>): Promise<EmailEvent> {
    const fullEvent: EmailEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('email_events').insert(fullEvent).select().single();
      if (data) return data;
    }
    memoryStore.emailEvents.set(fullEvent.id, fullEvent);
    return fullEvent;
  }

  // DURABLE JOBS
  async createJob(workspaceId: string, type: string, payload: Record<string, unknown>): Promise<JobRun> {
    const job: JobRun = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      workspace_id: workspaceId,
      type,
      status: 'QUEUED',
      attempts: 0,
      payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('job_runs').insert(job).select().single();
      if (data) return data;
    }
    memoryStore.jobRuns.set(job.id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<JobRun>): Promise<JobRun | null> {
    const now = new Date().toISOString();
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase
        .from('job_runs')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      return data || null;
    }
    const job = memoryStore.jobRuns.get(id);
    if (!job) return null;
    const updated = { ...job, ...updates, updated_at: now };
    memoryStore.jobRuns.set(id, updated);
    return updated;
  }

  async getJob(id: string): Promise<JobRun | null> {
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('job_runs').select('*').eq('id', id).single();
      return data || null;
    }
    return memoryStore.jobRuns.get(id) || null;
  }

  // AUDIT LOGS
  async recordAudit(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const fullLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      await this.supabase.from('audit_logs').insert(fullLog);
    }
    memoryStore.auditLogs.set(fullLog.id, fullLog);
    return fullLog;
  }

  // EXPORTS
  async recordExport(exp: Omit<ExportItem, 'id' | 'created_at'>): Promise<ExportItem> {
    const fullExp: ExportItem = {
      ...exp,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    if (this.isLive && this.supabase) {
      const { data } = await this.supabase.from('exports').insert(fullExp).select().single();
      if (data) return data;
    }
    memoryStore.exports.set(fullExp.id, fullExp);
    return fullExp;
  }
}

export const gtmDb = new GtmRepository();
