// app/api/payhere/cancel/route.ts

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // You can parse query parameters if needed to handle cancellation details
  // For simplicity, we'll redirect to a cancellation page

  return NextResponse.redirect('/subscription-cancelled')
}
