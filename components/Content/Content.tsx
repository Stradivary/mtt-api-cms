'use client';

export default function Content({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-gray-100 min-h-screen p-6 rounded-md">
      {children}
    </main>
  );
}
