// src/app/api/services/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Service from '@/models/Service'

export async function GET(request: Request) {
  await connectToDatabase()

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  try {
    let services
    if (query) {
      // Search services based on query
      const regex = new RegExp(query, 'i') // Case-insensitive search
      services = await Service.find({ service_name: regex }).limit(10)
    } else {
      // Return all services or limit as necessary
      services = await Service.find().limit(100)
    }

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await connectToDatabase()

  const data = await request.json()
  const { service_name, description } = data

  if (!service_name) {
    return NextResponse.json({ error: 'Service name is required' }, { status: 400 })
  }

  try {
    // Check if the service already exists
    let service = await Service.findOne({ service_name: service_name.trim() })

    if (!service) {
      // Create new service
      service = new Service({
        service_name: service_name.trim(),
        description: description ? description.trim() : undefined
      })
      await service.save()
    }

    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    console.error('Error creating service:', error)
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Service already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
