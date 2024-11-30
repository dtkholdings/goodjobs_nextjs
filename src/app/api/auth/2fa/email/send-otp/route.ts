// app/api/2fa/email/send-otp/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

import User from '@/models/User'
import connectToDatabase from '@/libs/mongodb'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()

    // Set OTP and expiry (e.g., 10 minutes from now)
    const twoFactorOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // Update specific fields using findOneAndUpdate
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          twoFactorOTP: otp,
          twoFactorOTPExpiry: twoFactorOTPExpiry,
          twoFactorMethod: 'email',
          twoFactorEnabled: true
        }
      },
      { new: true, runValidators: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., Gmail, you can use any SMTP service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS // Your email password or app-specific password
      }
    })

    // Send the OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your 2FA OTP Code',
      text: `Your One-Time Password (OTP) for enabling Two-Factor Authentication is: ${otp}. It is valid for 10 minutes.`
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ message: 'OTP sent to your email' }, { status: 200 })
  } catch (error) {
    console.error('Error sending email OTP:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// // app/api/2fa/email/send-otp/route.ts

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Adjust the path as necessary

// import User from '@/models/User'
// import connectToDatabase from '@/libs/mongodb'
// import nodemailer from 'nodemailer'
// import crypto from 'crypto'

// export async function POST(request: Request) {
//   const session = await getServerSession(authOptions)

//   if (!session || !session.user || !session.user.email) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   try {
//     await connectToDatabase()

//     const user = await User.findOne({ email: session.user.email })

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }

//     // Generate a 6-digit OTP
//     const otp = crypto.randomInt(100000, 999999).toString()

//     // Set OTP and expiry (e.g., 10 minutes from now)
//     user.twoFactorOTP = otp
//     user.twoFactorOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)
//     user.twoFactorMethod = 'email'
//     user.twoFactorEnabled = true // Assuming the user wants to enable it
//     await user.save()

//     // Configure Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail', // e.g., Gmail, you can use any SMTP service
//       auth: {
//         user: process.env.EMAIL_USER, // Your email address
//         pass: process.env.EMAIL_PASS // Your email password or app-specific password
//       }
//     })

//     // Send the OTP email
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: user.email,
//       subject: 'Your 2FA OTP Code',
//       text: `Your One-Time Password (OTP) for enabling Two-Factor Authentication is: ${otp}. It is valid for 10 minutes.`
//     }

//     await transporter.sendMail(mailOptions)

//     return NextResponse.json({ message: 'OTP sent to your email' }, { status: 200 })
//   } catch (error) {
//     console.error('Error sending email OTP:', error)
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   }
// }
