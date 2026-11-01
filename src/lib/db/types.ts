export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type AnalysisStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type IcpMode = 'INDIVIDUAL' | 'COMPANY' | 'BOTH';
export type IcpStatus = 'DRAFT' | 'APPROVED' | 'ARCHIVED';
export type DiscoveryRunStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ProspectType = 'INDIVIDUAL' | 'COMPANY';
export type ProspectStatus = 'QUALIFIED' | 'DISQUALIFIED' | 'CONTACTED' | 'CONVERTED';
export type EvidenceType = 'COMPLAINT' | 'TOOL_REQUEST' | 'ALTERNATIVE_SEARCH' | 'HIRING' | 'CHANNEL_GAP' | 'PUBLIC_POST';
export type EmailStatus = 'UNKNOWN' | 'NOT_FOUND' | 'UNVERIFIED' | 'VALID' | 'INVALID' | 'RISKY' | 'OPTED_OUT';
export type EnrichmentProvider = 'APOLLO' | 'HUNTER';
export type EnrichmentStatus = 'MATCH' | 'NO_MATCH' | 'ERROR' | 'RATE_LIMITED';
export type CampaignStatus = 'DRAFT' | 'APPROVED' | 'RUNNING' | 'COMPLETED' | 'PAUSED';
export type CampaignProspectStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SENT' | 'FAILED';
export type EmailMessageStatus = 'DISPATCHED' | 'DELIVERED' | 'BOUNCED' | 'COMPLAINED';
export type EmailEventType = 'DELIVERED' | 'BOUNCED' | 'COMPLAINED' | 'OPENED' | 'CLICKED' | 'REPLIED';
export type SuppressionReason = 'UNSUBSCRIBE' | 'HARD_BOUNCE' | 'SPAM_COMPLAINT' | 'MANUAL';
export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ExportFormat = 'CSV' | 'PDF';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  product_url: string;
  created_at: string;
  updated_at: string;
}

export interface ProductAnalysis {
  id: string;
  project_id: string;
  version: number;
  product_name: string;
  summary: string;
  core_problem: string;
  value_prop: string;
  features: string[];
  target_users: string[];
  pricing_info?: string;
  raw_markdown?: string;
  status: AnalysisStatus;
  created_at: string;
}

export interface IcpProfile {
  id: string;
  project_id: string;
  name: string;
  mode: IcpMode;
  version: number;
  status: IcpStatus;
  criteria: {
    segment?: string;
    geography?: string;
    roles?: string[];
    company_size?: string;
    tech_stack?: string[];
    budget_level?: string;
  };
  disqualifiers: string[];
  signals: string[];
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface DiscoveryRun {
  id: string;
  project_id: string;
  icp_id?: string;
  mode: IcpMode;
  target_count: number;
  geography?: string;
  status: DiscoveryRunStatus;
  stats: {
    sources_searched: number;
    pages_fetched: number;
    prospects_found: number;
    failures: number;
  };
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface DiscoverySource {
  id: string;
  run_id: string;
  url: string;
  source_type: string;
  status: 'FETCHED' | 'FAILED' | 'FILTERED';
  extracted_text?: string;
  error_message?: string;
  created_at: string;
}

export interface Prospect {
  id: string;
  project_id: string;
  run_id?: string;
  type: ProspectType;
  name: string;
  canonical_url: string;
  headline?: string;
  industry?: string;
  geography?: string;
  total_score: number;
  score_breakdown: {
    problem_match: number;
    intent: number;
    recency: number;
    icp_fit: number;
  };
  why_fit: string;
  status: ProspectStatus;
  created_at: string;
}

export interface ProspectEvidence {
  id: string;
  prospect_id: string;
  source_url: string;
  observed_date?: string;
  evidence_type: EvidenceType;
  verbatim_quote: string;
  confidence: number;
  created_at: string;
}

export interface Contact {
  id: string;
  prospect_id: string;
  email?: string;
  email_status: EmailStatus;
  contact_link?: string;
  provider?: string;
  enriched_at?: string;
  created_at: string;
}

export interface EnrichmentRecord {
  id: string;
  contact_id: string;
  provider: EnrichmentProvider;
  status: EnrichmentStatus;
  raw_payload?: Record<string, unknown>;
  created_at: string;
}

export interface Campaign {
  id: string;
  project_id: string;
  name: string;
  objective: string;
  status: CampaignStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface CampaignProspect {
  id: string;
  campaign_id: string;
  prospect_id: string;
  personalized_subject: string;
  personalized_body: string;
  personalization_rationale?: string;
  status: CampaignProspectStatus;
  created_at: string;
}

export interface EmailMessage {
  id: string;
  campaign_prospect_id: string;
  provider_message_id?: string;
  from_email: string;
  to_email: string;
  status: EmailMessageStatus;
  sent_at: string;
}

export interface EmailEvent {
  id: string;
  message_id?: string;
  event_type: EmailEventType;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface SuppressionItem {
  id: string;
  workspace_id: string;
  email: string;
  reason: SuppressionReason;
  created_at: string;
}

export interface JobRun {
  id: string;
  workspace_id: string;
  type: string;
  status: JobStatus;
  attempts: number;
  payload: Record<string, unknown>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface ExportItem {
  id: string;
  project_id: string;
  user_id: string;
  format: ExportFormat;
  file_path: string;
  filter_params?: Record<string, unknown>;
  created_at: string;
}
