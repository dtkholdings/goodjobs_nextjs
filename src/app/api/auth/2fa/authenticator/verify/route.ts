// // app/api/2fa/authenticator/verify-otp/route.ts

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// import User from '@/models/User'
// import connectToDatabase from '@/libs/mongodb'
// import { authenticator } from 'otplib'
// // import rateLimit from '@/libs/rateLimit' // Ensure rateLimit is implemented

// export async function POST(request: Request) {
//   console.log('Received POST request to /api/2fa/authenticator/verify-otp')

//   // Implement Rate Limiting
//   const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

//   // try {
//   //   await rateLimit(ip)
//   // } catch (err) {
//   //   console.warn(`Rate limit exceeded for IP: ${ip}`)
//   //   return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
//   // }

//   // Retrieve the user session
//   const session = await getServerSession(authOptions)
//   console.log('Session:', session)

//   if (!session || !session.user || !session.user.email) {
//     console.log('Unauthorized access attempt.')
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   // Parse the request body
//   let body
//   try {
//     body = await request.json()
//   } catch (err) {
//     console.error('Error parsing JSON:', err)
//     return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
//   }

//   const { token } = body

//   if (!token) {
//     console.log('OTP not provided in the request.')
//     return NextResponse.json({ error: 'OTP is required.' }, { status: 400 })
//   }

//   try {
//     await connectToDatabase()
//     console.log('Connected to database.')

//     // Find the user with the email
//     const user = await User.findOne({ email: session.user.email })
//     console.log('User:', user)

//     if (!user) {
//       console.log('User not found during OTP verification.')
//       return NextResponse.json({ error: 'User not found.' }, { status: 404 })
//     }

//     if (!user.twoFactorSecret || !user.twoFactorMethod || user.twoFactorMethod !== 'authenticator') {
//       console.log('Authenticator not set up for user:', user.email)
//       return NextResponse.json({ error: 'Authenticator not set up. Please set up first.' }, { status: 400 })
//     }

//     // Verify the token
//     const isValid = authenticator.check(token, user.twoFactorSecret)
//     console.log('OTP validation result:', isValid)

//     if (!isValid) {
//       console.log(`Invalid OTP attempt for user: ${user.email}`)
//       return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 })
//     }

//     // OTP is valid; enable 2FA
//     user.twoFactorEnabled = true
//     await user.save()
//     console.log(`2FA via Authenticator enabled for user: ${user.email}`)

//     return NextResponse.json(
//       { message: 'Two-Factor Authentication via Authenticator App has been enabled.' },
//       { status: 200 }
//     )
//   } catch (error) {
//     console.error('Error verifying Authenticator OTP:', error)

//     // Handle Mongoose validation errors
//     if (error.name === 'ValidationError') {
//       return NextResponse.json({ error: error.message }, { status: 400 })
//     }

//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   }
// }
