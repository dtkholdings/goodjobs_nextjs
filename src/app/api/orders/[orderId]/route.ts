// src/app/api/orders/[orderId]/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Order from '@/models/Order'

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID is required.' }, { status: 400 })
  }

  try {
    await connectToDatabase()

    const order = await Order.findById(orderId).populate('subscription').populate('company')

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 })
    }

    return NextResponse.json(
      {
        order_id: order.id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        subscription: order.subscription,
        company: order.company,
        payhere_order_id: order.payhere_order_id,
        payhere_transaction_id: order.payhere_transaction_id
        // Include other relevant fields
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 })
  }
}
