'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceForm } from '@/components/invoice-form';
import { InvoicePreview } from '@/components/invoice-preview';
import type { InvoiceData } from '@/types/invoice';

export default function NewInvoice() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `BILIX-2025-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
    taxRate: 10,
    companyName: '',
    companyAddress: '',
    customerName: '',
    customerAddress: '',
    items: [
      { name: '', quantity: 1, price: 0, total: 0 }
    ],
    subtotal: 0,
    tax: 0,
    total: 0
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
          <p className="text-gray-600 mt-2">Fill in the details below to generate your professional invoice</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <InvoiceForm 
              invoiceData={invoiceData} 
              setInvoiceData={setInvoiceData} 
            />
          </div>
          
          {/* Preview Section */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoicePreview invoiceData={invoiceData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}