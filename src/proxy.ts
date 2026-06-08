import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = request.nextUrl.pathname === '/login';

  let isAuthenticated = false;
  if (token) {
    const payload = await verifyToken(token);
    if (payload) isAuthenticated = true;
  }

  // Protect /dashboard and /api routes (except maybe public APIs if any, but none specified, all are protected)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/api/links') || 
                           request.nextUrl.pathname.startsWith('/api/analytics');

  if (!isAuthenticated && isProtectedRoute) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/api/links/:path*', '/api/analytics/:path*'],
};
