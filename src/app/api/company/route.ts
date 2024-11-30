// src/app/api/company/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb' // Adjust the path as necessary
import Company, { ICompany } from '@/models/Company' // Adjust the path as necessary
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Adjust the path as necessary

export async function GET(req: Request) {
  // Authenticate the user
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Extract the user ID from the session
  const userId = session.user.id // Ensure that `session.user.id` exists

  // Connect to the database
  await connectToDatabase()

  try {
    // Find all companies where the current user is an admin
    const companies: ICompany[] = await Company.find({ admins: userId })
      .populate('specialties')
      .populate('services')
      .exec()

    return NextResponse.json(companies, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
