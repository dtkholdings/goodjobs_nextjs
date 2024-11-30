// src/app/api/user/upload-profile-picture/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import User from '@/models/User'
import connectToDatabase from '@/libs/mongodb'
import { promises as fsPromises } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the form data
    const formData = await req.formData()
    const file = formData.get('profile_picture') as File | null // Ensure key matches client-side

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Generate a unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const uploadPath = path.join(uploadDir, fileName)

    // Ensure the upload directory exists
    await fsPromises.mkdir(uploadDir, { recursive: true })

    // Read the file data
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Save the file
    await fsPromises.writeFile(uploadPath, uint8Array)

    await connectToDatabase()

    const userId = session.user.id

    const profilePictureUrl = `/uploads/${fileName}`

    // Update user's profile picture URL
    await User.findByIdAndUpdate(userId, { profile_picture: profilePictureUrl }).exec()

    return NextResponse.json({ profile_picture_url: profilePictureUrl }, { status: 200 })
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
