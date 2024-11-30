// src/types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      username?: string
      role?: string
      firstName?: string
      lastName?: string
      profilePicture?: string
      mode?: string
      otp_expiry?: string
      emailVerified?: Date | null
      passwordResetToken?: string
      passwordResetExpires?: Date
      // Include other custom properties here
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    email: string
    emailVerified?: Date | null
    username?: string
    role?: string
    firstName?: string
    lastName?: string
    passwordResetToken?: string
    passwordResetExpires?: Date
    otp?: string
    otp_expiry?: string
    // Include other custom properties here
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    uid: string
    role?: string
    firstName?: string
    lastName?: string
    emailVerified?: Date | null
    passwordResetToken?: string
    passwordResetExpires?: Date
    // Include other custom properties here
  }
}
