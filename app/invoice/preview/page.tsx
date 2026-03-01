'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoicePreview } from '@/components/invoice-preview';
import { Download, Printer, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { InvoiceData } from '@/types/invoice';
import { getCurrencySymbol } from '@/types/invoice';

export default function InvoicePreviewPage() {
  const searchParams = useSearchParams();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam));
        setInvoiceData(decoded);
      } catch (error) {
        console.error('Failed to parse invoice data:', error);
      }
    }
  }, [searchParams]);

  const handleDownloadPDF = async () => {
    if (!invoiceData) return;
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        const fontSize = options.fontSize || 10;
        const maxWidth = options.maxWidth || contentWidth;
        const align = options.align || 'left';
        
        pdf.setFontSize(fontSize);
        if (options.style) pdf.setFont('helvetica', options.style);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        if (align === 'center') {
          x = pageWidth / 2;
        } else if (align === 'right') {
          x = pageWidth - margin;
        }
        
        pdf.text(lines, x, y, { align });
        return y + (lines.length * fontSize * 0.35);
      };

      // Header
      pdf.setTextColor(37, 99, 235); // Blue color
      yPosition = addText('INVOICE', pageWidth / 2, yPosition, { 
        fontSize: 24, 
        style: 'bold', 
        align: 'center' 
      });
      
      pdf.setTextColor(0, 0, 0); // Reset to black
      yPosition = addText(invoiceData.invoiceNumber, pageWidth / 2, yPosition + 5, { 
        fontSize: 12, 
        style: 'bold', 
        align: 'center' 
      });
      
      yPosition = addText(invoiceData.date, pageWidth / 2, yPosition + 5, { 
        fontSize: 10, 
        align: 'center' 
      });

      yPosition += 15;

      // Company and Customer Info
      const leftColumnX = margin;
      const rightColumnX = pageWidth / 2 + 10;
      const startY = yPosition;

      // From section
      yPosition = addText('From:', leftColumnX, yPosition, { fontSize: 12, style: 'bold' });
      yPosition = addText(invoiceData.companyName || 'Your Company Name', leftColumnX, yPosition + 3, { 
        fontSize: 11, 
        style: 'bold',
        maxWidth: contentWidth / 2 - 10
      });
      yPosition = addText(invoiceData.companyAddress || 'Your Company Address', leftColumnX, yPosition + 3, { 
        fontSize: 10,
        maxWidth: contentWidth / 2 - 10
      });

      // To section
      let rightY = startY;
      rightY = addText('To:', rightColumnX, rightY, { fontSize: 12, style: 'bold' });
      rightY = addText(invoiceData.customerName || 'Customer Name', rightColumnX, rightY + 3, { 
        fontSize: 11, 
        style: 'bold',
        maxWidth: contentWidth / 2 - 10
      });
      rightY = addText(invoiceData.customerAddress || 'Customer Address', rightColumnX, rightY + 3, { 
        fontSize: 10,
        maxWidth: contentWidth / 2 - 10
      });

      yPosition = Math.max(yPosition, rightY) + 15;

      // Items table
      const tableStartY = yPosition;
      const colWidths = [contentWidth * 0.5, contentWidth * 0.15, contentWidth * 0.175, contentWidth * 0.175];
      const colPositions = [
        margin,
        margin + colWidths[0],
        margin + colWidths[0] + colWidths[1],
        margin + colWidths[0] + colWidths[1] + colWidths[2]
      ];

      // Table header
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description', colPositions[0] + 2, yPosition + 5);
      pdf.text('Qty', colPositions[1] + 2, yPosition + 5, { align: 'center' });
      pdf.text('Price', colPositions[2] + colWidths[2] - 2, yPosition + 5, { align: 'right' });
      pdf.text('Total', colPositions[3] + colWidths[3] - 2, yPosition + 5, { align: 'right' });
      
      yPosition += 8;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      invoiceData.items.forEach((item, index) => {
        const rowHeight = 8;
        
        // Alternate row background
        if (index % 2 === 1) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPosition, contentWidth, rowHeight, 'F');
        }
        
        pdf.text(item.name || 'Item description', colPositions[0] + 2, yPosition + 5);
        pdf.text(item.quantity.toString(), colPositions[1] + colWidths[1] / 2, yPosition + 5, { align: 'center' });
        pdf.text(`${getCurrencySymbol(invoiceData.currency)}${item.price.toFixed(2)}`, colPositions[2] + colWidths[2] - 2, yPosition + 5, { align: 'right' });
        pdf.text(`${getCurrencySymbol(invoiceData.currency)}${item.total.toFixed(2)}`, colPositions[3] + colWidths[3] - 2, yPosition + 5, { align: 'right' });
        
        yPosition += rowHeight;
      });

      yPosition += 10;

      // Totals
      const totalsX = pageWidth - margin - 60;
      const totalsWidth = 60;
      
      pdf.setFontSize(10);
      pdf.text('Subtotal:', totalsX - 5, yPosition, { align: 'right' });
      pdf.text(`${getCurrencySymbol(invoiceData.currency)}${invoiceData.subtotal.toFixed(2)}`, totalsX + totalsWidth - 5, yPosition, { align: 'right' });
      
      yPosition += 6;
      pdf.text(`Tax (${invoiceData.taxRate}%):`, totalsX - 5, yPosition, { align: 'right' });
      pdf.text(`${getCurrencySymbol(invoiceData.currency)}${invoiceData.tax.toFixed(2)}`, totalsX + totalsWidth - 5, yPosition, { align: 'right' });
      
      yPosition += 8;
      pdf.setDrawColor(0, 0, 0);
      pdf.line(totalsX - 5, yPosition - 2, totalsX + totalsWidth - 5, yPosition - 2);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total:', totalsX - 5, yPosition + 2, { align: 'right' });
      pdf.text(`${getCurrencySymbol(invoiceData.currency)}${invoiceData.total.toFixed(2)}`, totalsX + totalsWidth - 5, yPosition + 2, { align: 'right' });

      // Footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(156, 163, 175);
      pdf.text('Generated with Bilix - Professional Invoice Generator', pageWidth / 2, pageHeight - 15, { align: 'center' });

      // Save the PDF
      pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShare = () => {
    // Share functionality
  };

  const handlePrint = () => {
    window.print();
  };

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">No invoice data found</p>
            <Link href="/invoice/new">
              <Button>Create New Invoice</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link href="/invoice/new">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8">
            <InvoicePreview invoiceData={invoiceData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}