// src/app/api/company/[companyId]/orders/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Company, { ICompany } from '@/models/Company'
import Order, { IOrder } from '@/models/Order'
import { ObjectId } from 'mongodb'
import logger from '@/libs/logger'

/**
 * Interface defining the structure of each order in the response
 */
interface OrderResponse {
  id: string
  subscriptionPlan: string
  amount: number
  currency: string
  status: string
  payhereTransactionId?: string
  payhereOrderId?: string
  credits: number
  aiCredits: number
  createdAt: string
}

/**
 * Interface defining the structure of the paginated response
 */
interface PaginatedOrdersResponse {
  orders: OrderResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * GET Handler to fetch paginated orders for a company
 */
export async function GET(request: Request, { params }: { params: { companyId: string } }): Promise<Response> {
  const { companyId } = params

  // Validate the companyId
  if (!ObjectId.isValid(companyId)) {
    logger.warn('Invalid Company ID:', companyId)
    return new Response('Invalid Company ID', { status: 400 })
  }

  try {
    // Parse query parameters for pagination
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return new Response('Invalid page number', { status: 400 })
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return new Response('Invalid limit value', { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Fetch the company by ID and select only the orders array
    const company = (await Company.findById(companyId).select('orders').exec()) as ICompany | null

    if (!company) {
      logger.warn('Company not found:', companyId)
      return new Response('Company not found', { status: 404 })
    }

    // Calculate total number of orders
    const totalOrders = company.orders.length

    // Calculate total pages
    const totalPages = Math.ceil(totalOrders / limit)

    // Ensure the requested page does not exceed total pages
    const currentPage = page > totalPages ? totalPages : page

    // Calculate the starting and ending index for slicing
    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit

    // Slice the orders array to get the relevant order IDs for the current page
    const orderIds = company.orders.slice(startIndex, endIndex)

    // Fetch order details from the Order collection
    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate('subscription', 'subscription_plan_name') // Populate subscription to get plan name
      .sort({ createdAt: -1 }) // Sort by most recent
      .exec()

    // Map orders to the response format
    const ordersResponse: OrderResponse[] = orders.map(order => ({
      id: order.id.toString(),
      subscriptionPlan: order.subscription ? (order.subscription as any).subscription_plan_name : 'N/A',
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      payhereTransactionId: order.payhere_transaction_id,
      payhereOrderId: order.payhere_order_id,
      credits: order.credits || 0,
      aiCredits: order.ai_credits || 0,
      createdAt: order.createdAt.toISOString()
    }))

    // Prepare the paginated response
    const responseData: PaginatedOrdersResponse = {
      orders: ordersResponse,
      total: totalOrders,
      page: currentPage,
      limit,
      totalPages
    }

    return NextResponse.json(responseData, { status: 200 })
  } catch (error: any) {
    logger.error('Error fetching orders:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
