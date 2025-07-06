'use client';

export default function Footer() {
  return (
    <footer className="bg-white text-center text-sm py-3 border-t">
      © {new Date().getFullYear()} MTT CMS. All rights reserved.
    </footer>
  );
}
