// src/app/api/user/notification-settings/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import User from '@/models/User'
import connectToDatabase from '@/libs/mongodb'

// GET request handler to retrieve notification settings
export const GET = async (req: Request) => {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const user = await User.findById(userId).exec()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Retrieve notification settings from the user document
    const settings = user.notificationSettings || []
    const sendTime = user.notificationSendTime || 'online'

    return NextResponse.json({ settings, sendTime }, { status: 200 })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT request handler to update notification settings
export const PUT = async (req: Request) => {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const user = await User.findById(userId).exec()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()

    const { settings, sendTime } = body

    // Optionally, add validation for settings and sendTime here

    user.notificationSettings = settings
    user.notificationSendTime = sendTime

    await user.save()

    return NextResponse.json({ message: 'Notification settings updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
