// src/views/Login.tsx

'use client'

// React Imports
import { useState, useEffect } from 'react' // Added useEffect
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// NextAuth Imports
import { signIn } from 'next-auth/react'

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
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

type LoginFormData = z.infer<typeof loginSchema>

type LoginFormErrors = {
  [Key in keyof LoginFormData]?: string
}

const Login = ({ mode }: { mode: Mode }) => {
  const [errors, setErrors] = useState<LoginFormErrors>({})
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  // const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  // Initialize the session and status
  const { data: session, status } = useSession()

  // Effect to redirect authenticated users to the dashboard
  useEffect(() => {
    if (status === 'loading') return // Do nothing while session is loading
    if (session) {
      router.push('/') // Redirect to dashboard if authenticated
    }
  }, [session, status, router])

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setAuthError('')

    // Validate form data using Zod
    const result = loginSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Partial<LoginFormData> = {}
      result.error.errors.forEach(error => {
        if (error.path && error.path[0]) {
          const fieldName = error.path[0] as keyof LoginFormData
          fieldErrors[fieldName] = error.message
        }
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    } else {
      setErrors({})
    }

    const res = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password
    })

    setLoading(false)

    if (res?.error) {
      setAuthError(res.error)
    } else {
      router.push('/')
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋`}</Typography>
              <Typography className='mbs-1'>Please sign in to your account and start the adventure</Typography>
            </div>
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
              <TextField
                fullWidth
                label='Password'
                id='outlined-adornment-password'
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
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                <FormControlLabel control={<Checkbox />} label='Remember me' />
                <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Forgot password?
                </Typography>
              </div>
              {authError && <FormHelperText error>{authError}</FormHelperText>}
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>New on our platform?</Typography>
                <Typography component={Link} href='/register' color='primary'>
                  Create an account
                </Typography>
              </div>
              <Divider className='gap-3'>or</Divider>
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

export default Login

// // src/views/Login.tsx

// 'use client'

// // React Imports
// import { useState } from 'react'
// import type { FormEvent } from 'react'

// // Next Imports
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'

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
// import Logo from '@components/layout/shared/Logo'
// import Illustrations from '@components/Illustrations'

// // Config Imports
// import themeConfig from '@configs/themeConfig'

// // Hook Imports
// import { useImageVariant } from '@core/hooks/useImageVariant'

// const Login = ({ mode }: { mode: Mode }) => {
//   // States
//   const [isPasswordShown, setIsPasswordShown] = useState(false)

//   // Vars
//   const darkImg = '/images/pages/auth-v1-mask-dark.png'
//   const lightImg = '/images/pages/auth-v1-mask-light.png'

//   // Hooks
//   const router = useRouter()
//   const authBackground = useImageVariant(mode, lightImg, darkImg)

//   const handleClickShowPassword = () => setIsPasswordShown(show => !show)

//   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     router.push('/')
//   }

//   return (
//     <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
//       <Card className='flex flex-col sm:is-[450px]'>
//         <CardContent className='p-6 sm:!p-12'>
//           <Link href='/' className='flex justify-center items-center mbe-6'>
//             <Logo />
//           </Link>
//           <div className='flex flex-col gap-5'>
//             <div>
//               <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
//               <Typography className='mbs-1'>Please sign-in to your account and start the adventure</Typography>
//             </div>
//             <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
//               <TextField autoFocus fullWidth label='Email' />
//               <TextField
//                 fullWidth
//                 label='Password'
//                 id='outlined-adornment-password'
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
//               <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
//                 <FormControlLabel control={<Checkbox />} label='Remember me' />
//                 <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
//                   Forgot password?
//                 </Typography>
//               </div>
//               <Button fullWidth variant='contained' type='submit'>
//                 Log In
//               </Button>
//               <div className='flex justify-center items-center flex-wrap gap-2'>
//                 <Typography>New on our platform?</Typography>
//                 <Typography component={Link} href='/register' color='primary'>
//                   Create an account
//                 </Typography>
//               </div>
//               <Divider className='gap-3'>or</Divider>
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

// export default Login
