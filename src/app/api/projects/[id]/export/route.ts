import { NextResponse } from 'next/server';
import { gtmDb } from '@/lib/db/store';
import { generateProspectsCsv } from '@/lib/export/csv';
import { generateProspectsPdf } from '@/lib/export/pdf';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'CSV').toUpperCase() as 'CSV' | 'PDF';
    const type = searchParams.get('type') || undefined;
    const minScore = searchParams.get('minScore') ? Number(searchParams.get('minScore')) : undefined;
    const userId = searchParams.get('userId') || 'usr-founder-1';

    const project = await gtmDb.getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const prospects = await gtmDb.listProspects(projectId, { type, minScore });

    const rows = await Promise.all(
      prospects.map(async (p) => {
        const evidence = await gtmDb.listEvidenceForProspect(p.id);
        const contact = await gtmDb.getContact(p.id);
        return {
          prospect: p,
          evidence,
          contact,
        };
      })
    );

    // Record the export in the database
    const exportRecord = await gtmDb.recordExport({
      project_id: projectId,
      user_id: userId,
      format,
      file_path: `/exports/${projectId}_${Date.now()}.${format.toLowerCase()}`,
      filter_params: { type, minScore, count: rows.length },
    });

    if (format === 'PDF') {
      const pdfBytes = generateProspectsPdf(
        project.name,
        project.product_url,
        rows
      );
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="gtm_os_${project.name.toLowerCase()}_prospects.pdf"`,
          'X-Export-ID': exportRecord.id,
        },
      });
    }

    // Default: CSV
    const csvContent = generateProspectsCsv(rows);
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="gtm_os_${project.name.toLowerCase()}_prospects.csv"`,
        'X-Export-ID': exportRecord.id,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
