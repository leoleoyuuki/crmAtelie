import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exports data to a CSV file.
 * Adds BOM to ensure Excel opens it correctly with accents.
 */
export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports data to a PDF file using a table format.
 */
export function exportToPDF(headers: string[], body: any[][], filename: string, title?: string) {
  const doc = new jsPDF();
  
  if (title) {
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
  }

  autoTable(doc, {
    head: [headers],
    body: body,
    startY: title ? 35 : 20,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
        fillColor: [190, 80, 48], // A warm brown/terracotta to match the brand
        textColor: [255, 255, 255],
        fontStyle: 'bold'
    },
    alternateRowStyles: {
        fillColor: [245, 245, 245]
    },
    margin: { top: 20 },
  });

  doc.save(`${filename}.pdf`);
}
