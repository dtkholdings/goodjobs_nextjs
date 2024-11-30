// src/app/api/company/[companyId]/subscription/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Company, { ICompany } from '@/models/Company'
import Subscription, { ISubscription } from '@/models/Subscription'
import { ObjectId } from 'mongodb'
import logger from '@/libs/logger'

/**
 * Interface defining the structure of the API response
 */
interface ActiveSubscriptionResponse {
  subscription: {
    id: string
    planName: string
    subtitle?: string
    currency: string
    price: number
    includedFeatures: string[]
    notIncludedFeatures: string[]
    packageColor?: string
    icon?: string
    credits: number
    aiCredits: number
    subscriptionStatus: string
  } | null
  remainingCredits: number
  remainingAICredits: number
}

/**
 * GET Handler to fetch active subscription details for a company
 */
export async function GET(request: Request, { params }: { params: { companyId: string } }): Promise<Response> {
  const { companyId } = params

  // Validate the companyId
  if (!ObjectId.isValid(companyId)) {
    logger.warn('Invalid Company ID:', companyId)
    return new Response('Invalid Company ID', { status: 400 })
  }

  try {
    // Connect to the database
    await connectToDatabase()

    // Fetch the company by ID and populate the subscription field
    const company = (await Company.findById(companyId).populate('subscription').exec()) as ICompany | null

    if (!company) {
      logger.warn('Company not found:', companyId)
      return new Response('Company not found', { status: 404 })
    }

    // Check if the company has an active subscription
    if (company.subscription_status !== 'active' || !company.subscription) {
      logger.info('No active subscription for company:', companyId)
      const noSubscriptionResponse: ActiveSubscriptionResponse = {
        subscription: null,
        remainingCredits: company.credits || 0,
        remainingAICredits: company.ai_credits || 0
      }
      return NextResponse.json(noSubscriptionResponse, { status: 200 })
    }

    // At this point, the company has an active subscription
    const activeSubscription = company.subscription as ISubscription

    // Prepare the response data
    const responseData: ActiveSubscriptionResponse = {
      subscription: {
        id: activeSubscription.id.toString(),
        planName: activeSubscription.subscription_plan_name,
        subtitle: activeSubscription.subtitle || '',
        currency: activeSubscription.currency,
        price: activeSubscription.price,
        includedFeatures: activeSubscription.included_features,
        notIncludedFeatures: activeSubscription.not_included_features,
        packageColor: activeSubscription.package_color || '',
        icon: activeSubscription.icon || '',
        credits: activeSubscription.credits || 0,
        aiCredits: activeSubscription.ai_credits || 0,
        subscriptionStatus: company.subscription_status || 'active'
      },
      remainingCredits: company.credits || 0,
      remainingAICredits: company.ai_credits || 0
    }

    return NextResponse.json(responseData, { status: 200 })
  } catch (error: any) {
    logger.error('Error fetching active subscription:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
