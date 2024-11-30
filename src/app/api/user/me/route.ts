// src/app/api/user/me/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import connectToDatabase from '@/libs/mongodb'

export async function GET(request: Request) {
  // Retrieve the session to get the user ID
  const session = await getServerSession(authOptions)

  // Check if the user is authenticated
  if (!session || !session.user || !session.user.id) {
    console.warn('Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log(`Fetching data for user ID: ${session.user.id}`)

    // Connect to the database **before** importing models
    await connectToDatabase()

    // Dynamically import models **after** establishing the connection
    const UserModel = (await import('@/models/User')).default
    // SkillModel is already imported within UserModel, but you can import it here if needed
    const SkillModel = (await import('@/models/Skill')).default

    // Fetch the user by ID and populate necessary fields
    const user = await UserModel.findById(session.user.id)
      .select('-password -__v') // Exclude 'password' and '__v' fields
      .populate('skills') // Populate 'skills' field from Skill collection
      .populate({
        path: 'projects.skills_used', // Populate 'skills_used' within projects
        model: 'Skill' // Ensure correct model name
      })
      .lean() // Convert to plain JavaScript object

    // If user is not found, return 404
    if (!user) {
      console.warn(`User not found with ID: ${session.user.id}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log(`User data fetched successfully for ID: ${session.user.id}`)

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching user data:', error)

    // Determine the type of error and respond accordingly
    if (error.name === 'MongoError') {
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}

// // src/app/api/user/me/route.ts

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '../../auth/[...nextauth]/route'
// import connectToDatabase from '@/libs/mongodb'

// export async function GET(request: Request) {
//   // Retrieve the session to get the user ID
//   const session = await getServerSession(authOptions)

//   // Check if the user is authenticated
//   if (!session || !session.user || !session.user.id) {
//     console.warn('Unauthorized access attempt')
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   try {
//     console.log(`Fetching data for user ID: ${session.user.id}`)

//     // Connect to the database **before** importing models
//     await connectToDatabase()

//     // Dynamically import models **after** establishing the connection
//     const UserModel = (await import('@/models/User')).default
//     const SkillModel = (await import('@/models/Skill')).default // Optional, since Skill is already imported in UserModel

//     // Fetch the user by ID and populate necessary fields
//     const user = await UserModel.findById(session.user.id)
//       .select('-password -__v') // Exclude 'password' and '__v' fields
//       .populate('skills') // Populate 'skills' field from Skill collection
//       .populate({
//         path: 'projects.skills_used', // Populate 'skills_used' within projects
//         model: 'Skill' // Ensure correct model name
//       })
//       .lean() // Convert to plain JavaScript object

//     // If user is not found, return 404
//     if (!user) {
//       console.warn(`User not found with ID: ${session.user.id}`)
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }

//     console.log(`User data fetched successfully for ID: ${session.user.id}`)

//     return NextResponse.json({ user }, { status: 200 })
//   } catch (error: any) {
//     console.error('Error fetching user data:', error)

//     // Determine the type of error and respond accordingly
//     if (error.name === 'MongoError') {
//       return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
//     }

//     return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
//   }
// }

// // src/app/api/user/me/route.ts

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '../../auth/[...nextauth]/route'
// import connectToDatabase from '@/libs/mongodb'
// import UserModel from '@/models/User'

// export async function GET(request: Request) {
//   const session = await getServerSession(authOptions)

//   if (!session || !session.user || !session.user.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   await connectToDatabase()

//   // Exclude sensitive fields directly in the query
//   const user = await UserModel.findById(session.user.id)
//     .select('-password') // Exclude 'password' field
//     .populate('skills') // Populate 'skills' field
//     .lean()

//   if (!user) {
//     return NextResponse.json({ error: 'User not found' }, { status: 404 })
//   }

//   // No need to delete fields here
//   return NextResponse.json(user, { status: 200 })
// }

// // src/app/api/user/me/route.ts

// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import User from '@/models/User'
// import connectToDatabase from '@/libs/mongodb'

// export const GET = async (req: Request) => {
//   try {
//     await connectToDatabase()

//     const session = await getServerSession(authOptions)

//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const user = await User.findById(session.user.id).exec()

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }

//     // Exclude sensitive fields like password
//     const { password, ...userData } = user.toObject()

//     return NextResponse.json(userData, { status: 200 })
//   } catch (error) {
//     console.error('Error fetching user data:', error)
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   }
// }
