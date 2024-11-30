// src/app/api/auth/signup/route.ts

import { NextResponse } from 'next/server'
import User from '@/models/User'
import connectToDatabase from '@/libs/mongodb'

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const { email, password, username } = await request.json()

    // Initialize an errors object to collect validation errors
    const errors: { email?: string; username?: string } = {}

    // Check if the email is already in use
    const existingUserByEmail = await User.findOne({ email }).exec()
    if (existingUserByEmail) {
      errors.email = 'Email already in use. Please change your email.'
    }

    // Check if the username is already in use
    const existingUserByUsername = await User.findOne({ username }).exec()
    if (existingUserByUsername) {
      errors.username = 'Username already in use. Please choose another username.'
    }

    // If there are any validation errors, return them to the client
    if (existingUserByEmail || existingUserByUsername) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    // Create a new user instance without manually hashing the password
    const user = new User({
      username,
      email,
      password // Plain password; will be hashed by the pre-save hook
      // Add other fields if necessary
    })

    // Save the user to the database
    await user.save()

    // Optionally, you can trigger an email verification process here

    // Return a success response
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Error during user signup:', error)

    // Handle duplicate key errors (in case of race conditions)
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern)[0]
      const duplicatedValue = error.keyValue[duplicatedField]
      const errorMessage = `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} "${duplicatedValue}" is already in use. Please choose another.`
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    // Return a generic error response for other errors
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// // src/app/api/auth/signup/route.ts

// import { NextResponse } from 'next/server'
// import bcrypt from 'bcryptjs'
// import User from '@/models/User'
// import connectToDatabase from '@/libs/mongodb'

// export async function POST(request: Request) {
//   try {
//     await connectToDatabase()

//     const { email, password, username } = await request.json()

//     // Initialize an errors object to collect validation errors
//     const errors: { email?: string; username?: string } = {}

//     // Check if the email is already in use
//     const existingUserByEmail = await User.findOne({ email }).exec()
//     if (existingUserByEmail) {
//       errors.email = 'Email already in use. Please change your email.'
//     }

//     // Check if the username is already in use
//     const existingUserByUsername = await User.findOne({ username }).exec()
//     if (existingUserByUsername) {
//       errors.username = 'Username already in use. Please choose another username.'
//     }

//     // If there are any validation errors, return them to the client
//     if (existingUserByEmail || existingUserByUsername) {
//       return NextResponse.json({ errors }, { status: 400 })
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10)

//     // Create a new user instance
//     const user = new User({
//       username,
//       email,
//       password: hashedPassword
//       // Add other fields if necessary
//     })

//     // Save the user to the database
//     await user.save()

//     // Optionally, you can trigger an email verification process here

//     // Return a success response
//     return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
//   } catch (error: any) {
//     console.error('Error during user signup:', error)

//     // Handle duplicate key errors (in case of race conditions)
//     if (error.code === 11000) {
//       const duplicatedField = Object.keys(error.keyPattern)[0]
//       const duplicatedValue = error.keyValue[duplicatedField]
//       const errorMessage = `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} "${duplicatedValue}" is already in use. Please choose another.`
//       return NextResponse.json({ error: errorMessage }, { status: 400 })
//     }

//     // Return a generic error response for other errors
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   }
// }
