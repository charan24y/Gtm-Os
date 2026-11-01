import { NextResponse } from 'next/server';
import { gtmDb } from '@/lib/db/store';
import { fetchPageContent } from '@/lib/tinyfish';
import { grokProvider } from '@/lib/providers/grok';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const project = await gtmDb.getProject(projectId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Extract website content via TinyFish
    const extraction = await fetchPageContent(project.product_url);
    const markdown = extraction.markdown || `Product discovered at ${project.product_url}`;

    // Generate structured product profile via Grok
    const grokProfile = await grokProvider.analyzeProduct(project.product_url, markdown);

    // Get previous version number
    const previous = await gtmDb.getLatestAnalysis(projectId);
    const nextVersion = (previous?.version || 0) + 1;

    // Persist to database
    const saved = await gtmDb.saveAnalysis({
      project_id: projectId,
      version: nextVersion,
      product_name: grokProfile.product_name || project.name,
      summary: grokProfile.summary,
      core_problem: grokProfile.core_problem,
      value_prop: grokProfile.value_prop,
      features: grokProfile.features,
      target_users: grokProfile.target_users,
      pricing_info: grokProfile.pricing_info,
      raw_markdown: markdown.slice(0, 10000),
      status: 'ACTIVE',
    });

    return NextResponse.json({
      analysis: saved,
      suggested_search_queries: grokProfile.suggested_search_queries,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const analysis = await gtmDb.getLatestAnalysis(projectId);
    if (!analysis) {
      return NextResponse.json({ error: 'No analysis found for this project.' }, { status: 404 });
    }
    return NextResponse.json({ analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
