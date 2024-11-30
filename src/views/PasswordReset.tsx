'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

import * as yup from 'yup'
import { useFormik } from 'formik'

import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'
import { useImageVariant } from '@core/hooks/useImageVariant'

// Type Imports
import type { Mode } from '@core/types'

const PasswordReset = ({ mode }: { mode: Mode }) => {
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid password reset link.')
    }
  }, [token, email])

  const validationSchema = yup.object({
    newPassword: yup
      .string()
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/\d/, 'Password must contain at least one number')
      .matches(/[@$!%*?&#]/, 'Password must contain at least one special character'),
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your new password')
  })

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmNewPassword: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null)
        setMessage(null)
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            token,
            newPassword: values.newPassword
          })
        })
        const data = await res.json()
        if (res.ok) {
          setMessage(data.message)
          // Optionally, redirect to login after a short delay
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setError(data.message || 'Something went wrong')
        }
      } catch (err) {
        setError('Something went wrong')
      } finally {
        setSubmitting(false)
      }
    }
  })

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Reset Password 🔒</Typography>
          <div className='flex flex-col gap-5'>
            {error && <Alert severity='error'>{error}</Alert>}
            {message && <Alert severity='success'>{message}</Alert>}
            {!error && (
              <>
                <Typography className='mbs-1'>You can create a new password for your account</Typography>
                <form onSubmit={formik.handleSubmit} className='flex flex-col gap-5'>
                  <TextField
                    fullWidth
                    id='newPassword'
                    name='newPassword'
                    label='New Password'
                    type='password'
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                    helperText={formik.touched.newPassword && formik.errors.newPassword}
                  />
                  <TextField
                    fullWidth
                    id='confirmNewPassword'
                    name='confirmNewPassword'
                    label='Confirm New Password'
                    type='password'
                    value={formik.values.confirmNewPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.confirmNewPassword && Boolean(formik.errors.confirmNewPassword)}
                    helperText={formik.touched.confirmNewPassword && formik.errors.confirmNewPassword}
                  />
                  <Button fullWidth variant='contained' type='submit' disabled={formik.isSubmitting}>
                    Reset Password
                  </Button>
                  <Typography className='flex justify-center items-center' color='primary'>
                    <Link href='/login' className='flex items-center'>
                      <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                      <span>Back to Login</span>
                    </Link>
                  </Typography>
                </form>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default PasswordReset

// //  src/views/PasswordReset.tsx

// 'use client'

// // Next Imports
// import Link from 'next/link'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import Button from '@mui/material/Button'

// // Type Imports
// import type { Mode } from '@core/types'

// // Component Imports
// import Form from '@components/Form'
// import DirectionalIcon from '@components/DirectionalIcon'
// import Illustrations from '@components/Illustrations'
// import Logo from '@components/layout/shared/Logo'

// // Hook Imports
// import { useImageVariant } from '@core/hooks/useImageVariant'

// const PasswordReset = ({ mode }: { mode: Mode }) => {
//   // Vars
//   const darkImg = '/images/pages/auth-v1-mask-dark.png'
//   const lightImg = '/images/pages/auth-v1-mask-light.png'

//   // Hooks
//   const authBackground = useImageVariant(mode, lightImg, darkImg)

//   return (
//     <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
//       <Card className='flex flex-col sm:is-[450px]'>
//         <CardContent className='p-6 sm:!p-12'>
//           <Link href='/' className='flex justify-center items-center mbe-6'>
//             <Logo />
//           </Link>
//           <Typography variant='h4'>Reset Password 🔒</Typography>
//           <div className='flex flex-col gap-5'>
//             <Typography className='mbs-1'>You can create a new password for your account </Typography>
//             <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
//               <TextField autoFocus fullWidth label='New Password' />
//               <TextField autoFocus fullWidth label='Confirm New Password' />
//               <Button fullWidth variant='contained' type='submit'>
//                 Reset Password
//               </Button>
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
//       <Illustrations maskImg={{ src: authBackground }} />
//     </div>
//   )
// }

// export default PasswordReset
