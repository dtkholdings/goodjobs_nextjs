// app/api/orders/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Subscription from '@/models/Subscription'
import Order from '@/models/Order'
import Company from '@/models/Company'
import { PAYHERE } from '@/configs/payhere'
// import { createOrderSchema } from '@/validation/orderValidation' // If using Yup for validation
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subscriptionId, companyId } = body

    // Validate inputs using a validation schema (e.g., Yup)
    // await createOrderSchema.validate(body)

    // Check if both subscriptionId and companyId are provided
    if (!subscriptionId || !companyId) {
      return NextResponse.json({ message: 'subscriptionId and companyId are required' }, { status: 400 })
    }

    await connectToDatabase()

    // Fetch the subscription and company from the database
    const subscription = await Subscription.findById(subscriptionId)
    const company = await Company.findById(companyId)

    if (!subscription || !company) {
      return NextResponse.json({ message: 'Subscription or Company not found' }, { status: 404 })
    }

    // Create a new order with status 'pending'
    const order = new Order({
      company: company._id,
      subscription: subscription._id,
      amount: subscription.price,
      currency: subscription.currency,
      credits: subscription.credits,
      ai_credits: subscription.ai_credits
      // status is 'pending' by default
    })

    await order.save()

    // Step 1: Generate MD5 hash of the merchant_secret and convert to uppercase
    const merchantSecretHash = crypto.createHash('md5').update(PAYHERE.secret).digest('hex').toUpperCase()

    // Step 2: Concatenate the required fields
    const hashString =
      PAYHERE.merchant_id + order.id.toString() + order.amount.toFixed(2) + PAYHERE.currency + merchantSecretHash

    // Step 3: Generate the final hash
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase()

    // Prepare PayHere.lk payment data with the generated hash
    const payhereData = {
      sandbox: true, // Set to false in production
      merchant_id: PAYHERE.merchant_id,
      return_url: PAYHERE.return_url,
      cancel_url: PAYHERE.cancel_url,
      notify_url: PAYHERE.notify_url,
      order_id: order.id.toString(),
      items: subscription.subscription_plan_name,
      amount: order.amount.toFixed(2), // Ensure two decimal places
      currency: PAYHERE.currency,
      hash: hash, // Generated hash
      first_name: company.company_name,
      last_name: '',
      email: company.inquiry_email || '',
      phone: company.general_phone_number || '',
      address: company.address || '',
      city: company.city || 'city',
      country: company.country || 'sri lanka',
      custom_1: subscription.credits,
      custom_2: subscription.ai_credits
      // Add more fields if necessary
    }

    // Return the payment data to the frontend
    return NextResponse.json({ payhereData }, { status: 200 })
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      // Handle validation errors (e.g., from Yup)
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error('Error creating order:', error)
    return NextResponse.json({ message: 'Error creating order', error: error.message }, { status: 500 })
  }
}
