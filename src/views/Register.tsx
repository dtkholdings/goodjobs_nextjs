// src/views/Register.tsx

'use client'

// React Imports
import { useState, useEffect } from 'react' // Added useEffect if needed
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Zod Imports
import { z } from 'zod'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// ** Updated Zod Schema **
const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the privacy policy & terms.'
    })
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  })

type RegisterFormData = z.infer<typeof registerSchema>

// ** Define Errors Type **
type FormErrors = {
  [Key in keyof RegisterFormData]?: string
}

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [success, setSuccess] = useState('')

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setAuthError('')
    setSuccess('')
    setErrors({}) // Reset previous errors

    // Validate form data using Zod
    const result = registerSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      result.error.errors.forEach(error => {
        if (error.path && error.path[0]) {
          const fieldName = error.path[0] as keyof RegisterFormData
          fieldErrors[fieldName] = error.message
        }
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          // If the API returned field-specific errors, set them
          setErrors(data.errors)
        } else if (data.error) {
          // If the API returned a general error, set authError
          setAuthError(data.error)
        } else {
          // Fallback for unexpected error structures
          setAuthError('An unexpected error occurred. Please try again.')
        }
      } else {
        setSuccess('Registration successful! Redirecting to Email Verification page...')
        setTimeout(() => {
          router.push('/verify-email')
        }, 2000)
      }
    } catch (err) {
      setAuthError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Adventure starts here 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Username'
                name='username'
                value={formData.username}
                onChange={handleChange}
                error={Boolean(errors.username)}
                helperText={errors.username}
              />
              <TextField
                fullWidth
                label='Email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
              <TextField
                fullWidth
                label='Password'
                name='password'
                type={isPasswordShown ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={Boolean(errors.password)}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label='Confirm Password'
                name='confirmPassword'
                type={isPasswordShown ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FormControlLabel
                control={<Checkbox checked={formData.agreeTerms} onChange={handleChange} name='agreeTerms' />}
                label={
                  <>
                    <span>I agree to </span>
                    <Link className='text-primary' href='/terms' target='_blank'>
                      privacy policy & terms
                    </Link>
                  </>
                }
              />
              {errors.agreeTerms && <FormHelperText error>{errors.agreeTerms}</FormHelperText>}
              {errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
              {errors.username && <FormHelperText error>{errors.username}</FormHelperText>}
              {authError && <FormHelperText error>{authError}</FormHelperText>}
              {success && <FormHelperText>{success}</FormHelperText>}
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href='/login' color='primary'>
                  Sign in instead
                </Typography>
              </div>
              <Divider className='gap-3'>Or</Divider>
              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook'>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter'>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github'>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus'>
                  <i className='ri-google-fill' />
                </IconButton>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Register

// // src/views/Register.tsx

// 'use client'

// // React Imports
// import { useState } from 'react'
// import type { FormEvent } from 'react'

// // Next Imports
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'

// // Zod Imports
// import { z } from 'zod'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import IconButton from '@mui/material/IconButton'
// import InputAdornment from '@mui/material/InputAdornment'
// import Checkbox from '@mui/material/Checkbox'
// import Button from '@mui/material/Button'
// import FormControlLabel from '@mui/material/FormControlLabel'
// import Divider from '@mui/material/Divider'
// import FormHelperText from '@mui/material/FormHelperText'

// // Type Imports
// import type { Mode } from '@core/types'

// // Component Imports
// import Illustrations from '@components/Illustrations'
// import Logo from '@components/layout/shared/Logo'

// // Hook Imports
// import { useImageVariant } from '@core/hooks/useImageVariant'

// // ** Updated Zod Schema **
// const registerSchema = z
//   .object({
//     username: z.string().min(3, 'Username must be at least 3 characters long'),
//     email: z.string().email('Invalid email address'),
//     password: z.string().min(6, 'Password must be at least 6 characters long'),
//     confirmPassword: z.string(),
//     agreeTerms: z.boolean().refine(val => val === true, {
//       message: 'You must agree to the privacy policy & terms.'
//     })
//   })
//   .refine(data => data.password === data.confirmPassword, {
//     path: ['confirmPassword'],
//     message: 'Passwords do not match'
//   })

// type RegisterFormData = z.infer<typeof registerSchema>

// // ** Define Errors Type **
// type FormErrors = {
//   [Key in keyof RegisterFormData]?: string
// }

// const Register = ({ mode }: { mode: Mode }) => {
//   // States
//   const [isPasswordShown, setIsPasswordShown] = useState(false)
//   const [formData, setFormData] = useState<RegisterFormData>({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     agreeTerms: false
//   })
//   const [errors, setErrors] = useState<FormErrors>({})
//   const [loading, setLoading] = useState(false)
//   const [authError, setAuthError] = useState('')
//   const [success, setSuccess] = useState('')

//   // Vars
//   const darkImg = '/images/pages/auth-v1-mask-dark.png'
//   const lightImg = '/images/pages/auth-v1-mask-light.png'

//   // Hooks
//   const router = useRouter()
//   const authBackground = useImageVariant(mode, lightImg, darkImg)

//   const handleClickShowPassword = () => setIsPasswordShown(show => !show)

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }))
//   }

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setLoading(true)
//     setAuthError('')
//     setSuccess('')

//     // Validate form data using Zod
//     const result = registerSchema.safeParse(formData)

//     if (!result.success) {
//       const fieldErrors: FormErrors = {}
//       result.error.errors.forEach(error => {
//         if (error.path && error.path[0]) {
//           const fieldName = error.path[0] as keyof RegisterFormData
//           fieldErrors[fieldName] = error.message
//         }
//       })
//       setErrors(fieldErrors)
//       setLoading(false)
//       return
//     } else {
//       setErrors({})
//     }

//     try {
//       const res = await fetch('/api/auth/signup', {
//         method: 'POST',
//         body: JSON.stringify({
//           username: formData.username,
//           email: formData.email,
//           password: formData.password
//         }),
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       })

