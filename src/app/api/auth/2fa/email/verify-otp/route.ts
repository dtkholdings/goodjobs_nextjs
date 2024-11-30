// app/api/2fa/email/verify-otp/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Adjust the path as necessary

import User from '@/models/User'
import connectToDatabase from '@/libs/mongodb'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse the request body
  let body
  try {
    body = await request.json()
  } catch (err) {
    console.error('Error parsing JSON:', err)
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const { otp } = body

  if (!otp) {
    return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
  }

  try {
    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email })

    if (!user || !user.twoFactorOTP || !user.twoFactorOTPExpiry) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 })
    }

    if (user.twoFactorOTP !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    if (user.twoFactorOTPExpiry < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    // OTP is valid; finalize enabling 2FA
    user.twoFactorOTP = undefined
    user.twoFactorOTPExpiry = undefined
    await user.save()

    return NextResponse.json({ message: 'Two-Factor Authentication via Email has been enabled.' }, { status: 200 })
  } catch (error) {
    console.error('Error verifying email OTP:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
