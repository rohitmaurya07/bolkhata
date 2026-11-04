import PDFDocument from 'pdfkit';

/**
 * Generate CSV string from transactions
 */
export function generateCSV(transactions, user = {}) {
  const headers = ['Date', 'Type', 'Amount (INR)', 'Category', 'Payment Method', 'Status', 'Description', 'Source'];
  
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = transactions.map(t => {
    const dateStr = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
    return [
      escapeCsv(dateStr),
      escapeCsv(t.type ? t.type.toUpperCase() : 'EXPENSE'),
      escapeCsv(t.amount ? t.amount.toFixed(2) : '0.00'),
      escapeCsv(t.categoryName || t.category || 'Other'),
      escapeCsv(t.paymentMethod ? t.paymentMethod.toUpperCase() : 'CASH'),
      escapeCsv(t.status || 'completed'),
      escapeCsv(t.description || ''),
      escapeCsv(t.source || 'manual')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generate PDF document stream/buffer from transactions
 */
export function generatePDF(transactions, user = {}, summary = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Header
      doc.fillColor('#059669').fontSize(24).text('BolKhata', { bold: true });
      doc.fillColor('#4B5563').fontSize(11).text('Simple Voice-First Expense & Income Tracker');
      doc.moveDown(0.5);

      // User info & report date
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      const reportDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      doc.fontSize(10).fillColor('#1F2937');
      doc.text(`Account Holder: ${user.name || 'User'}`);
      doc.text(`Account ID: ${user.identifier || 'N/A'}`);
      doc.text(`Generated on: ${reportDate}`);
      doc.moveDown(1);

      // Financial Summary Box
      const totalExpense = summary.totalExpense || 0;
      const totalIncome = summary.totalIncome || 0;
      const netBalance = totalIncome - totalExpense;

      doc.rect(40, doc.y, 515, 65).fill('#F0FDF4');
      const boxY = doc.y + 12;

      doc.fillColor('#065F46').fontSize(11).text('FINANCIAL SUMMARY', 55, boxY, { bold: true });
      doc.fontSize(10);
      doc.fillColor('#047857').text(`Total Income: Rs. ${totalIncome.toLocaleString('en-IN')}`, 55, boxY + 18);
      doc.fillColor('#DC2626').text(`Total Expense: Rs. ${totalExpense.toLocaleString('en-IN')}`, 220, boxY + 18);
      doc.fillColor('#1E40AF').text(`Net Balance: Rs. ${netBalance.toLocaleString('en-IN')}`, 390, boxY + 18);
      doc.fillColor('#4B5563').text(`Total Transactions: ${transactions.length}`, 55, boxY + 34);

      doc.y = boxY + 60;
      doc.moveDown(1);

      // Table Header
      const tableTop = doc.y;
      doc.rect(40, tableTop, 515, 24).fill('#E5E7EB');
      doc.fillColor('#1F2937').fontSize(9).font('Helvetica-Bold');
      doc.text('Date', 50, tableTop + 7);
      doc.text('Type', 120, tableTop + 7);
      doc.text('Category', 180, tableTop + 7);
      doc.text('Mode', 280, tableTop + 7);
      doc.text('Description', 340, tableTop + 7);
      doc.text('Amount (Rs)', 470, tableTop + 7, { align: 'right', width: 75 });

      let currentY = tableTop + 24;
      doc.font('Helvetica');

      // Table Rows
      for (const t of transactions) {
        if (currentY > 750) {
          doc.addPage();
          currentY = 50;
        }

        const dateStr = t.date ? new Date(t.date).toLocaleDateString('en-IN') : '';
        const isExp = t.type === 'expense';

        doc.fillColor('#374151').fontSize(8.5);
        doc.text(dateStr, 50, currentY + 5);
        doc.fillColor(isExp ? '#DC2626' : '#059669').text(t.type ? t.type.toUpperCase() : 'EXP', 120, currentY + 5);
        doc.fillColor('#374151').text((t.categoryName || t.category || '').slice(0, 16), 180, currentY + 5);
        doc.text((t.paymentMethod || 'cash').toUpperCase(), 280, currentY + 5);
        doc.text((t.description || '-').slice(0, 22), 340, currentY + 5);
        doc.fillColor(isExp ? '#DC2626' : '#059669')
           .text(`${isExp ? '-' : '+'}${Number(t.amount).toLocaleString('en-IN')}`, 470, currentY + 5, { align: 'right', width: 75 });

        // Row border
        doc.strokeColor('#F3F4F6').lineWidth(0.5).moveTo(40, currentY + 20).lineTo(555, currentY + 20).stroke();
        currentY += 20;
      }

      // Footer
      doc.fontSize(8).fillColor('#9CA3AF').text(
        'BolKhata — Designed for simplicity and voice-first convenience.',
        40,
        780,
        { align: 'center', width: 515 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

