'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((seg) => seg);

  const breadcrumbs = [
    { name: 'Beranda', href: '/' },
    ...pathSegments.map((seg, idx) => {
      const href = '/' + pathSegments.slice(0, idx + 1).join('/');
      const name = decodeURIComponent(seg.charAt(0).toUpperCase() + seg.slice(1));
      return { name, href };
    }),
  ];

  return (
    <nav className="text-sm text-gray-500 my-4 px-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center">
            <Link
              href={crumb.href}
              className={`hover:text-indigo-500 ${
                i === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''
              }`}
            >
              {crumb.name}
            </Link>
            {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
