// src/app/api/auth/request-otp/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]/route'
import connectToDatabase from '@/libs/mongodb'
import UserModel from '@/models/User'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST() {
  try {
    // Retrieve the session
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = session.user.email

    // Connect to the database
    await connectToDatabase()

    // Find the user by email
    const user = await UserModel.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Hash the OTP before storing
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')

    // Set OTP expiry to 5 minutes from now
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    // Update the user with hashed OTP and expiry without triggering validation
    await UserModel.findOneAndUpdate(
      { email },
      { $set: { otp: hashedOtp, otp_expiry: otpExpiry } },
      { new: true, runValidators: false }
    )

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Send the OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Email Verification',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    })

    return NextResponse.json({ message: 'OTP sent to email.' })
  } catch (error) {
    console.error('Error in request-otp:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
