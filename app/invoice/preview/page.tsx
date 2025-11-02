'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoicePreview } from '@/components/invoice-preview';
import { Download, Printer, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { InvoiceData } from '@/types/invoice';

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

  const handleDownloadPDF = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Invoice ${invoiceData?.invoiceNumber}`,
        text: `Invoice from ${invoiceData?.companyName}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Invoice link copied to clipboard!');
    }
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