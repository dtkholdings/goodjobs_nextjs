// src/app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server'
import UserModel from '@/models/User'
import connectToDatabase from '@/libs/mongodb'
import bcrypt from 'bcryptjs' // Ensure consistency with the User schema's bcrypt usage

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON payload
    const { email, token, newPassword } = await request.json()

    // Debugging: Log the received data
    console.log('Received reset-password request:', { email, token, newPassword })

    // Validate input
    if (!email || !token || !newPassword) {
      console.log('Validation failed: Missing email, token, or newPassword.')
      return NextResponse.json({ message: 'Email, token, and new password are required.' }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()
    console.log('Connected to the database.')

    // Find the user by email, token, and ensure the token hasn't expired
    const user = await UserModel.findOne({
      email,
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    })

    if (!user) {
      console.log('User not found or token expired for email:', email)
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 400 })
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    console.log('Hashed new password.')

    // Update the user's password and clear reset token fields using findOneAndUpdate
    await UserModel.findOneAndUpdate(
      { email, passwordResetToken: token, passwordResetExpires: { $gt: new Date() } },
      {
        $set: { password: hashedPassword },
        $unset: { passwordResetToken: '', passwordResetExpires: '' }
      }
    )
    console.log('Password updated and reset tokens cleared for user:', email)

    // TODO: Invalidate user sessions or tokens if applicable

    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 })
  } catch (error) {
    console.error('Error in reset-password:', error)

    // In development, send detailed error messages
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ message: 'Internal Server Error', error: (error as Error).message }, { status: 500 })
    }

    // In production, send a generic error message
    return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 })
  }
}
