import { Prospect, Contact, ProspectEvidence } from '../db/types';

export interface ExportRow {
  prospect: Prospect;
  contact?: Contact | null;
  evidence?: ProspectEvidence[];
}

export function generateProspectsCsv(rows: ExportRow[]): string {
  const headers = [
    'Name',
    'Type',
    'Canonical URL',
    'Total Score',
    'Problem Match',
    'Intent Score',
    'Recency Score',
    'ICP Fit Score',
    'Qualification Reason',
    'Contact Email',
    'Email Status',
    'Contact Provider',
    'Primary Evidence Quote',
    'Evidence Source URL',
    'Created At',
  ];

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvLines = [headers.join(',')];

  for (const row of rows) {
    const p = row.prospect;
    const c = row.contact;
    const e = row.evidence?.[0];

    const line = [
      escapeCell(p.name),
      escapeCell(p.type),
      escapeCell(p.canonical_url),
      escapeCell(p.total_score),
      escapeCell(p.score_breakdown?.problem_match ?? 0),
      escapeCell(p.score_breakdown?.intent ?? 0),
      escapeCell(p.score_breakdown?.recency ?? 0),
      escapeCell(p.score_breakdown?.icp_fit ?? 0),
      escapeCell(p.why_fit),
      escapeCell(c?.email || 'N/A'),
      escapeCell(c?.email_status || 'UNKNOWN'),
      escapeCell(c?.provider || 'None'),
      escapeCell(e?.verbatim_quote || 'N/A'),
      escapeCell(e?.source_url || 'N/A'),
      escapeCell(p.created_at),
    ];

    csvLines.push(line.join(','));
  }

  // Prepend UTF-8 BOM so Excel and spreadsheet apps render accents and characters correctly
  return '\uFEFF' + csvLines.join('\r\n');
}
