import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// export function exportTableToPDF(title: string, head: string[], body: (string | number)[][], subtitle?: string) {
//   const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//   const pageWidth = doc.internal.pageSize.getWidth();

//   doc.setFontSize(18);
//   doc.setTextColor(15, 23, 42);
//   doc.text(title, 40, 40);

//   doc.setFontSize(10);
//   doc.setTextColor(100, 116, 139);
//   doc.text(subtitle || 'Generated on ' + new Date().toLocaleString(), 40, 58);

//   doc.setDrawColor(226, 232, 240);
//   doc.line(40, 66, pageWidth - 40, 66);

//   autoTable(doc, {
//     head: [head],
//     body,
//     startY: 78,
//     styles: { fontSize: 9, cellPadding: 6 },
//     headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
//     alternateRowStyles: { fillColor: [244, 246, 251] },
//     margin: { left: 40, right: 40 },
//   });

//   doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
// }

export function printDocument(title: string, content: string) {
  const win = window.open('', '_blank', 'width=900,height=650');
  if (!win) return;
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 32px; color: #0f172a; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      p.sub { color: #64748b; margin-top: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
      th { background: #2563eb; color: #fff; text-align: left; padding: 8px 10px; }
      td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; }
      tr:nth-child(even) td { background: #f4f6fb; }
    </style></head><body>${content}</body></html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}


export function exportTableToPDF(
  title: string,
  head: string[],
  body: (string | number)[][],
  subtitle?: string,
  summary?: { label: string; value: string }[]
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    subtitle || 'Generated on ' + new Date().toLocaleString(),
    40,
    58
  );

  doc.setDrawColor(226, 232, 240);
  doc.line(40, 66, pageWidth - 40, 66);

  autoTable(doc, {
    head: [head],
    body,
    startY: 78,
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [244, 246, 251],
    },
    margin: {
      left: 40,
      right: 40,
    },
  });

  // Summary below products table
  if (summary?.length) {
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    let y = finalY;

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    summary.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, pageWidth - 180, y);

      doc.setFont('helvetica', 'normal');
      doc.text(item.value, pageWidth - 40, y, {
        align: 'right',
      });

      y += 18;
    });
  }

  doc.save(
    `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`
  );
}