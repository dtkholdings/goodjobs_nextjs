// src/app/api/user/update/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import connectToDatabase from '@/libs/mongodb'
import UserModel from '@/models/User'
import { updateUserSchema } from '@/validators/user'
import mongoose from 'mongoose' // Import mongoose

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const data = await request.json()

  // Validate the data using Zod or any other validation library
  const parsedData = updateUserSchema.safeParse(data)

  if (!parsedData.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsedData.error.errors }, { status: 400 })
  }

  await connectToDatabase()

  try {
    // Define an interface for updateData
    interface UpdateData {
      [key: string]: any
      skills?: (string | mongoose.Types.ObjectId)[]
      // Include other fields as necessary
    }

    // Create a new object for the update
    const updateData: UpdateData = { ...parsedData.data }

    // Convert skill IDs to ObjectIds
    if (updateData.skills) {
      updateData.skills = updateData.skills.map(id => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id))
    }

    // Update the user's data
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password').lean()

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// // src/app/api/user/update/route.ts

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '../../auth/[...nextauth]/route'
// import connectToDatabase from '@/libs/mongodb'
// import UserModel from '@/models/User'
// import { updateUserSchema } from '@/validators/user'

// export async function PUT(request: Request) {
//   const session = await getServerSession(authOptions)

//   if (!session || !session.user || !session.user.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   const userId = session.user.id
//   const data = await request.json()

//   // Validate the data using Zod or any other validation library
//   const parsedData = updateUserSchema.safeParse(data)

//   if (!parsedData.success) {
//     return NextResponse.json({ error: 'Invalid data', details: parsedData.error.errors }, { status: 400 })
//   }

//   await connectToDatabase()

//   try {
//     // Update the user's data
//     const updatedUser = await UserModel.findByIdAndUpdate(userId, parsedData.data, { new: true })
//       .select('-password')
//       .lean()

//     if (!updatedUser) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }

//     return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 })
//   } catch (error) {
//     console.error('Error updating user:', error)
//     return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
//   }
// }
