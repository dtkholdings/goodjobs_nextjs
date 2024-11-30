// src/views/VerifyEmail.tsx

'use client'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

import type { Mode } from '@core/types'

const VerifyEmail = ({ mode }: { mode: Mode }) => {
  // Next Auth Session
  const { data: session, status, update } = useSession()
  const router = useRouter()

  // State
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiLoading, setApiLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Image URLs based on mode
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Session and Redirection Handling
  useEffect(() => {
    console.log('Session Status:', status)
    console.log('Session Data:', session)

    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    } else if (session.user.emailVerified) {
      // If email is already verified, redirect to dashboard
      console.log('Email is verified. Redirecting to dashboard.')
      router.push('/')
    } else {
      setEmail(session.user.email)
      setLoading(false)
    }
  }, [session, status, router])

  // Cooldown Timer Handling
  useEffect(() => {
    if (cooldown > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setCooldown(prevCooldown => {
          if (prevCooldown <= 1) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            return 0
          }
          return prevCooldown - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [cooldown])

  const handleRequestOtp = async () => {
    try {
      setApiLoading(true)
      const response = await axios.post('/api/auth/request-otp')
      setOtpSent(true)
      setMessage(response.data.message)
      setCooldown(60) // Start 60 seconds cooldown
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to send OTP. Please try again.')
    } finally {
      setApiLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setMessage('Please enter the OTP.')
      return
    }

    try {
      setApiLoading(true)
      const response = await axios.post('/api/auth/verify-otp', { otp })
      setMessage(response.data.message)
      console.log('OTP Verification Response:', response.data)

      // Refresh the session to update emailVerified status
      await update()
      console.log('Session after update:', session)

      // Force a session refresh to ensure updated data is fetched
      router.refresh()
      // Logout the user after verifying OTP
      await signOut({ redirect: true, callbackUrl: '/' }) // Redirect to dashboard or desired page
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to verify OTP. Please try again.')
      console.error('Verify OTP Error:', error)
    } finally {
      setApiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center items-center min-h-screen p-6'>
      <Card className='flex flex-col sm:w-[450px]'>
        <CardContent className='p-6 sm:p-12'>
          <Link href='/' className='flex justify-center items-center mb-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Verify Email 📧</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mt-2'>
              {otpSent ? 'Enter the OTP sent to your email.' : 'Click the button to request an OTP.'}
            </Typography>
            <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
              <TextField fullWidth label='Email' value={email} disabled />

              {otpSent && (
                <TextField fullWidth label='OTP' value={otp} onChange={e => setOtp(e.target.value)} required />
              )}

              <Button
                fullWidth
                variant='contained'
                onClick={otpSent ? handleVerifyOtp : handleRequestOtp}
                disabled={apiLoading || (!otpSent && cooldown > 0)}
              >
                {apiLoading ? (
                  <CircularProgress size={24} />
                ) : otpSent ? (
                  'Verify OTP'
                ) : cooldown > 0 ? (
                  `Request OTP (${cooldown}s)`
                ) : (
                  'Request OTP'
                )}
              </Button>

              {/* Cooldown Message */}
              {otpSent && cooldown > 0 && (
                <Typography variant='body2' color='textSecondary' align='center'>
                  You can request a new OTP in {cooldown} second{cooldown !== 1 ? 's' : ''}
                </Typography>
              )}

              {/* Resend OTP Button */}
              {otpSent && cooldown === 0 && (
                <Button fullWidth variant='outlined' onClick={handleRequestOtp} disabled={apiLoading}>
                  Resend OTP
                </Button>
              )}

              {/* Message Display */}
              {message && (
                <Typography
                  color={message.includes('successfully') || message.includes('already verified') ? 'primary' : 'error'}
                  align='center'
                >
                  {message}
                </Typography>
              )}

              {/* Back to Login Link */}
              <Typography className='flex justify-center items-center' color='primary'>
                <Link href='/login' className='flex items-center'>
                  <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                  <span>Back to Login</span>
                </Link>
              </Typography>
            </Form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: mode === 'dark' ? darkImg : lightImg }} />
    </div>
  )
}

export default VerifyEmail

// // views/VerifyEmail.tsx
// 'use client'

// // Next Imports
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { useSession, signIn } from 'next-auth/react'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import Button from '@mui/material/Button'

// // Component Imports
// import Form from '@components/Form'
// import DirectionalIcon from '@components/DirectionalIcon'
// import Illustrations from '@components/Illustrations'
// import Logo from '@components/layout/shared/Logo'

// // Hook Imports
// import { useState, useEffect } from 'react'
// import axios from 'axios'

// import type { Mode } from '@core/types'

// const VerifyEmail = ({ mode }: { mode: Mode }) => {
//   // Next Auth Session
//   const { data: session, status } = useSession()
//   const router = useRouter()

//   // State
//   const [otp, setOtp] = useState('')
//   const [otpSent, setOtpSent] = useState(false)
//   const [message, setMessage] = useState('')
//   const [loading, setLoading] = useState(true)
//   const [email, setEmail] = useState('')

//   // Vars
//   const darkImg = '/images/pages/auth-v1-mask-dark.png'
//   const lightImg = '/images/pages/auth-v1-mask-light.png'

//   useEffect(() => {
//     if (status === 'loading') return
//     if (!session) {
//       router.push('/login')
//     } else {
//       setEmail(session.user.email)
//       setLoading(false)
//     }
//   }, [session, status])

//   const handleRequestOtp = async () => {
//     try {
//       const response = await axios.post('/api/auth/request-otp')
//       setOtpSent(true)
//       setMessage(response.data.message)
//     } catch (error) {
//       setMessage('Failed to send OTP. Please try again.')
//     }
//   }

//   const handleVerifyOtp = async () => {
//     try {
//       const response = await axios.post('/api/auth/verify-otp', { otp })
//       setMessage(response.data.message)
//       // Optionally, refresh the session to get the updated email_verified status
//       await signIn('credentials', { redirect: false })
//       // After successful verification, redirect the user
//       router.push('/')
//     } catch (error) {
//       setMessage('Failed to verify OTP. Please try again.')
//     }
//   }

//   if (loading) return null

//   return (
//     <div className='flex flex-col justify-center items-center min-h-screen p-6'>
//       <Card className='flex flex-col sm:w-[450px]'>
//         <CardContent className='p-6 sm:p-12'>
//           <Link href='/' className='flex justify-center items-center mb-6'>
//             <Logo />
//           </Link>
//           <Typography variant='h4'>Verify Email 📧</Typography>
//           <div className='flex flex-col gap-5'>
//             <Typography className='mt-2'>
//               {otpSent ? 'Enter the OTP sent to your email.' : 'Click the button to request an OTP.'}
//             </Typography>
//             <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
//               <TextField fullWidth label='Email' value={email} disabled />
//               {otpSent && <TextField fullWidth label='OTP' value={otp} onChange={e => setOtp(e.target.value)} />}
//               <Button fullWidth variant='contained' onClick={otpSent ? handleVerifyOtp : handleRequestOtp}>
//                 {otpSent ? 'Verify OTP' : 'Request OTP'}
//               </Button>
//               <Typography color='primary'>{message}</Typography>
//               <Typography className='flex justify-center items-center' color='primary'>
//                 <Link href='/login' className='flex items-center'>
//                   <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
//                   <span>Back to Login</span>
//                 </Link>
//               </Typography>
//             </Form>
//           </div>
//         </CardContent>
//       </Card>
//       <Illustrations maskImg={{ src: mode === 'dark' ? darkImg : lightImg }} />
//     </div>
//   )
// }

// export default VerifyEmail
