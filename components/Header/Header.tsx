'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        router.push('/login');
      }
    };

    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center relative">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <div className="space-x-4 flex items-center relative">
        <button className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <Bell className="w-4 h-4" />
          Notifikasi
        </button>

        {user && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 text-sm font-medium cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <span className="hidden sm:inline">{user.name}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
