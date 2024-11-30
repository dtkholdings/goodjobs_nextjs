// src/views/ForgotPassword.tsx

'use client'

import { useState } from 'react'
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

const ForgotPassword = ({ mode }: { mode: Mode }) => {
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validationSchema = yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required')
  })

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null)
        setMessage(null)
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        })
        const data = await res.json()
        if (res.ok) {
          setMessage(data.message)
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
          <Typography variant='h4'>Forgot Password 🔒</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>
              Enter your email and we&#39;ll send you instructions to reset your password
            </Typography>
            {message && <Alert severity='success'>{message}</Alert>}
            {error && <Alert severity='error'>{error}</Alert>}
            <form onSubmit={formik.handleSubmit} className='flex flex-col gap-5'>
              <TextField
                fullWidth
                id='email'
                name='email'
                label='Email'
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <Button fullWidth variant='contained' type='submit' disabled={formik.isSubmitting}>
                Send reset link
              </Button>
              <Typography className='flex justify-center items-center' color='primary'>
                <Link href='/login' className='flex items-center'>
                  <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                  <span>Back to Login</span>
                </Link>
              </Typography>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default ForgotPassword

// // src/views/ForgotPassword.tsx

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

// const ForgotPassword = ({ mode }: { mode: Mode }) => {
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
//           <Typography variant='h4'>Forgot Password 🔒</Typography>
//           <div className='flex flex-col gap-5'>
//             <Typography className='mbs-1'>
//               Enter your email and we&#39;ll send you instructions to reset your password
//             </Typography>
//             <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
//               <TextField autoFocus fullWidth label='Email' />
//               <Button fullWidth variant='contained' type='submit'>
//                 Send reset link
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

// export default ForgotPassword
