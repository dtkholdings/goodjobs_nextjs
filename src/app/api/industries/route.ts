// src/app/api/industries/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Industry from '@/models/Industry'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Adjust the path as necessary

export async function GET(request: Request) {
  await connectToDatabase()

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  try {
    let industries
    if (query) {
      // Search industries based on query
      const regex = new RegExp(query, 'i') // Case-insensitive search
      industries = await Industry.find({ name: regex }).limit(10)
    } else {
      // Return all industries or limit as necessary
      industries = await Industry.find().limit(100)
    }

    return NextResponse.json(industries)
  } catch (error) {
    console.error('Error fetching industries:', error)
    return NextResponse.json({ error: 'Failed to fetch industries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await connectToDatabase()

  // Retrieve session to check user role
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const data = await request.json()
  const { name, description } = data

  if (!name) {
    return NextResponse.json({ error: 'Industry name is required' }, { status: 400 })
  }

  try {
    // Check if the industry already exists
    let industry = await Industry.findOne({ name: name.trim() })

    if (industry) {
      return NextResponse.json({ error: 'Industry already exists' }, { status: 409 })
    }

    // Create new industry
    industry = new Industry({
      name: name.trim(),
      description: description?.trim(),
      created_at: new Date(),
      updated_at: new Date()
    })

    await industry.save()

    return NextResponse.json(industry, { status: 201 })
  } catch (error: any) {
    console.error('Error creating industry:', error)
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Industry already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create industry' }, { status: 500 })
  }
}
