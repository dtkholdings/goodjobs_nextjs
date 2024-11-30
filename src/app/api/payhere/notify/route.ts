// src/app/api/payhere/notify/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Order from '@/models/Order'
import Company from '@/models/Company'
import { PAYHERE } from '@/configs/payhere'
import crypto from 'crypto'
import logger from '@/libs/logger'

// Define an interface for the expected form data
interface PayHereNotification {
  merchant_id: string
  order_id: string
  payment_id: string
  payhere_amount: string
  payhere_currency: string
  status_code: string
  md5sig: string
  custom_1?: string
  custom_2?: string
  method?: string
  status_message?: string
  card_holder_name?: string
  card_no?: string
  card_expiry?: string
  // Add other fields as necessary
}

export async function POST(request: Request) {
  try {
    // Ensure the request has the correct Content-Type
    const contentType = request.headers.get('Content-Type') || ''
    if (!contentType.includes('application/x-www-form-urlencoded')) {
      logger.warn('Invalid Content-Type:', contentType)
      return new Response('Unsupported Media Type', { status: 415, headers: { 'Content-Type': 'text/plain' } })
    }

    // Parse form data
    const formData = await request.formData()
    const bodyEntries = Object.fromEntries(formData.entries())

    // Type assertion: Ensure all expected fields are strings
    // Use a helper function to safely extract string values
    const getString = (value: FormDataEntryValue | null | undefined): string | undefined => {
      if (typeof value === 'string') {
        return value
      }
      return undefined
    }

    // Extract and validate fields
    const notification: PayHereNotification = {
      merchant_id: getString(bodyEntries.merchant_id) || '',
      order_id: getString(bodyEntries.order_id) || '',
      payment_id: getString(bodyEntries.payment_id) || '',
      payhere_amount: getString(bodyEntries.payhere_amount) || '',
      payhere_currency: getString(bodyEntries.payhere_currency) || '',
      status_code: getString(bodyEntries.status_code) || '',
      md5sig: getString(bodyEntries.md5sig) || '',
      custom_1: getString(bodyEntries.custom_1),
      custom_2: getString(bodyEntries.custom_2),
      method: getString(bodyEntries.method),
      status_message: getString(bodyEntries.status_message),
      card_holder_name: getString(bodyEntries.card_holder_name) || '',
      card_no: getString(bodyEntries.card_no) || '',
      card_expiry: getString(bodyEntries.card_expiry) || ''
      // Add other fields as necessary
    }

    logger.info('Received PayHere notification: %o', notification)

    // Step 1: Verify merchant_id
    if (notification.merchant_id !== PAYHERE.merchant_id) {
      logger.warn('Invalid Merchant ID: %s', notification.merchant_id)
      return new Response('Invalid Merchant ID', { status: 400, headers: { 'Content-Type': 'text/plain' } })
    }

    // Step 2: Generate local hash
    const merchantSecretHash = crypto.createHash('md5').update(PAYHERE.secret).digest('hex').toUpperCase()

    const hashString =
      notification.merchant_id +
      notification.order_id +
      notification.payhere_amount +
      notification.payhere_currency +
      notification.status_code +
      merchantSecretHash

    const localHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase()

    logger.info('Generated local hash: %s', localHash)
    logger.info('Received md5sig: %s', notification.md5sig)

    // Step 3: Compare hashes
    if (localHash !== notification.md5sig) {
      logger.warn('Hash mismatch. Notification may not be genuine.')
      return new Response('Hash mismatch', { status: 400, headers: { 'Content-Type': 'text/plain' } })
    }

    logger.info('Hash verification passed.')

    // Step 4: Connect to Database
    await connectToDatabase()

    // Step 5: Find the order by order_id
    const order = await Order.findById(notification.order_id)

    if (!order) {
      logger.warn('Order not found: %s', notification.order_id)
      return new Response('Order not found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
    }

    // Step 6: Update order and company based on status_code
    switch (notification.status_code) {
      case '2': // Payment successful
        order.status = 'completed'
        // Assuming 'payhere_order_id' is an optional field sent by PayHere.lk

        order.payhere_order_id = getString(bodyEntries.payhere_order_id) || notification.payment_id
        order.payhere_transaction_id = notification.payment_id

        await order.save()

        const company = await Company.findById(order.company)
        if (company) {
          company.subscription = order.subscription

          // Append the new order ID to the orders array
          company.orders.push(order.id)

          // Set credits and AI credits from custom fields, ensuring they are numbers
          company.credits = parseInt(order.credits || '0', 10)
          company.ai_credits = parseInt(order.ai_credits || '0', 10)

          // Set the subscription_status to active
          company.subscription_status = 'active'
          await company.save()
          logger.info('Company subscription updated: %s', company._id)
        } else {
          logger.warn('Company not found for order: %s', notification.order_id)
        }

        logger.info('Order completed: %s', notification.order_id)
        break

      case '0': // Payment pending
        order.status = 'pending'
        await order.save()
        logger.info('Order pending: %s', notification.order_id)
        break

      case '-1': // Payment canceled
      case '-2': // Payment failed
      case '-3': // Payment chargeback
        order.status = 'failed'
        await order.save()
        logger.info('Order status updated to failed: %s', notification.order_id)
        break

      default:
        logger.warn('Unknown status_code: %s for order: %s', notification.status_code, notification.order_id)
        // Optionally, handle unknown status codes
        break
    }

    // Step 7: Respond with 'OK' to acknowledge receipt
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  } catch (error: any) {
    logger.error('Error processing PayHere notification:', error)
    return new Response('Error processing notification', { status: 500, headers: { 'Content-Type': 'text/plain' } })
  }
}