//       const data = await res.json()

//       if (!res.ok) {
//         setAuthError(data.error || 'An error occurred. Please try again.')
//       } else {
//         setSuccess('Registration successful! Redirecting to login page...')
//         setTimeout(() => {
//           router.push('/login')
//         }, 2000)
//       }
//     } catch (err) {
//       setAuthError('An error occurred. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
//       <Card className='flex flex-col sm:is-[450px]'>
//         <CardContent className='p-6 sm:!p-12'>
//           <Link href='/' className='flex justify-center items-start mbe-6'>
//             <Logo />
//           </Link>
//           <Typography variant='h4'>Adventure starts here 🚀</Typography>
//           <div className='flex flex-col gap-5'>
//             <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
//             <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
//               <TextField
//                 autoFocus
//                 fullWidth
//                 label='Username'
//                 name='username'
//                 value={formData.username}
//                 onChange={handleChange}
//                 error={Boolean(errors.username)}
//                 helperText={errors.username}
//               />
//               <TextField
//                 fullWidth
//                 label='Email'
//                 type='email'
//                 name='email'
//                 value={formData.email}
//                 onChange={handleChange}
//                 error={Boolean(errors.email)}
//                 helperText={errors.email}
//               />
//               <TextField
//                 fullWidth
//                 label='Password'
//                 name='password'
//                 type={isPasswordShown ? 'text' : 'password'}
//                 value={formData.password}
//                 onChange={handleChange}
//                 error={Boolean(errors.password)}
//                 helperText={errors.password}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position='end'>
//                       <IconButton
//                         size='small'
//                         edge='end'
//                         onClick={handleClickShowPassword}
//                         onMouseDown={e => e.preventDefault()}
//                       >
//                         <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                       </IconButton>
//                     </InputAdornment>
//                   )
//                 }}
//               />
//               <TextField
//                 fullWidth
//                 label='Confirm Password'
//                 name='confirmPassword'
//                 type={isPasswordShown ? 'text' : 'password'}
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 error={Boolean(errors.confirmPassword)}
//                 helperText={errors.confirmPassword}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position='end'>
//                       <IconButton
//                         size='small'
//                         edge='end'
//                         onClick={handleClickShowPassword}
//                         onMouseDown={e => e.preventDefault()}
//                       >
//                         <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                       </IconButton>
//                     </InputAdornment>
//                   )
//                 }}
//               />
//               <FormControlLabel
//                 control={<Checkbox checked={formData.agreeTerms} onChange={handleChange} name='agreeTerms' />}
//                 label={
//                   <>
//                     <span>I agree to </span>
//                     <Link className='text-primary' href='/terms' target='_blank'>
//                       privacy policy & terms
//                     </Link>
//                   </>
//                 }
//               />
//               {errors.agreeTerms && <FormHelperText error>{errors.agreeTerms}</FormHelperText>}
//               {authError && <FormHelperText error>{authError}</FormHelperText>}
//               {success && <FormHelperText>{success}</FormHelperText>}
//               <Button fullWidth variant='contained' type='submit' disabled={loading}>
//                 {loading ? 'Signing Up...' : 'Sign Up'}
//               </Button>
//               <div className='flex justify-center items-center flex-wrap gap-2'>
//                 <Typography>Already have an account?</Typography>
//                 <Typography component={Link} href='/login' color='primary'>
//                   Sign in instead
//                 </Typography>
//               </div>
//               <Divider className='gap-3'>Or</Divider>
//               <div className='flex justify-center items-center gap-2'>
//                 <IconButton size='small' className='text-facebook'>
//                   <i className='ri-facebook-fill' />
//                 </IconButton>
//                 <IconButton size='small' className='text-twitter'>
//                   <i className='ri-twitter-fill' />
//                 </IconButton>
//                 <IconButton size='small' className='text-github'>
//                   <i className='ri-github-fill' />
//                 </IconButton>
//                 <IconButton size='small' className='text-googlePlus'>
//                   <i className='ri-google-fill' />
//                 </IconButton>
//               </div>
//             </form>
//           </div>
//         </CardContent>
//       </Card>
//       <Illustrations maskImg={{ src: authBackground }} />
//     </div>
//   )
// }

