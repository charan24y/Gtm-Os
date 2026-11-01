import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExportRow } from './csv';

export function generateProspectsPdf(
  projectName: string,
  productUrl: string,
  rows: ExportRow[]
): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  // Cover / Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 595, 80, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('GTM OS — Customer Discovery Dossier', 40, 42);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Project: ${projectName} (${productUrl}) | Generated: ${new Date().toISOString().split('T')[0]}`, 40, 62);

  // Summary Metrics Section
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Discovered & Qualified Prospects: ${rows.length}`, 40, 110);

  const tableData = rows.map((r, i) => {
    const p = r.prospect;
    const c = r.contact;
    const e = r.evidence?.[0];
    const contactInfo = c?.email ? `${c.email} (${c.email_status})` : 'No public email';
    const evidenceSnippet = e?.verbatim_quote
      ? `"${e.verbatim_quote.slice(0, 75)}..."`
      : 'Grounded web signal';

    return [
      `#${i + 1}`,
      p.name,
      p.type,
      `${p.total_score}/100`,
      contactInfo,
      evidenceSnippet,
    ];
  });

  autoTable(doc, {
    startY: 125,
    head: [['#', 'Prospect', 'Type', 'Score', 'Contact Info', 'Evidence Citation']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 6,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 95 },
      2: { cellWidth: 60 },
      3: { cellWidth: 45 },
      4: { cellWidth: 120 },
      5: { cellWidth: 170 },
    },
    margin: { left: 40, right: 40 },
  });

  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}
