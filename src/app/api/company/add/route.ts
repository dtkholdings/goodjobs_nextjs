// src/app/api/company/add/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Company from '@/models/Company'

export async function POST(request: Request) {
  await connectToDatabase()

  const data = await request.json()

  const {
    company_name,
    tagline,
    company_username,
    company_logo,
    company_cover_image,
    year_founded,
    company_size,
    company_type,
    industries,
    specialties,
    services,
    short_description,
    long_description,
    inquiry_email,
    support_email,
    general_phone_number,
    secondary_phone_number,
    fax,
    address,
    social_links,
    admins
  } = data

  // Basic validation
  if (!company_name || !company_username || !address.line1) {
    return NextResponse.json({ error: 'Company Name, Username, and Address Line 1 are required.' }, { status: 400 })
  }

  try {
    // Check if the username is already taken
    const existingCompany = await Company.findOne({
      company_username: { $regex: `^${company_username}$`, $options: 'i' }
    })

    if (existingCompany) {
      return NextResponse.json({ error: 'Company username is already taken.' }, { status: 409 })
    }

    // Create new company
    const newCompany = new Company({
      company_name,
      tagline,
      company_username,
      company_logo,
      company_cover_image,
      year_founded,
      company_size,
      company_type,
      industries,
      specialties,
      services,
      short_description,
      long_description,
      inquiry_email,
      support_email,
      general_phone_number,
      secondary_phone_number,
      fax,
      address,
      social_links,
      admins
    })

    await newCompany.save()

    return NextResponse.json({ success: true, company: newCompany }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating company:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
