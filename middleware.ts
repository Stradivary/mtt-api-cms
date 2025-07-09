import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';
import { parse } from 'cookie';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieHeader = req.headers.get('cookie') || '';
  const { token } = parse(cookieHeader);

  if (pathname === '/login' && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL('/dashboard/news', req.url));
    } catch {}
  }

  const protectedPath = pathname === '/' || pathname.startsWith('/dashboard');
  if (protectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      await verifyToken(token);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};
