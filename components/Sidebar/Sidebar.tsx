'use client';

import Link from 'next/link';
import { LayoutDashboard, Newspaper } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="h-full w-85 bg-gray-900 min-h-screen text-white p-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
          <img
            src="/images/logo.png"
            alt="Logo MTT"
            className="w-full h-full object-cover object-center aspect-square"
          />
        </div>
        <h2 className="text-lg font-semibold">MTT CMS</h2>
      </div>
      <nav className="flex flex-col space-y-4 mt-2">
        <Link href="/dashboard" className="hover:text-indigo-300 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" />
          Dashboard
        </Link>
        <Link href="/dashboard/news" className="hover:text-indigo-300 flex items-center gap-2">
          <Newspaper className="w-6 h-6" />
          Berita
        </Link>
        <Link href="/dashboard/daily-dakwah" className="hover:text-indigo-300 flex items-center gap-2">
          <Newspaper className="w-6 h-6" />
          Dakwah Harian
        </Link>
        <Link href="/dashboard/proposal" className="hover:text-indigo-300 flex items-center gap-2">
          <Newspaper className="w-6 h-6" />
          Proposal
        </Link>
      </nav>
    </aside>
  );
}
