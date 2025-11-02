'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, LogIn, UserPlus } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Bilix</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/invoice/new">
              <Button variant="ghost">Create Invoice</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}