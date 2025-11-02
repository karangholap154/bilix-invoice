import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Mail, Zap, Shield, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create Beautiful Invoices in{' '}
            <span className="text-blue-600">Seconds</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Bilix lets you generate, export & email invoices instantly. No signup required - start creating professional invoices right now.
          </p>
          <Link href="/invoice/new">
            <Button size="lg" className="px-8 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700">
              <FileText className="mr-2 h-5 w-5" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to invoice professionally
            </h2>
            <p className="text-lg text-gray-600">
              Simple, fast, and professional invoicing for freelancers and businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Generate Invoice</CardTitle>
                <CardDescription className="text-gray-600">
                  Create professional invoices in seconds with our intuitive form builder
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Download className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Download PDF</CardTitle>
                <CardDescription className="text-gray-600">
                  Export your invoices as high-quality PDFs ready for printing or sharing
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Email to Customer</CardTitle>
                <CardDescription className="text-gray-600">
                  Send invoices directly to your customers via email with one click
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                No signup required, but accounts save everything
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Start instantly</h4>
                    <p className="text-gray-600">Create invoices immediately without any signup process</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Save with account</h4>
                    <p className="text-gray-600">Optional account creation to save and manage all your invoices</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center">
                <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Ready to get started?</h4>
                <p className="text-gray-600 mb-6">Join thousands of professionals using Bilix</p>
                <Link href="/invoice/new">
                  <Button className="w-full">
                    Start Creating Invoices
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">Bilix</span>
          </div>
          <p className="text-sm text-gray-500">
            Professional invoice generation made simple. Create, export, and email invoices in seconds.
          </p>
        </div>
      </footer>
    </div>
  );
}