import { Separator } from '@/components/ui/separator';
import type { InvoiceData } from '@/types/invoice';
import { getCurrencySymbol } from '@/types/invoice';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

export function InvoicePreview({ invoiceData }: InvoicePreviewProps) {
  return (
    <div className="invoice-preview space-y-8 text-sm">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">INVOICE</h1>
        <div className="text-gray-600">
          <p className="font-medium">{invoiceData.invoiceNumber}</p>
          <p>{invoiceData.date}</p>
        </div>
      </div>

      {/* Company & Customer Info */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
          <div className="text-gray-700 whitespace-pre-line">
            <p className="font-medium">{invoiceData.companyName || 'Your Company Name'}</p>
            <p>{invoiceData.companyAddress || 'Your Company Address'}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">To:</h3>
          <div className="text-gray-700 whitespace-pre-line">
            <p className="font-medium">{invoiceData.customerName || 'Customer Name'}</p>
            <p>{invoiceData.customerAddress || 'Customer Address'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Items Table */}
      <div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Description</th>
              <th className="text-center py-2 w-20">Qty</th>
              <th className="text-right py-2 w-24">Price</th>
              <th className="text-right py-2 w-24">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">{item.name || 'Item description'}</td>
                <td className="text-center py-3">{item.quantity}</td>
                <td className="text-right py-3">{getCurrencySymbol(invoiceData.currency)}{item.price.toFixed(2)}</td>
                <td className="text-right py-3">{getCurrencySymbol(invoiceData.currency)}{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{getCurrencySymbol(invoiceData.currency)}{invoiceData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({invoiceData.taxRate}%):</span>
            <span>{getCurrencySymbol(invoiceData.currency)}{invoiceData.tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{getCurrencySymbol(invoiceData.currency)}{invoiceData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs pt-8 border-t">
        <p>Generated with Bilix - Professional Invoice Generator</p>
      </div>
    </div>
  );
}