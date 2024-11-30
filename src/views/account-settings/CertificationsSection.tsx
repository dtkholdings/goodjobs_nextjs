// src/components/account-settings/CertificationsSection.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  Grid,
  TextField,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
import * as Yup from 'yup'

// Define the validation schema using Yup
const CertificationSchema = Yup.object().shape({
  certifications: Yup.array()
    .of(
      Yup.object().shape({
        certification_name: Yup.string().required('Certification Name is required'),
        certification_authority: Yup.string().required('Certification Authority is required'),
        obtained_date: Yup.date()
          .nullable()
          .typeError('Obtained Date is required')
          .required('Obtained Date is required')
          .max(new Date(), 'Obtained Date cannot be in the future'),
        expiry_date: Yup.date()
          .nullable()
          .typeError('Expiry Date must be a valid date')
          .min(Yup.ref('obtained_date'), 'Expiry Date cannot be before Obtained Date')
          .max(new Date(), 'Expiry Date cannot be in the future'),
        credential_url: Yup.string().url('Credential URL must be a valid URL').nullable(),
        description: Yup.string().max(500, 'Description cannot exceed 500 characters').nullable()
      })
    )
    .min(1, 'At least one certification is required')
})

type Certification = {
  certification_name: string
  certification_authority: string
  obtained_date: Dayjs | null
  expiry_date: Dayjs | null
  credential_url: string
  description: string
}

