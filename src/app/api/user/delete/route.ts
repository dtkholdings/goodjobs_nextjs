// src/app/api/user/delete/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import User from '@/models/User'
import connectToDatabase from '@/libs/mongodb'

export const DELETE = async (req: Request) => {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Delete the user from the database
    await User.findByIdAndDelete(userId).exec()

    // Optionally, you can add additional logic to clean up related data
    // For example, delete user's posts, comments, etc.

    // Sign out the user after deletion (invalidate session)
    // Since we're using JWT strategy, we can instruct the client to sign out
    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
