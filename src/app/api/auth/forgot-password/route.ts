// src/app/api/auth/forgot-password/route.ts

import { NextResponse } from 'next/server'
import UserModel from '@/models/User'
import connectToDatabase from '@/libs/mongodb'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON payload
    const { email } = await request.json()

    // Debugging: Log the received email
    console.log('Received forgot-password request for email:', email)

    if (!email) {
      console.log('Email not provided in request.')
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()
    console.log('Connected to the database.')

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex')
    const passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    console.log('Generated token:', token)
    console.log('Password reset expires at:', passwordResetExpires)

    // Find the user by email and update the reset token and expiration
    const user = await UserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          passwordResetToken: token,
          passwordResetExpires
        }
      },
      { new: true } // Return the updated document
    )

    if (!user) {
      // For security, respond with the same message even if user doesn't exist
      console.log('User not found for email:', email)
      return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' }, { status: 200 })
    }

    console.log('Saved token and expiration to user:', user.email)

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/password-reset?token=${token}&email=${encodeURIComponent(
      user.email
    )}`
    console.log('Password reset link:', resetLink)

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Ensure you're using the correct service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Verify transporter configuration
    await transporter.verify()
    console.log('Nodemailer transporter verified.')

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password. This link is valid for 5 minutes.\n\n${resetLink}`,
      html: `<p>You requested a password reset. Click the link below to reset your password. This link is valid for 5 minutes.</p><p><a href="${resetLink}">Reset Password</a></p>`
    }

    // Send the email
    await transporter.sendMail(mailOptions)
    console.log('Password reset email sent to:', user.email)

    return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' }, { status: 200 })
  } catch (error) {
    console.error('Error in forgot-password:', error)

    // Type guarding for TypeScript
    if (process.env.NODE_ENV === 'development') {
      if (error instanceof Error) {
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 })
      }
      return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 })
    }

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

// // src/app/api/auth/forgot-password/route.ts

// import { NextResponse } from 'next/server'
// import UserModel from '@/models/User'
// import connectToDatabase from '@/libs/mongodb'
// import crypto from 'crypto'
// import nodemailer from 'nodemailer'

// export async function POST(request: Request) {
//   try {
//     // Parse the incoming JSON payload
//     const { email } = await request.json()

//     // Debugging: Log the received email
//     console.log('Received forgot-password request for email:', email)

//     if (!email) {
//       console.log('Email not provided in request.')
//       return NextResponse.json({ message: 'Email is required.' }, { status: 400 })
//     }

//     // Connect to the database
//     await connectToDatabase()
//     console.log('Connected to the database.')

//     // Find the user by email and update passwordResetToken and passwordResetExpires
//     const token = crypto.randomBytes(32).toString('hex')
//     const passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

//     const user = await UserModel.findOneAndUpdate(
//       { email },
//       { $set: { passwordResetToken: token, passwordResetExpires } },
//       { new: true }
//     )

//     if (!user) {
//       // For security, respond with the same message even if user doesn't exist
//       console.log('User not found for email:', email)
//       return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' }, { status: 200 })
//     }

//     console.log('Generated token:', token)
//     console.log('Saved token and expiration to user:', user.email)

//     // Create reset link
//     const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/password-reset?token=${token}&email=${encodeURIComponent(
//       user.email
//     )}`
//     console.log('Password reset link:', resetLink)

//     // Configure nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail', // Ensure you're using the correct service
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     })

//     // Verify transporter configuration
//     await transporter.verify()
//     console.log('Nodemailer transporter verified.')

//     const mailOptions = {
//       from: process.env.EMAIL_FROM,
//       to: user.email,
//       subject: 'Password Reset Request',
//       text: `You requested a password reset. Click the link below to reset your password. This link is valid for 5 minutes.\n\n${resetLink}`,
//       html: `<p>You requested a password reset. Click the link below to reset your password. This link is valid for 5 minutes.</p><p><a href="${resetLink}">Reset Password</a></p>`
//     }

//     // Send the email
//     await transporter.sendMail(mailOptions)
//     console.log('Password reset email sent to:', user.email)

//     return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' }, { status: 200 })
//   } catch (error) {
//     // Inside the catch block
//     if (error instanceof Error) {
//       return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 })
//     } else {
//       return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 })
//     }
//   }
// }
