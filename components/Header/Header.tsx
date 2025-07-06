'use client';

import { Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <div className="space-x-4 flex items-center">
        <button className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <Bell className="w-4 h-4" />
          Notifikasi
        </button>
        <button className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <User className="w-4 h-4" />
          Profil
        </button>
      </div>
    </header>
  );
}
