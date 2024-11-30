// src/app/api/auth/verify-otp/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]/route'
import connectToDatabase from '@/libs/mongodb'
import UserModel from '@/models/User'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    // Retrieve the session
    const session = await getServerSession(authOptions)

    console.log('Verify OTP - Session:', session)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = session.user.email

    // Parse the request body
    const { otp } = await request.json()

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Hash the provided OTP for comparison
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')

    // Find the user and verify OTP without triggering full validation
    const user = await UserModel.findOne({
      email,
      otp: hashedOtp,
      otp_expiry: { $gt: new Date() } // Ensure OTP hasn't expired
    })

    console.log('Verify OTP - User Found:', user)

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified. Redirecting to dashboard.' }, { status: 200 })
    }

    // Update user's emailVerified field and remove OTP fields without validation
    await UserModel.findOneAndUpdate(
      { email },
      {
        $set: { emailVerified: new Date() },
        $unset: { otp: '', otp_expiry: '' }
      },
      { new: true, runValidators: false }
    )

    console.log('Verify OTP - Email Verified:', email)

    return NextResponse.json({ message: 'Email verified successfully. Redirecting to dashboard.' })
  } catch (error) {
    console.error('Error in verify-otp:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// // src/app/api/auth/verify-otp/route.ts

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '../[...nextauth]/route'
// import connectToDatabase from '@/libs/mongodb'
// import UserModel from '@/models/User'
// import crypto from 'crypto'

// export async function POST(request: Request) {
//   try {
//     // Retrieve the session
//     const session = await getServerSession(authOptions)

//     if (!session || !session.user || !session.user.email) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const email = session.user.email

//     // Parse the request body
//     const { otp } = await request.json()

//     if (!otp) {
//       return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
//     }

//     // Connect to the database
//     await connectToDatabase()

//     // Hash the provided OTP for comparison
//     const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')

//     // Find the user and verify OTP without triggering full validation
//     const user = await UserModel.findOne({
//       email,
//       otp: hashedOtp,
//       otp_expiry: { $gt: new Date() } // Ensure OTP hasn't expired
//     })

//     if (!user) {
//       return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
//     }

//     // **Added Code Block: Check if email is already verified**
//     if (user.emailVerified) {
//       return NextResponse.json({ message: 'Email already verified. Redirecting to dashboard.' }, { status: 200 })
//     }

//     // Update user's emailVerified field and remove OTP fields without validation
//     await UserModel.findOneAndUpdate(
//       { email },
//       {
//         $set: { emailVerified: new Date() },
//         $unset: { otp: '', otp_expiry: '' }
//       },
//       { new: true, runValidators: false }
//     )

//     return NextResponse.json({ message: 'Email verified successfully. Redirecting to dashboard.' })
//   } catch (error) {
//     console.error('Error in verify-otp:', error)
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   }
// }
