// app/api/payhere/return/route.ts

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // You can parse query parameters if needed to fetch order details
  // For simplicity, we'll redirect to a success page

  return NextResponse.redirect('/subscription-success')
}
