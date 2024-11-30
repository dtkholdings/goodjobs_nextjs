// Path: src/middleware.ts

import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// Define public routes to exclude from middleware
const publicRoutes = [
  '/login',
  '/register',
  '/password-reset',
  '/forgot-password',
  '/company',
  '/company/*'

  // Add other public routes here
]

// Define protected routes that require authentication and email verification
const protectedRoutes = [
  '/',
  '/dashboard',
  '/dashboard/company',
  '/dashboard/company/*' // Include all company-related routes
  // Add other protected routes as needed
]

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const url = req.nextUrl.clone()
  const pathname = req.nextUrl.pathname

  // Allow public routes to proceed without checks
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // If user is not authenticated, redirect to login for protected routes
  if (!token) {
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    // For non-protected routes, allow access
    return NextResponse.next()
  }

  // If user is authenticated but email is not verified, redirect to verify-email
  if (!token.emailVerified && pathname !== '/verify-email') {
    return NextResponse.redirect(new URL('/verify-email', req.url))
  }

  // Allow access to protected routes and verify-email
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
      Apply middleware to all routes except:
      - API routes
      - Static files
      - Public routes: /login, /register, /forgot-password
      - favicon.ico
    */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password).*)',
    '/verify-email'
  ]
}
