// src/app/api/company/[companyId]/jobs/[jobId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import JobModel from '@/models/Job'
import connectToDatabase from '@/libs/mongodb'
import mongoose from 'mongoose'

// Utility function to validate ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id)

export async function GET(req: NextRequest, { params }: { params: { companyId: string; jobId: string } }) {
  // Establish database connection
  await connectToDatabase()

  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { companyId, jobId } = params

  // Validate ObjectIds
  if (!isValidObjectId(companyId) || !isValidObjectId(jobId)) {
    return NextResponse.json({ message: 'Invalid Company ID or Job ID' }, { status: 400 })
  }

  // Check if the user is an admin of the company
  const companyIds = (session as any).companyIds as string[]
  if (!companyIds.includes(companyId)) {
    return NextResponse.json({ message: 'Forbidden: You are not an admin of this company' }, { status: 403 })
  }

  try {
    // Convert IDs to ObjectId
    const jobObjectId = new mongoose.Types.ObjectId(jobId)
    const companyObjectId = new mongoose.Types.ObjectId(companyId)

    const job = await JobModel.findOne({ _id: jobObjectId, company_id: companyObjectId })
      .populate('skills', 'name') // Populate skills
      .exec()

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { companyId: string; jobId: string } }) {
  // Establish database connection
  await connectToDatabase()

  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { companyId, jobId } = params

  // Validate ObjectIds
  if (!isValidObjectId(companyId) || !isValidObjectId(jobId)) {
    return NextResponse.json({ message: 'Invalid Company ID or Job ID' }, { status: 400 })
  }

  // Check if the user is an admin of the company
  const companyIds = (session as any).companyIds as string[]
  if (!companyIds.includes(companyId)) {
    return NextResponse.json({ message: 'Forbidden: You are not an admin of this company' }, { status: 403 })
  }

  // Parse the request body
  let body: any
  try {
    body = await req.json()
  } catch (err) {
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
    screening_questions,
    job_post_status
  } = body

  try {
    // Convert IDs to ObjectId
    const jobObjectId = new mongoose.Types.ObjectId(jobId)
    const companyObjectId = new mongoose.Types.ObjectId(companyId)

    const job = await JobModel.findOne({ _id: jobObjectId, company_id: companyObjectId }).exec()

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    // Update fields if provided
    if (job_title) job.job_title = job_title
    if (job_description) job.job_description = job_description
    if (job_type) job.job_type = job_type
    if (job_location_type) job.job_location_type = job_location_type
    if (job_level) job.job_level = job_level
    if (gender) job.gender = gender
    if (job_closing_date) job.job_closing_date = new Date(job_closing_date)
    if (job_post_type) job.job_post_type = job_post_type
    if (skills) {
      // Validate each skill ID
      const validSkills = skills
        .filter((id: string) => isValidObjectId(id))
        .map((id: string) => new mongoose.Types.ObjectId(id))
      job.skills = validSkills
    }
    if (job_location) {
      job.job_location = {
        address: job_location.address,
        coordinates: job_location.coordinates
      }
    }
    if (video_url) job.video_url = video_url
    if (cv_send_email) job.cv_send_email = cv_send_email
    if (screening_questions) {
      job.screening_questions = screening_questions.map((q: any) => ({
        question: q.question,
        correct_answer: q.correct_answer,
        answers: q.answers,
        answer_type: q.answer_type,
        required: q.required
      }))
    }
    if (job_post_status) job.job_post_status = job_post_status

    await job.save()

    return NextResponse.json({ message: 'Job updated successfully', job }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating job:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { companyId: string; jobId: string } }) {
  // Establish database connection
  await connectToDatabase()

  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { companyId, jobId } = params

  // Validate ObjectIds
  if (!isValidObjectId(companyId) || !isValidObjectId(jobId)) {
    return NextResponse.json({ message: 'Invalid Company ID or Job ID' }, { status: 400 })
  }

  // Check if the user is an admin of the company
  const companyIds = (session as any).companyIds as string[]
  if (!companyIds.includes(companyId)) {
    return NextResponse.json({ message: 'Forbidden: You are not an admin of this company' }, { status: 403 })
  }

  try {
    // Convert IDs to ObjectId
    const jobObjectId = new mongoose.Types.ObjectId(jobId)
    const companyObjectId = new mongoose.Types.ObjectId(companyId)

    const job = await JobModel.findOneAndDelete({ _id: jobObjectId, company_id: companyObjectId }).exec()

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
