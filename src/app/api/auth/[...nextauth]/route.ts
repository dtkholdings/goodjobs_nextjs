// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth'
import type { NextAuthOptions, Session, User, SessionStrategy } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import UserModel from '@/models/User'
import CompanyModel from '@/models/Company' // Import the Company model
import bcrypt from 'bcryptjs'
import connectToDatabase from '@/libs/mongodb'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        await connectToDatabase()

        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password in credentials.')
          throw new Error('Email and Password are required')
        }

        const user = await UserModel.findOne({ email: credentials.email })
          .select('+password') // Ensure 'password' field is selected
          .exec()

        if (!user) {
          console.log(`No user found with email: ${credentials.email}`)
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          console.log('Invalid password for user:', user.email)
          throw new Error('Invalid email or password')
        }

        // // Check if email is verified
        // if (!user.emailVerified) {
        //   throw new Error('Email not verified')
        // }

        console.log('User authenticated successfully:', user.email)

        // Query the Company model to find all companies where the user is an admin
        const companies = await CompanyModel.find({ admins: user._id }).exec()
        const companyIds = companies.map(company => company._id.toString())

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username || '',
          role: user.role || 'User',
          emailVerified: user.emailVerified, // Include this line
          firstName: user.first_name,
          lastName: user.last_name,
          profilePicture: user.profile_picture, // Include profile picture URL
          companyIds // Include companyIds array
          // Include other fields as needed
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as SessionStrategy
  },
  pages: {
    signIn: '/login'
    // You can define other custom pages here
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User & { companyIds?: string[] } }) {
      if (user) {
        token.uid = user.id
        token.username = user.username
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.profilePicture = user.profilePicture
        token.emailVerified = user.emailVerified
        token.companyIds = user.companyIds || [] // Include companyIds array
        // Include other fields as needed
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.uid as string
        session.user.username = token.username as string
        session.user.role = token.role as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.profilePicture = token.profilePicture as string
        session.user.emailVerified = token.emailVerified as Date | undefined
        ;(session as any).companyIds = token.companyIds as string[] // Include companyIds array
        // Include other fields as needed
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// // src/app/api/auth/[...nextauth]/route.ts

// import NextAuth from 'next-auth'
// import type { NextAuthOptions, Session, User, SessionStrategy } from 'next-auth'
// import type { JWT } from 'next-auth/jwt'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import UserModel from '@/models/User'
// import CompanyModel from '@/models/Company' // Import the Company model
// import bcrypt from 'bcryptjs'
// import connectToDatabase from '@/libs/mongodb'

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize(credentials) {
//         await connectToDatabase()

//         if (!credentials?.email || !credentials?.password) {
//           console.log('Missing email or password in credentials.')
//           throw new Error('Email and Password are required')
//         }

//         const user = await UserModel.findOne({ email: credentials.email })
//           .select('+password') // Ensure 'password' field is selected
//           .exec()

//         if (!user) {
//           console.log(`No user found with email: ${credentials.email}`)
//           throw new Error('Invalid email or password')
//         }

//         const isValid = await bcrypt.compare(credentials.password, user.password)

//         if (!isValid) {
//           console.log('Invalid password for user:', user.email)
//           throw new Error('Invalid email or password')
//         }

//         // // Check if email is verified
//         // if (!user.emailVerified) {
//         //   throw new Error('Email not verified')
//         // }

//         console.log('User authenticated successfully:', user.email)

//         // Query the Company model to find all companies where the user is an admin
//         const companies = await CompanyModel.find({ admins: user._id }).exec()
//         const companyIds = companies.map(company => company._id.toString())

//         return {
//           id: user._id.toString(),
//           email: user.email,
//           username: user.username || '',
//           role: user.role || 'User',
//           emailVerified: user.emailVerified, // Include this line
//           firstName: user.first_name,
//           lastName: user.last_name,
//           profilePicture: user.profile_picture, // Include profile picture URL
//           companyIds // Include companyIds array

//           // Include other fields as needed
//         }
//       }
//     })
//   ],
//   session: {
//     strategy: 'jwt' as SessionStrategy
//   },
//   pages: {
//     signIn: '/login'
//     // You can define other custom pages here
//   },
//   callbacks: {
//     async jwt({ token, user }: { token: JWT; user?: User & { companyIds?: string[] } }) {
//       if (user) {
//         token.uid = user.id
//         token.username = (user as any).username
//         token.role = (user as any).role
//         token.firstName = (user as any).firstName
//         token.lastName = (user as any).lastName
//         token.profilePicture = (user as any).profilePicture // Include profile picture
//         token.emailVerified = user.emailVerified
//         token.companyIds = user.companyIds || []
//         // Include other fields as needed
//       }
//       return token
//     },
//     async session({ session, token }: { session: Session; token: JWT }) {
//       if (token && session.user) {
//         session.user.id = token.uid as string
//         session.user.username = token.username as string
//         session.user.role = token.role as string
//         session.user.firstName = token.firstName as string
//         session.user.lastName = token.lastName as string
//         session.user.profilePicture = token.profilePicture as string // Include profile picture
//         session.user.emailVerified = token.emailVerified as Date | undefined
//         ;(session as any).companyIds = token.companyIds as string[]
//         // Include other fields as needed
//       }
//       return session
//     }
//   },
//   secret: process.env.NEXTAUTH_SECRET
// }

// const handler = NextAuth(authOptions)

// export { handler as GET, handler as POST }