// export default Register

// 'use client'

// // React Imports
// import { useState } from 'react'

// // Next Imports
// import Link from 'next/link'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import IconButton from '@mui/material/IconButton'
// import InputAdornment from '@mui/material/InputAdornment'
// import Checkbox from '@mui/material/Checkbox'
// import Button from '@mui/material/Button'
// import FormControlLabel from '@mui/material/FormControlLabel'
// import Divider from '@mui/material/Divider'

// // Type Imports
// import type { Mode } from '@core/types'

// // Component Imports
// import Illustrations from '@components/Illustrations'
// import Logo from '@components/layout/shared/Logo'

// // Hook Imports
// import { useImageVariant } from '@core/hooks/useImageVariant'

// const Register = ({ mode }: { mode: Mode }) => {
//   // States
//   const [isPasswordShown, setIsPasswordShown] = useState(false)

//   // Vars
//   const darkImg = '/images/pages/auth-v1-mask-dark.png'
//   const lightImg = '/images/pages/auth-v1-mask-light.png'

//   // Hooks
//   const authBackground = useImageVariant(mode, lightImg, darkImg)

//   const handleClickShowPassword = () => setIsPasswordShown(show => !show)

//   return (
//     <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
//       <Card className='flex flex-col sm:is-[450px]'>
//         <CardContent className='p-6 sm:!p-12'>
//           <Link href='/' className='flex justify-center items-start mbe-6'>
//             <Logo />
//           </Link>
//           <Typography variant='h4'>Adventure starts here 🚀</Typography>
//           <div className='flex flex-col gap-5'>
//             <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
//             <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
//               <TextField autoFocus fullWidth label='Username' />
//               <TextField fullWidth label='Email' />
//               <TextField
//                 fullWidth
//                 label='Password'
//                 type={isPasswordShown ? 'text' : 'password'}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position='end'>
//                       <IconButton
//                         size='small'
//                         edge='end'
//                         onClick={handleClickShowPassword}
//                         onMouseDown={e => e.preventDefault()}
//                       >
//                         <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                       </IconButton>
//                     </InputAdornment>
//                   )
//                 }}
//               />
//               <FormControlLabel
//                 control={<Checkbox />}
//                 label={
//                   <>
//                     <span>I agree to </span>
//                     <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
//                       privacy policy & terms
//                     </Link>
//                   </>
//                 }
//               />
//               <Button fullWidth variant='contained' type='submit'>
//                 Sign Up
//               </Button>
//               <div className='flex justify-center items-center flex-wrap gap-2'>
//                 <Typography>Already have an account?</Typography>
//                 <Typography component={Link} href='/login' color='primary'>
//                   Sign in instead
//                 </Typography>
//               </div>
//               <Divider className='gap-3'>Or</Divider>
//               <div className='flex justify-center items-center gap-2'>
//                 <IconButton size='small' className='text-facebook'>
//                   <i className='ri-facebook-fill' />
//                 </IconButton>
//                 <IconButton size='small' className='text-twitter'>
//                   <i className='ri-twitter-fill' />
//                 </IconButton>
//                 <IconButton size='small' className='text-github'>
//                   <i className='ri-github-fill' />
//                 </IconButton>
//                 <IconButton size='small' className='text-googlePlus'>
//                   <i className='ri-google-fill' />
//                 </IconButton>
//               </div>
//             </form>
//           </div>
//         </CardContent>
//       </Card>
//       <Illustrations maskImg={{ src: authBackground }} />
//     </div>
//   )
// }

// export default Register
