import { NextResponse } from 'next/server';
import { gtmDb } from '@/lib/db/store';
import { validateSafeUrl } from '@/lib/security/ssrf';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws-default-1';
    const userId = searchParams.get('userId') || 'usr-founder-1';

    // RLS Workspace Isolation Check
    const hasAccess = await gtmDb.verifyWorkspaceAccess(workspaceId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this workspace.' },
        { status: 403 }
      );
    }

    const projects = await gtmDb.listProjects(workspaceId);
    return NextResponse.json({ projects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId = 'ws-default-1', userId = 'usr-founder-1', name, productUrl } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
    }

    // SSRF validation on target URL
    const safeCheck = validateSafeUrl(productUrl);
    if (!safeCheck.valid || !safeCheck.normalizedUrl) {
      return NextResponse.json({ error: safeCheck.error || 'Invalid or prohibited product URL.' }, { status: 400 });
    }

    // RLS Workspace Isolation Check
    const hasAccess = await gtmDb.verifyWorkspaceAccess(workspaceId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this workspace.' },
        { status: 403 }
      );
    }

    const project = await gtmDb.createProject(workspaceId, name, safeCheck.normalizedUrl);

    // Audit log
    await gtmDb.recordAudit({
      workspace_id: workspaceId,
      user_id: userId,
      action: 'PROJECT_CREATED',
      resource_type: 'PROJECT',
      resource_id: project.id,
      details: { name, product_url: safeCheck.normalizedUrl },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
