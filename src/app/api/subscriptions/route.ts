// app/api/subscriptions/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Subscription from '@/models/Subscription'

export async function GET() {
  try {
    await connectToDatabase()
    const subscriptions = await Subscription.find()
    return NextResponse.json(subscriptions)
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ message: 'Error fetching subscriptions', error: error.message }, { status: 500 })
  }
}
