// // app/api/2fa/authenticator/setup/route.ts

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// import User from '@/models/User'
// import connectToDatabase from '@/libs/mongodb'
// import * as speakeasy from 'speakeasy'
// import QRCode from 'qrcode'

// export async function GET(request: Request) {
//   console.log('Received GET request to /api/2fa/authenticator/setup')

//   const session = await getServerSession(authOptions)
//   console.log('Session:', session)

//   if (!session || !session.user || !session.user.email) {
//     console.log('Unauthorized access attempt.')
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   const mongoose = require('mongoose') // Import mongoose for transaction

//   const sessionMongo = await mongoose.startSession()
//   sessionMongo.startTransaction()

//   try {
//     await connectToDatabase()
//     console.log('Connected to database.')

//     const user = await User.findOne({ email: session.user.email }).session(sessionMongo)
//     console.log('User:', user)

//     if (!user) {
//       console.log('User not found')
//       await sessionMongo.abortTransaction()
//       sessionMongo.endSession()
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }

//     if (user.twoFactorEnabled && user.twoFactorMethod === 'authenticator') {
//       console.log('Authenticator already set up for user:', user.email)
//       await sessionMongo.abortTransaction()
//       sessionMongo.endSession()
//       return NextResponse.json({ error: 'Authenticator already set up' }, { status: 400 })
//     }

//     // Generate a secret key
//     console.log('Generating secret with speakeasy...')
//     const secret = speakeasy.generateSecret({
//       name: user.email,
//       issuer: 'YourApp'
//     })
//     console.log('Generated secret:', secret)

//     const otpauthUrl = secret.otpauth_url
//     console.log('otpauth_url:', otpauthUrl)

//     if (!otpauthUrl) {
//       console.log('Failed to generate otpauth_url')
//       throw new Error('Failed to generate otpauth_url')
//     }

//     // Update user's twoFactorSecret and twoFactorMethod within the transaction
//     user.twoFactorSecret = secret.base32
//     user.twoFactorMethod = 'authenticator'
//     await user.save({ session: sessionMongo })
//     console.log('Updated user with twoFactorSecret and twoFactorMethod')

//     // Generate QR code
//     console.log('Generating QR code...')
//     const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl)
//     console.log('QR code generated')

//     await sessionMongo.commitTransaction()
//     sessionMongo.endSession()

//     return NextResponse.json(
//       {
//         otpauth_url: otpauthUrl,
//         qr_code: qrCodeDataURL,
//         secret: secret.base32 // Optional: You can choose not to send this to the client
//       },
//       { status: 200 }
//     )
//   } catch (error) {
//     await sessionMongo.abortTransaction()
//     sessionMongo.endSession()
//     console.error('Error setting up Authenticator App:', error)
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   }
// }
