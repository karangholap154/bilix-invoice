'use client';

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
    const encodedData = encodeURIComponent(JSON.stringify(invoiceData));
    router.push(`/invoice/preview?data=${encodedData}`);
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
          Generate PDF
        </Button>
        <Button variant="outline" onClick={handleEmailInvoice} className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          Email Invoice
        </Button>
      </div>
    </div>
  );
}