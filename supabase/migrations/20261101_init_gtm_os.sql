-- =============================================================================
-- GTM OS — FULL RELATIONAL SCHEMA & ROW LEVEL SECURITY (RLS) MIGRATION
-- =============================================================================

-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. WORKSPACE MEMBERS (RBAC: OWNER, ADMIN, MEMBER)
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(workspace_id, user_id)
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    product_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCT ANALYSES (Versioned)
CREATE TABLE IF NOT EXISTS product_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    product_name TEXT NOT NULL,
    summary TEXT NOT NULL,
    core_problem TEXT NOT NULL,
    value_prop TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_users JSONB NOT NULL DEFAULT '[]'::jsonb,
    pricing_info TEXT,
    raw_markdown TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(project_id, version)
);

-- 5. ICP PROFILES (Versioned & Approved)
CREATE TABLE IF NOT EXISTS icp_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('INDIVIDUAL', 'COMPANY', 'BOTH')),
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'ARCHIVED')),
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    disqualifiers JSONB NOT NULL DEFAULT '[]'::jsonb,
    signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. DISCOVERY RUNS
CREATE TABLE IF NOT EXISTS discovery_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    icp_id UUID REFERENCES icp_profiles(id) ON DELETE SET NULL,
    mode TEXT NOT NULL CHECK (mode IN ('INDIVIDUAL', 'COMPANY', 'BOTH')),
    target_count INTEGER NOT NULL DEFAULT 10,
    geography TEXT,
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    stats JSONB NOT NULL DEFAULT '{"sources_searched": 0, "pages_fetched": 0, "prospects_found": 0, "failures": 0}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- 7. DISCOVERY SOURCES
CREATE TABLE IF NOT EXISTS discovery_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES discovery_runs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    source_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('FETCHED', 'FAILED', 'FILTERED')),
    extracted_text TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PROSPECTS
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    run_id UUID REFERENCES discovery_runs(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('INDIVIDUAL', 'COMPANY')),
    name TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    headline TEXT,
    industry TEXT,
    geography TEXT,
    total_score INTEGER NOT NULL DEFAULT 0,
    score_breakdown JSONB NOT NULL DEFAULT '{"problem_match": 0, "intent": 0, "recency": 0, "icp_fit": 0}'::jsonb,
    why_fit TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'QUALIFIED' CHECK (status IN ('QUALIFIED', 'DISQUALIFIED', 'CONTACTED', 'CONVERTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. PROSPECT EVIDENCE
CREATE TABLE IF NOT EXISTS prospect_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    observed_date TIMESTAMPTZ,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('COMPLAINT', 'TOOL_REQUEST', 'ALTERNATIVE_SEARCH', 'HIRING', 'CHANNEL_GAP', 'PUBLIC_POST')),
    verbatim_quote TEXT NOT NULL,
    confidence NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    email TEXT,
    email_status TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (email_status IN ('UNKNOWN', 'NOT_FOUND', 'UNVERIFIED', 'VALID', 'INVALID', 'RISKY', 'OPTED_OUT')),
    contact_link TEXT,
    provider TEXT,
    enriched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. ENRICHMENT RECORDS
CREATE TABLE IF NOT EXISTS enrichment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('APOLLO', 'HUNTER')),
    status TEXT NOT NULL CHECK (status IN ('MATCH', 'NO_MATCH', 'ERROR', 'RATE_LIMITED')),
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    objective TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'RUNNING', 'COMPLETED', 'PAUSED')),
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. CAMPAIGN PROSPECTS (Drafts & Approval)
CREATE TABLE IF NOT EXISTS campaign_prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    personalized_subject TEXT NOT NULL,
    personalized_body TEXT NOT NULL,
    personalization_rationale TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(campaign_id, prospect_id)
);

-- 14. EMAIL MESSAGES (Resend Outbound Tracking)
CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_prospect_id UUID NOT NULL REFERENCES campaign_prospects(id) ON DELETE CASCADE,
    provider_message_id TEXT,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DISPATCHED' CHECK (status IN ('DISPATCHED', 'DELIVERED', 'BOUNCED', 'COMPLAINED')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. EMAIL EVENTS (Resend Webhook Log)
CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES email_messages(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('DELIVERED', 'BOUNCED', 'COMPLAINED', 'OPENED', 'CLICKED', 'REPLIED')),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. SUPPRESSION LIST
CREATE TABLE IF NOT EXISTS suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('UNSUBSCRIBE', 'HARD_BOUNCE', 'SPAM_COMPLAINT', 'MANUAL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(workspace_id, email)
);

-- 17. DURABLE JOB RUNS
CREATE TABLE IF NOT EXISTS job_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    attempts INTEGER NOT NULL DEFAULT 0,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. EXPORTS
CREATE TABLE IF NOT EXISTS exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('CSV', 'PDF')),
    file_path TEXT NOT NULL,
    filter_params JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_prospects_project ON prospects(project_id);
CREATE INDEX IF NOT EXISTS idx_prospects_run ON prospects(run_id);
CREATE INDEX IF NOT EXISTS idx_prospect_evidence_prospect ON prospect_evidence(prospect_id);
CREATE INDEX IF NOT EXISTS idx_contacts_prospect ON contacts(prospect_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_campaign_prospects_campaign ON campaign_prospects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON email_messages(status);
CREATE INDEX IF NOT EXISTS idx_suppression_email ON suppression_list(workspace_id, email);
CREATE INDEX IF NOT EXISTS idx_job_runs_status ON job_runs(status);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE icp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Helper check function for RLS
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Workspaces Policies
CREATE POLICY "Users can view workspaces they belong to"
    ON workspaces FOR SELECT
    USING (is_workspace_member(id) OR owner_id = auth.uid());

CREATE POLICY "Owners can update their workspaces"
    ON workspaces FOR UPDATE
    USING (owner_id = auth.uid());

-- Workspace Members Policies
CREATE POLICY "Members can view membership in their workspace"
    ON workspace_members FOR SELECT
    USING (is_workspace_member(workspace_id));

-- Projects Policies
CREATE POLICY "Members can access projects in their workspace"
    ON projects FOR ALL
    USING (is_workspace_member(workspace_id));

-- Prospects Policies
CREATE POLICY "Members can access prospects in their projects"
    ON prospects FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = prospects.project_id
          AND is_workspace_member(projects.workspace_id)
    ));

-- Prospect Evidence Policies
CREATE POLICY "Members can access evidence for their prospects"
    ON prospect_evidence FOR ALL
    USING (EXISTS (
        SELECT 1 FROM prospects
        JOIN projects ON projects.id = prospects.project_id
        WHERE prospects.id = prospect_evidence.prospect_id
          AND is_workspace_member(projects.workspace_id)
    ));

-- Campaigns Policies
CREATE POLICY "Members can access campaigns in their projects"
    ON campaigns FOR ALL
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = campaigns.project_id
          AND is_workspace_member(projects.workspace_id)
    ));

-- Suppression List Policies
CREATE POLICY "Members can view suppression list in their workspace"
    ON suppression_list FOR ALL
    USING (is_workspace_member(workspace_id));