const CertificationsSection: React.FC = () => {
  const { data: session, status } = useSession()
  const [certifications, setCertifications] = useState<Certification[]>([])
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

    const fetchCertifications = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property

        setCertifications(
          data.certifications
            ? data.certifications.map((cert: any) => ({
                certification_name: cert.certification_name || '',
                certification_authority: cert.certification_authority || '',
                obtained_date: cert.obtained_date ? dayjs(cert.obtained_date) : null,
                expiry_date: cert.expiry_date ? dayjs(cert.expiry_date) : null,
                credential_url: cert.credential_url || '',
                description: cert.description || ''
              }))
            : []
        )
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching certifications:', err)
        setError('Failed to load certifications')
        setLoading(false)
      }
    }

    fetchCertifications()
  }, [session, status])

  // Handle input changes
  const handleChange = (index: number, field: keyof Certification, value: any) => {
    const updatedCertifications = [...certifications]
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      [field]: value
    }
    setCertifications(updatedCertifications)
  }

  // Handle adding a new certification entry
  const handleAdd = () => {
    setCertifications([
      ...certifications,
      {
        certification_name: '',
        certification_authority: '',
        obtained_date: null,
        expiry_date: null,
        credential_url: '',
        description: ''
      }
    ])
    setIsEditing(true)
  }

  // Handle removing a certification entry
  const handleRemove = (index: number) => {
    const updatedCertifications = [...certifications]
    updatedCertifications.splice(index, 1)
    setCertifications(updatedCertifications)
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // Validate the form data
      await CertificationSchema.validate({ certifications }, { abortEarly: false })

      const dataToSubmit = {
        certifications: certifications.map(cert => ({
          certification_name: cert.certification_name,
          certification_authority: cert.certification_authority,
          obtained_date: cert.obtained_date ? cert.obtained_date.toISOString() : null,
          expiry_date: cert.expiry_date ? cert.expiry_date.toISOString() : null,
          credential_url: cert.credential_url || null,
          description: cert.description || null
        }))
      }

      await axios.put('/api/user/update', dataToSubmit)
      setSuccess('Certifications updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else {
        console.error('Error updating certifications:', err)
        setError('Failed to update certifications')
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
    const fetchCertifications = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user

        setCertifications(
          data.certifications
            ? data.certifications.map((cert: any) => ({
                certification_name: cert.certification_name || '',
                certification_authority: cert.certification_authority || '',
                obtained_date: cert.obtained_date ? dayjs(cert.obtained_date) : null,
                expiry_date: cert.expiry_date ? dayjs(cert.expiry_date) : null,
                credential_url: cert.credential_url || '',
                description: cert.description || ''
              }))
            : []
        )
      } catch (err: any) {
        console.error('Error refetching certifications:', err)
        setError('Failed to refetch certifications')
      }
    }

    fetchCertifications()
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Certifications
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Providing your certifications helps employers recognize your qualifications and expertise. Ensure your
        certification details are accurate to receive relevant job opportunities.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {certifications.map((cert, index) => (
            <Card
              key={index}
              variant='outlined'
              sx={{ padding: 2, marginBottom: 2, width: '100%', position: 'relative' }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  {/* Certification Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Certification Name'
                      value={cert.certification_name}
                      onChange={e => handleChange(index, 'certification_name', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Certification Name') && isEditing)}
                      helperText={
                        isEditing && error && error.includes('Certification Name')
                          ? 'Certification Name is required'
                          : ''
                      }
                    />
                  </Grid>
                  {/* Certification Authority */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Certification Authority'
                      value={cert.certification_authority}
                      onChange={e => handleChange(index, 'certification_authority', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Certification Authority') && isEditing)}
                      helperText={
                        isEditing && error && error.includes('Certification Authority')
                          ? 'Certification Authority is required'
                          : ''
                      }
                    />
                  </Grid>
                  {/* Obtained Date */}
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Obtained Date'
                        value={cert.obtained_date}
                        onChange={(date: Dayjs | null) => handleChange(index, 'obtained_date', date)}
                        disabled={!isEditing}
                        slotProps={{
                          textField: {
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  {/* Expiry Date */}
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Expiry Date'
                        value={cert.expiry_date}
                        onChange={(date: Dayjs | null) => handleChange(index, 'expiry_date', date)}
                        disabled={!isEditing}
                        slotProps={{
                          textField: {
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  {/* Credential URL */}
                  <Grid item xs={12} sm={12}>
                    <TextField
                      fullWidth
                      label='Credential URL'
                      value={cert.credential_url}
                      onChange={e => handleChange(index, 'credential_url', e.target.value)}
                      type='url'
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Credential URL') && isEditing)}
                      helperText={
                        isEditing && error && error.includes('Credential URL')
                          ? 'Credential URL must be a valid URL'
                          : ''
                      }
                    />
                  </Grid>
                  {/* Description */}
                  <Grid item xs={12} sm={12}>
                    <TextField
                      fullWidth
                      label='Description'
                      multiline
                      rows={3}
                      value={cert.description}
                      onChange={e => handleChange(index, 'description', e.target.value)}
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Description') && isEditing)}
                      helperText={
                        isEditing && error && error.includes('Description')
                          ? 'Description cannot exceed 500 characters'
                          : ''
                      }
                    />
                  </Grid>
                  {/* Remove Button */}
                  {isEditing && (
                    <Grid item xs={12}>
                      <Tooltip title='Remove Certification Entry'>
                        <IconButton
                          color='error'
                          onClick={() => handleRemove(index)}
                          aria-label='Remove Certification Entry'
                        >
                          <i className='ri-delete-bin-5-line' />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ))}
          {/* Add Button */}
          {!isEditing && (
            <Grid item xs={12}>
              <Tooltip title='Add Certification Entry'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleAdd}
                  startIcon={<i className='ri-add-line' />}
                >
                  Add Certification
                </Button>
              </Tooltip>
            </Grid>
          )}
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
              <Tooltip title='Edit Certifications'>
                <Button
                  variant='outlined'
                  color='secondary'
                  startIcon={<i className='ri-edit-2-line' />}
                  onClick={() => setIsEditing(true)}
                  disabled={saving}
                  aria-label='Edit Certifications'
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
                    aria-label='Save Certifications'
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
                    aria-label='Cancel Editing Certifications'
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

export default CertificationsSection

// // src/components/account-settings/CertificationsSection.tsx

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Grid, TextField, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material'
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
// import dayjs, { Dayjs } from 'dayjs'
// import axios from 'axios'
// import { useSession, signIn } from 'next-auth/react'

// type Certification = {
//   certification_name: string
//   certification_authority: string
//   obtained_date: Dayjs | null
//   expiry_date: Dayjs | null
//   credential_url: string
//   description: string
// }

// const CertificationsSection: React.FC = () => {
//   const { data: session, status } = useSession()
//   const [certifications, setCertifications] = useState<Certification[]>([])
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

//     const fetchCertifications = async () => {
//       try {
//         const response = await axios.get('/api/user/me')
//         const data = response.data
//         setCertifications(
//           data.certifications
//             ? data.certifications.map((cert: any) => ({
//                 certification_name: cert.certification_name || '',
//                 certification_authority: cert.certification_authority || '',
//                 obtained_date: cert.obtained_date ? dayjs(cert.obtained_date) : null,
//                 expiry_date: cert.expiry_date ? dayjs(cert.expiry_date) : null,
//                 credential_url: cert.credential_url || '',
//                 description: cert.description || ''
//               }))
//             : []
//         )
//         setLoading(false)
//       } catch (err) {
//         console.error('Error fetching certifications:', err)
//         setError('Failed to load certifications')
//         setLoading(false)
//       }
//     }

//     fetchCertifications()
//   }, [session, status])

//   const handleChange = (index: number, field: keyof Certification, value: any) => {
//     const updatedCertifications = [...certifications]
//     updatedCertifications[index] = {
//       ...updatedCertifications[index],
//       [field]: value
//     }
//     setCertifications(updatedCertifications)
//   }

//   const handleAdd = () => {
//     setCertifications([
//       ...certifications,
//       {
//         certification_name: '',
//         certification_authority: '',
//         obtained_date: null,
//         expiry_date: null,
//         credential_url: '',
//         description: ''
//       }
//     ])
//   }

//   const handleRemove = (index: number) => {
//     const updatedCertifications = [...certifications]
//     updatedCertifications.splice(index, 1)
//     setCertifications(updatedCertifications)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setSaving(true)
//     setError(null)
//     setSuccess(null)
//     try {
//       const dataToSubmit = {
//         certifications: certifications.map(cert => ({
//           certification_name: cert.certification_name,
//           certification_authority: cert.certification_authority,
//           obtained_date: cert.obtained_date ? cert.obtained_date.toISOString() : null,
//           expiry_date: cert.expiry_date ? cert.expiry_date.toISOString() : null,
//           credential_url: cert.credential_url,
//           description: cert.description
//         }))
//       }
//       await axios.put('/api/user/update', dataToSubmit)
//       setSuccess('Certifications updated successfully')
//     } catch (err) {
//       console.error('Error updating certifications:', err)
//       setError('Failed to update certifications')
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (loading) return <CircularProgress />

//   return (
//     <Card variant='outlined' sx={{ padding: 2, marginBottom: 4 }}>
//       <Typography variant='h6' gutterBottom>
//         Certifications
//       </Typography>
//       <form onSubmit={handleSubmit}>
//         <Grid container spacing={2}>
//           {certifications.map((cert, index) => (
//             <Card key={index} variant='outlined' sx={{ padding: 2, marginBottom: 2, width: '100%' }}>
//               <CardContent>
//                 <Grid container spacing={2}>
//                   {/* Certification Name */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Certification Name'
//                       value={cert.certification_name}
//                       onChange={e => handleChange(index, 'certification_name', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Certification Authority */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Certification Authority'
//                       value={cert.certification_authority}
//                       onChange={e => handleChange(index, 'certification_authority', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Obtained Date */}
//                   <Grid item xs={12} sm={6}>
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DatePicker
//                         label='Obtained Date'
//                         value={cert.obtained_date}
//                         onChange={(date: Dayjs | null) => handleChange(index, 'obtained_date', date)}
//                         slotProps={{
//                           textField: {
//                             fullWidth: true
//                           }
//                         }}
//                       />
//                     </LocalizationProvider>
//                   </Grid>
//                   {/* Expiry Date */}
//                   <Grid item xs={12} sm={6}>
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DatePicker
//                         label='Expiry Date'
//                         value={cert.expiry_date}
//                         onChange={(date: Dayjs | null) => handleChange(index, 'expiry_date', date)}
//                         slotProps={{
//                           textField: {
//                             fullWidth: true
//                           }
//                         }}
//                       />
//                     </LocalizationProvider>
//                   </Grid>
//                   {/* Credential URL */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Credential URL'
//                       value={cert.credential_url}
//                       onChange={e => handleChange(index, 'credential_url', e.target.value)}
//                       type='url'
//                     />
//                   </Grid>
//                   {/* Description */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Description'
//                       multiline
//                       rows={3}
//                       value={cert.description}
//                       onChange={e => handleChange(index, 'description', e.target.value)}
//                     />
//                   </Grid>
//                   {/* Remove Button */}
//                   <Grid item xs={12}>
//                     <Button variant='outlined' color='error' onClick={() => handleRemove(index)}>
//                       Remove Certification
//                     </Button>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           ))}
//           {/* Add Button */}
//           <Grid item xs={12}>
//             <Button variant='contained' onClick={handleAdd}>
//               Add Certification
//             </Button>
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

// export default CertificationsSection
