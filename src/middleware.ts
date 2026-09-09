import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple base64 decoding for edge runtime (where standard Buffer is not available)
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that do not require auth
  const isPublicPath = path === '/login' || path === '/signup' || path === '/'

  // Extract token
  const token = request.cookies.get('studenthub_access_token')?.value || request.cookies.get('sb-access-token')?.value
  
  let role = 'STUDENT'; // default fallback for unauthenticated edge cases in UI
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && payload.role) {
      role = (payload.role as string).toUpperCase();
    }
  }

  // Redirect to login if accessing protected routes without token (in production)
  if (!isPublicPath && !token && (path.startsWith('/dashboard') || path.startsWith('/admin'))) {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Route Guard Logic based on IAM Phase 5 Specs
  const isAuthorized = (): boolean => {
    // Platform/Super Admins have access to everything
    if (['PLATFORM_ADMIN', 'SUPER_ADMIN'].includes(role)) return true;

    if (path.startsWith('/admin')) {
      // Allow Verification Officer access to Verification subset of Admin
      if (path.startsWith('/admin/verification') && role === 'VERIFICATION_OFFICER') return true;
      // Allow College Admin access to Students subset of Admin
      if (path.startsWith('/admin/students') && role === 'COLLEGE_ADMIN') return true;
      
      return false; // Deny standard students/recruiters
    }

    if (path.startsWith('/dashboard/recruiter') || path.startsWith('/recruiter') || path.startsWith('/company')) {
      return ['RECRUITER', 'COMPANY_ADMIN'].includes(role);
    }
    
    if (path.startsWith('/verification')) {
      return role === 'VERIFICATION_OFFICER';
    }

    if (path.startsWith('/college')) {
      return role === 'COLLEGE_ADMIN';
    }

    // Default /dashboard and /student paths are allowed for STUDENT role. 
    // Technically, Admins and Recruiters can visit /dashboard as well if they want a student view,
    // but typically we'd restrict it to STUDENT for isolation.
    if (path.startsWith('/dashboard') && !path.startsWith('/dashboard/recruiter')) {
      return role === 'STUDENT';
    }

    return true; // Unmatched paths fall through
  }

  if (token && !isAuthorized()) {
    return NextResponse.rewrite(new URL('/unauthorized', request.url))
  }

  // Avoid redirect loops if already authenticated
  if (isPublicPath && token) {
    if (['PLATFORM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (['RECRUITER', 'COMPANY_ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard/recruiter', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|favicon).*)',
  ],
}
