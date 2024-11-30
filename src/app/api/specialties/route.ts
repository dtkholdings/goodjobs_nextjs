// src/app/api/specialties/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Specialty from '@/models/Specialty'

export async function GET(request: Request) {
  await connectToDatabase()

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  try {
    let specialties
    if (query) {
      // Search specialties based on query
      const regex = new RegExp(query, 'i') // Case-insensitive search
      specialties = await Specialty.find({ specialty_name: regex }).limit(10)
    } else {
      // Return all specialties or limit as necessary
      specialties = await Specialty.find().limit(100)
    }

    return NextResponse.json(specialties)
  } catch (error) {
    console.error('Error fetching specialties:', error)
    return NextResponse.json({ error: 'Failed to fetch specialties' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await connectToDatabase()

  const data = await request.json()
  const { specialty_name } = data

  if (!specialty_name) {
    return NextResponse.json({ error: 'Specialty name is required' }, { status: 400 })
  }

  try {
    // Check if the specialty already exists
    let specialty = await Specialty.findOne({ specialty_name: specialty_name.trim() })

    if (!specialty) {
      // Create new specialty
      specialty = new Specialty({
        specialty_name: specialty_name.trim()
      })
      await specialty.save()
    }

    return NextResponse.json(specialty, { status: 201 })
  } catch (error: any) {
    console.error('Error creating specialty:', error)
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Specialty already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create specialty' }, { status: 500 })
  }
}
