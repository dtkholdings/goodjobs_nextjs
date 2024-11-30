// src/app/api/company/[companyId]/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Company from '@/models/Company'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Adjust the path as necessary

export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  const { companyId } = params
  await connectToDatabase()

  try {
    const company = await Company.findById(companyId)
      .populate('industries')
      .populate('specialties')
      .populate('services')
      .populate('admins', '-password') // Exclude sensitive fields
      .exec()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { companyId: string } }) {
  const { companyId } = params
  await connectToDatabase()

  // Retrieve session to check user authorization
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // You may want to check if the user has admin rights for the company

  const data = await request.json()

  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      {
        ...data,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    )

    if (!updatedCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, company: updatedCompany }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}
