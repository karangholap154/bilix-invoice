'use client';

import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Mail, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { InvoiceData, InvoiceItem } from '@/types/invoice';
import { CURRENCIES, getCurrencySymbol } from '@/types/invoice';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: (data: InvoiceData) => void;
}

export function InvoiceForm({ invoiceData, setInvoiceData }: InvoiceFormProps) {
  const router = useRouter();

  const updateField = (field: keyof InvoiceData, value: string) => {
    setInvoiceData({ ...invoiceData, [field]: value });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate item total
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    
    // Calculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + tax;
    
    setInvoiceData({
      ...invoiceData,
      items: newItems,
      subtotal,
      tax,
      total
    });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { name: '', quantity: 1, price: 0, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      const newItems = invoiceData.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * (invoiceData.taxRate / 100);
      const total = subtotal + tax;
      
      setInvoiceData({
        ...invoiceData,
        items: newItems,
        subtotal,
        tax,
        total
      });
    }
  };

  const handleGeneratePDF = () => {
    // Validate required fields
    if (!invoiceData.companyName.trim()) {
      alert('Please enter your company name');
      return;
    }
    if (!invoiceData.customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (invoiceData.items.some(item => !item.name.trim())) {
      alert('Please fill in all item names');
      return;
    }
    
    const encodedData = encodeURIComponent(JSON.stringify(invoiceData));
    router.push(`/invoice/preview?data=${encodedData}`);
  };

  const handleDirectPDFDownload = async () => {
    // Validate required fields
    if (!invoiceData.companyName.trim()) {
      alert('Please enter your company name');
      return;
    }
    if (!invoiceData.customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (invoiceData.items.some(item => !item.name.trim())) {
      alert('Please fill in all item names');
      return;
    }

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

  const handleEmailInvoice = () => {
    alert('Email functionality will be implemented with email service integration');
  };

  const updateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + tax;
    
    setInvoiceData({
      ...invoiceData,
      subtotal,
      tax,
      total
    });
  };

  const handleCurrencyChange = (currency: string) => {
    setInvoiceData({ ...invoiceData, currency });
  };

  const handleTaxRateChange = (taxRate: string) => {
    const rate = parseFloat(taxRate) || 0;
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (rate / 100);
    const total = subtotal + tax;
    
    setInvoiceData({
      ...invoiceData,
      taxRate: rate,
      tax,
      total
    });
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company / Your Name</Label>
            <Input
              id="companyName"
              value={invoiceData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="Enter your company name"
            />
          </div>
          <div>
            <Label htmlFor="companyAddress">Company Address</Label>
            <Textarea
              id="companyAddress"
              value={invoiceData.companyAddress}
              onChange={(e) => updateField('companyAddress', e.target.value)}
              placeholder="Enter your company address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={invoiceData.customerName}
              onChange={(e) => updateField('customerName', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <Label htmlFor="customerAddress">Customer Address</Label>
            <Textarea
              id="customerAddress"
              value={invoiceData.customerAddress}
              onChange={(e) => updateField('customerAddress', e.target.value)}
              placeholder="Enter customer address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
                placeholder="BILIX-2025-001"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={invoiceData.date}
                onChange={(e) => updateField('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={invoiceData.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={invoiceData.taxRate}
                onChange={(e) => handleTaxRateChange(e.target.value)}
                placeholder="10"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Items</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead className="w-24">Qty</TableHead>
                <TableHead className="w-32">Price</TableHead>
                <TableHead className="w-32">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Item description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {getCurrencySymbol(invoiceData.currency)}{item.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {invoiceData.items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{getCurrencySymbol(invoiceData.currency)}{invoiceData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({invoiceData.taxRate}%):</span>
              <span>{getCurrencySymbol(invoiceData.currency)}{invoiceData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{getCurrencySymbol(invoiceData.currency)}{invoiceData.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button onClick={handleGeneratePDF} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Preview & Download
        </Button>
        <Button onClick={handleDirectPDFDownload} variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={handleEmailInvoice}>
          <Mail className="h-4 w-4 mr-2" />
          Email Invoice
        </Button>
      </div>
    </div>
  );
}