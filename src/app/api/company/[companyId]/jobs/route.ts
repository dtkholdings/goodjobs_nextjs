// src/app/api/company/[companyId]/jobs/route.ts

import '@/models' // Import the central models to register all schemas
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import JobModel from '@/models/Job'
import connectToDatabase from '@/libs/mongodb'
import mongoose from 'mongoose'

// Utility function to validate ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id)

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  // Establish database connection
  try {
    await connectToDatabase()
    console.log('Database connected successfully.')
  } catch (err) {
    console.error('Database connection error:', err)
    return NextResponse.json({ message: 'Internal Server Error: Database connection failed' }, { status: 500 })
  }

  const session = await getServerSession(authOptions)
  console.log('Session:', session)

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { companyId } = params

  // Validate ObjectIds
  if (!isValidObjectId(companyId)) {
    console.error('Invalid Company ID:', companyId)
    return NextResponse.json({ message: 'Invalid Company ID' }, { status: 400 })
  }

  // Check if the user is an admin of the company
  const companyIds = (session as any).companyIds as string[]
  console.log('User company IDs:', companyIds)
  if (!companyIds.includes(companyId)) {
    console.error('User is not an admin of the company:', companyId)
    return NextResponse.json({ message: 'Forbidden: You are not an admin of this company' }, { status: 403 })
  }

  // Parse query parameters for filtering and searching
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'All'
  const search = searchParams.get('search') || ''

  // Build the filter object
  const filter: any = { company_id: new mongoose.Types.ObjectId(companyId) }

  if (status !== 'All') {
    filter.job_post_status = status
  }

  if (search) {
    filter.$text = { $search: search }
  }

  console.log('Filter:', filter)

  try {
    const jobs = await JobModel.find(filter)
      .populate('skills', 'skill_name') // Populate skills with only the 'skill_name' field
      .sort({ createdAt: -1 })
      .lean() // Use lean for faster queries if you don't need Mongoose documents
      .exec()

    console.log(`Fetched ${jobs.length} jobs for company ID: ${companyId}`)

    return NextResponse.json({ jobs }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  // Establish database connection
  try {
    await connectToDatabase()
    console.log('Database connected successfully.')
  } catch (err) {
    console.error('Database connection error:', err)
    return NextResponse.json({ message: 'Internal Server Error: Database connection failed' }, { status: 500 })
  }

  const session = await getServerSession(authOptions)
  console.log('Session:', session)

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { companyId } = params

  // Validate ObjectIds
  if (!isValidObjectId(companyId)) {
    console.error('Invalid Company ID:', companyId)
    return NextResponse.json({ message: 'Invalid Company ID' }, { status: 400 })
  }

  // Check if the user is an admin of the company
  const companyIds = (session as any).companyIds as string[]
  console.log('User company IDs:', companyIds)
  if (!companyIds.includes(companyId)) {
    console.error('User is not an admin of the company:', companyId)
    return NextResponse.json({ message: 'Forbidden: You are not an admin of this company' }, { status: 403 })
  }

  // Parse the request body
  let body: any
  try {
    body = await req.json()
  } catch (err) {
    console.error('Error parsing JSON body:', err)
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    job_title,
    job_description,
    job_type,
    job_location_type,
    job_level,
    gender,
    job_closing_date,
    job_post_type,
    skills,
    job_location,
    video_url,
    cv_send_email,
    screening_questions
  } = body

  // Basic validation
  if (!job_title || !job_type || !job_location_type) {
    console.error('Missing required fields:', { job_title, job_type, job_location_type })
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Validate each skill ID
    const validSkills = skills
      ? skills.filter((id: string) => isValidObjectId(id)).map((id: string) => new mongoose.Types.ObjectId(id))
      : []

    // Create a new job
    const newJob = new JobModel({
      company_id: new mongoose.Types.ObjectId(companyId),
      job_title,
      job_description,
      job_type,
      job_location_type,
      job_level,
      gender,
      job_closing_date: job_closing_date ? new Date(job_closing_date) : undefined,
      job_post_type: job_post_type || 'Normal',
      skills: validSkills,
      job_location: job_location
        ? {
            address: job_location.address,
            coordinates: job_location.coordinates
          }
        : undefined,
      video_url,
      cv_send_email,
      screening_questions: screening_questions
        ? screening_questions.map((q: any) => ({
            question: q.question,
            correct_answer: q.correct_answer,
            answers: q.answers,
            answer_type: q.answer_type,
            required: q.required
          }))
        : []
      // job_post_status defaults to 'Draft'
    })

    // Save the job to the database
    await newJob.save()

    console.log('Job created successfully:', newJob)

    return NextResponse.json({ message: 'Job created successfully', job: newJob }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating job:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

// // src/app/api/company/[companyId]/jobs/route.ts

// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import JobModel from '@/models/Job'
// import connectToDatabase from '@/libs/mongodb'
// import mongoose from 'mongoose'

// // Utility function to validate ObjectId
// const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id)

// export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
//   // Establish database connection
//   try {
//     await connectToDatabase()
//   } catch (err) {
//     console.error('Database connection error:', err)
//     return NextResponse.json({ message: 'Internal Server Error: Database connection failed' }, { status: 500 })
//   }

//   const session = await getServerSession(authOptions)

//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
//   }

//   const { companyId } = params

//   // Validate ObjectIds
//   if (!isValidObjectId(companyId)) {
//     return NextResponse.json({ message: 'Invalid Company ID' }, { status: 400 })
//   }

//   // Check if the user is an admin of the company
//   const companyIds = (session as any).companyIds as string[]
//   if (!companyIds.includes(companyId)) {
//     return NextResponse.json({ message: 'Forbidden: You are not an admin of this company' }, { status: 403 })
//   }

//   // Parse query parameters for filtering and searching
//   const { searchParams } = new URL(req.url)
//   const status = searchParams.get('status') || 'All'
//   const search = searchParams.get('search') || ''

//   // Build the filter object
//   const filter: any = { company_id: new mongoose.Types.ObjectId(companyId) }

//   if (status !== 'All') {
//     filter.job_post_status = status
//   }

//   if (search) {
//     filter.$text = { $search: search }
//   }

//   try {
//     const jobs = await JobModel.find(filter)
//       .populate('skills', 'name') // Populate skills with only the 'name' field
//       .sort({ createdAt: -1 })
//       .lean() // Use lean for faster queries if you don't need Mongoose documents
//       .exec()

//     return NextResponse.json({ jobs }, { status: 200 })
//   } catch (error: any) {
//     console.error('Error fetching jobs:', error)
//     return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
//   }
// }

// export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
//   // Establish database connection
//   try {
//     await connectToDatabase()
//   } catch (err) {
//     console.error('Database connection error:', err)
//     return NextResponse.json({ message: 'Internal Server Error: Database connection failed' }, { status: 500 })
//   }

//   const session = await getServerSession(authOptions)

//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
//   }

//   const { companyId } = params

//   // Validate ObjectIds
//   if (!isValidObjectId(companyId)) {
//     return NextResponse.json({ message: 'Invalid Company ID' }, { status: 400 })
//   }

//   // Check if the user is an admin of the company
//   const companyIds = (session as any).companyIds as string[]
//   if (!companyIds.includes(companyId)) {
//     return NextResponse.json({ message: 'Forbidden: You are not an admin of this company' }, { status: 403 })
//   }

//   // Parse the request body
//   let body: any
//   try {
//     body = await req.json()
//   } catch (err) {
//     console.error('Error parsing JSON body:', err)
//     return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
//   }

//   const {
//     job_title,
//     job_description,
//     job_type,
//     job_location_type,
//     job_level,
//     gender,
//     job_closing_date,
//     job_post_type,
//     skills,
//     job_location,
//     video_url,
//     cv_send_email,
//     screening_questions
//   } = body

//   // Basic validation
//   if (!job_title || !job_type || !job_location_type) {
//     return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
//   }

//   try {
//     // Validate each skill ID
//     const validSkills = skills
//       ? skills.filter((id: string) => isValidObjectId(id)).map((id: string) => new mongoose.Types.ObjectId(id))
//       : []

//     // Create a new job
//     const newJob = new JobModel({
//       company_id: new mongoose.Types.ObjectId(companyId),
//       job_title,
//       job_description,
//       job_type,
//       job_location_type,
//       job_level,
//       gender,
//       job_closing_date: job_closing_date ? new Date(job_closing_date) : undefined,
//       job_post_type: job_post_type || 'Normal',
//       skills: validSkills,
//       job_location: job_location
//         ? {
//             address: job_location.address,
//             coordinates: job_location.coordinates
//           }
//         : undefined,
//       video_url,
//       cv_send_email,
//       screening_questions: screening_questions
//         ? screening_questions.map((q: any) => ({
//             question: q.question,
//             correct_answer: q.correct_answer,
//             answers: q.answers,
//             answer_type: q.answer_type,
//             required: q.required
//           }))
//         : []
//       // job_post_status defaults to 'Draft'
//     })

//     // Save the job to the database
//     await newJob.save()

//     return NextResponse.json({ message: 'Job created successfully', job: newJob }, { status: 201 })
//   } catch (error: any) {
//     console.error('Error creating job:', error)
//     return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
//   }
// }
