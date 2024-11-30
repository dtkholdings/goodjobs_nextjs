// src/app/api/company/check-username/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Company from '@/models/Company'

export async function GET(request: Request) {
  await connectToDatabase()

  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username is required.' }, { status: 400 })
  }

  try {
    // Check if the username already exists (case-insensitive)
    const existingCompany = await Company.findOne({
      company_username: { $regex: `^${username}$`, $options: 'i' }
    })

    if (existingCompany) {
      return NextResponse.json({ available: false })
    } else {
      return NextResponse.json({ available: true })
    }
  } catch (error) {
    console.error('Error checking username availability:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
