// src/components/account-settings/ContactInformation.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Grid, TextField, Typography, Button, CircularProgress, MenuItem, Card, Alert, Tooltip } from '@mui/material'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
// Import icons from your preferred icon library, e.g., Remix Icons
// Ensure you have included the icon library in your project
// Example with Remix Icons:
// <i className='ri-edit-2-line' />
// <i className='ri-save-line' />
// <i className='ri-close-line' />

import * as Yup from 'yup'

// Define the validation schema using Yup
const ContactInfoSchema = Yup.object().shape({
  work_email: Yup.string().email('Invalid work email format').nullable().notRequired(),
  mobile_no: Yup.string()
    .matches(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Mobile number must be 10 digits and can include country code')
    .required('Mobile number is required'),
  work_mobile_no: Yup.string()
    .matches(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Work mobile number must be 10 digits and can include country code')
    .nullable()
    .notRequired()
})

type ContactInfo = {
  email: string
  work_email: string
  mobile_no: string
  work_mobile_no: string
}

const ContactInformation: React.FC = () => {
  const { data: session, status } = useSession()
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    work_email: '',
    mobile_no: '',
    work_mobile_no: ''
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      signIn()
      return
    }

    const fetchContactInfo = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property

        setContactInfo({
          email: data.email || '',
          work_email: data.work_email || '',
          mobile_no: data.mobile_no || '',
          work_mobile_no: data.work_mobile_no || ''
        })
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching contact information:', err)
        setError('Failed to load contact information')
        setLoading(false)
      }
    }

    fetchContactInfo()
  }, [session, status])

  // Handle input changes
  const handleChange = (field: keyof ContactInfo, value: any) => {
    setContactInfo(prev => ({ ...prev, [field]: value }))
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate the form data
      await ContactInfoSchema.validate(contactInfo, { abortEarly: false })

      const dataToSubmit = {
        work_email: contactInfo.work_email,
        mobile_no: contactInfo.mobile_no,
        work_mobile_no: contactInfo.work_mobile_no
      }

      await axios.put('/api/user/update', dataToSubmit)
      setSuccess('Contact information updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else {
        console.error('Error updating contact information:', err)
        setError('Failed to update contact information')
      }

      // Auto-dismiss the error message after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  // Handle canceling edit mode
  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    setSuccess(null)
    // Optionally, refetch the data to reset the form
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user

        setContactInfo({
          email: data.email || '',
          work_email: data.work_email || '',
          mobile_no: data.mobile_no || '',
          work_mobile_no: data.work_mobile_no || ''
        })
      } catch (err: any) {
        console.error('Error refetching contact information:', err)
        setError('Failed to refetch contact information')
      }
    }

    fetchContactInfo()
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Contact Information
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Providing your contact information helps employers reach out to you efficiently. Ensure your mobile numbers and
        work email are accurate to receive timely job notifications and communications.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {/* Email (Disabled) */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Email' value={contactInfo.email} disabled />
          </Grid>
          {/* Work Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Work Email'
              value={contactInfo.work_email}
              onChange={e => handleChange('work_email', e.target.value)}
              InputProps={{
                readOnly: !isEditing
              }}
              error={Boolean(error && error.includes('work email'))}
              helperText={isEditing && error && error.includes('work email') ? 'Invalid work email format' : ''}
            />
          </Grid>
          {/* Mobile Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Mobile Number'
              value={contactInfo.mobile_no}
              onChange={e => handleChange('mobile_no', e.target.value)}
              required
              InputProps={{
                readOnly: !isEditing
              }}
              error={Boolean(error && error.includes('Mobile number'))}
              helperText={
                isEditing && error && error.includes('Mobile number')
                  ? 'Mobile number must be 10 digits and can include country code'
                  : ''
              }
            />
          </Grid>
          {/* Work Mobile Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Work Mobile Number'
              value={contactInfo.work_mobile_no}
              onChange={e => handleChange('work_mobile_no', e.target.value)}
              InputProps={{
                readOnly: !isEditing
              }}
              error={Boolean(error && error.includes('Work mobile number'))}
              helperText={
                isEditing && error && error.includes('Work mobile number')
                  ? 'Work mobile number must be 10 digits and can include country code'
                  : ''
              }
            />
          </Grid>
          {/* Feedback Messages */}
          <Grid item xs={12}>
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity='success' sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
          </Grid>
          {/* Action Buttons */}
          <Grid item xs={12}>
            {!isEditing ? (
              <Tooltip title='Edit Contact Information'>
                <Button
                  variant='outlined'
                  color='secondary'
                  startIcon={<i className='ri-edit-2-line' />}
                  onClick={() => setIsEditing(true)}
                  disabled={saving}
                >
                  Edit
                </Button>
              </Tooltip>
            ) : (
              <Grid container spacing={1}>
                <Grid item>
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    startIcon={<i className='ri-save-line' />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant='outlined'
                    color='secondary'
                    startIcon={<i className='ri-close-line' />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default ContactInformation

// // src/components/account-settings/ContactInformation.tsx

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Grid, TextField, Typography, Button, CircularProgress, Card } from '@mui/material'
// import axios from 'axios'
// import { useSession, signIn } from 'next-auth/react'

// type ContactInfo = {
//   email: string
//   work_email: string
//   mobile_no: string
//   work_mobile_no: string
// }

// const ContactInformation: React.FC = () => {
//   const { data: session, status } = useSession()
//   const [contactInfo, setContactInfo] = useState<ContactInfo>({
//     email: '',
//     work_email: '',
//     mobile_no: '',
//     work_mobile_no: ''
//   })
//   const [loading, setLoading] = useState<boolean>(true)
//   const [saving, setSaving] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)

//   useEffect(() => {
//     if (status === 'loading') return
//     if (!session) {
//       signIn()
//       return
//     }

//     const fetchContactInfo = async () => {
//       try {
//         const response = await axios.get('/api/user/me')
//         const data = response.data
//         setContactInfo({
//           email: data.email || '',
//           work_email: data.work_email || '',
//           mobile_no: data.mobile_no || '',
//           work_mobile_no: data.work_mobile_no || ''
//         })
//         setLoading(false)
//       } catch (err) {
//         console.error('Error fetching contact information:', err)
//         setError('Failed to load contact information')
//         setLoading(false)
//       }
//     }

//     fetchContactInfo()
//   }, [session, status])

//   const handleChange = (field: keyof ContactInfo, value: any) => {
//     setContactInfo(prev => ({ ...prev, [field]: value }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setSaving(true)
//     setError(null)
//     setSuccess(null)
//     try {
//       const dataToSubmit = {
//         work_email: contactInfo.work_email,
//         mobile_no: contactInfo.mobile_no,
//         work_mobile_no: contactInfo.work_mobile_no
//       }
//       await axios.put('/api/user/update', dataToSubmit)
//       setSuccess('Contact information updated successfully')
//     } catch (err) {
//       console.error('Error updating contact information:', err)
//       setError('Failed to update contact information')
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (loading) return <CircularProgress />

//   return (
//     <Card variant='outlined' sx={{ padding: 2, marginBottom: 4 }}>
//       <Typography variant='h6' gutterBottom>
//         Contact Information
//       </Typography>
//       <form onSubmit={handleSubmit}>
//         <Grid container spacing={2}>
//           {/* Email (Disabled) */}
//           <Grid item xs={12} sm={6}>
//             <TextField fullWidth label='Email' value={contactInfo.email} disabled />
//           </Grid>
//           {/* Work Email */}
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label='Work Email'
//               value={contactInfo.work_email}
//               onChange={e => handleChange('work_email', e.target.value)}
//             />
//           </Grid>
//           {/* Mobile Number */}
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label='Mobile Number'
//               value={contactInfo.mobile_no}
//               onChange={e => handleChange('mobile_no', e.target.value)}
//             />
//           </Grid>
//           {/* Work Mobile Number */}
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label='Work Mobile Number'
//               value={contactInfo.work_mobile_no}
//               onChange={e => handleChange('work_mobile_no', e.target.value)}
//             />
//           </Grid>
//           {/* Save Button */}
//           <Grid item xs={12}>
//             {error && (
//               <Typography color='error' gutterBottom>
//                 {error}
//               </Typography>
//             )}
//             {success && (
//               <Typography color='primary' gutterBottom>
//                 {success}
//               </Typography>
//             )}
//             <Button type='submit' variant='contained' color='primary' disabled={saving}>
//               {saving ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </Grid>
//         </Grid>
//       </form>
//     </Card>
//   )
// }

// export default ContactInformation
