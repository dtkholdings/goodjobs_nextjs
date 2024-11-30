// src/components/account-settings/AwardsSection.tsx

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

// Define the Award type
type Award = {
  award_name: string
  awarding_authority: string
  award_received_date: Dayjs | null
  description: string
}

// Define the validation schema using Yup
const AwardSchema = Yup.object().shape({
  awards: Yup.array()
    .of(
      Yup.object().shape({
        award_name: Yup.string().required('Award Name is required'),
        awarding_authority: Yup.string().required('Awarding Authority is required'),
        award_received_date: Yup.date()
          .nullable()
          .typeError('Award Received Date is required')
          .required('Award Received Date is required')
          .max(new Date(), 'Award Received Date cannot be in the future'),
        description: Yup.string().max(500, 'Description cannot exceed 500 characters').nullable()
      })
    )
    .min(1, 'At least one award is required')
})

const AwardsSection: React.FC = () => {
  const { data: session, status } = useSession()
  const [awards, setAwards] = useState<Award[]>([])
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

    const fetchAwards = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property

        setAwards(
          data.awards
            ? data.awards.map((awrd: any) => ({
                award_name: awrd.award_name || '',
                awarding_authority: awrd.awarding_authority || '',
                award_received_date: awrd.award_received_date ? dayjs(awrd.award_received_date) : null,
                description: awrd.description || ''
              }))
            : []
        )
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching awards:', err)
        setError('Failed to load awards')
        setLoading(false)
      }
    }

    fetchAwards()
  }, [session, status])

  // Handle input changes
  const handleChange = (index: number, field: keyof Award, value: any) => {
    const updatedAwards = [...awards]
    updatedAwards[index] = {
      ...updatedAwards[index],
      [field]: value
    }
    setAwards(updatedAwards)
  }

  // Handle adding a new award entry
  const handleAdd = () => {
    setAwards([
      ...awards,
      {
        award_name: '',
        awarding_authority: '',
        award_received_date: null,
        description: ''
      }
    ])
    setIsEditing(true)
  }

  // Handle removing an award entry
  const handleRemove = (index: number) => {
    const updatedAwards = [...awards]
    updatedAwards.splice(index, 1)
    setAwards(updatedAwards)
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // Validate the form data
      await AwardSchema.validate({ awards }, { abortEarly: false })

      const dataToSubmit = {
        awards: awards.map(awrd => ({
          award_name: awrd.award_name,
          awarding_authority: awrd.awarding_authority,
          award_received_date: awrd.award_received_date ? awrd.award_received_date.toISOString() : null,
          description: awrd.description || null
        }))
      }

      await axios.put('/api/user/update', dataToSubmit)
      setSuccess('Awards updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else {
        console.error('Error updating awards:', err)
        setError('Failed to update awards')
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
    const fetchAwards = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user

        setAwards(
          data.awards
            ? data.awards.map((awrd: any) => ({
                award_name: awrd.award_name || '',
                awarding_authority: awrd.awarding_authority || '',
                award_received_date: awrd.award_received_date ? dayjs(awrd.award_received_date) : null,
                description: awrd.description || ''
              }))
            : []
        )
      } catch (err: any) {
        console.error('Error refetching awards:', err)
        setError('Failed to refetch awards')
      }
    }

    fetchAwards()
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Awards
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Providing your award details helps employers recognize your achievements and expertise. Ensure your award
        information is accurate to receive relevant job opportunities.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {awards.map((awrd, index) => (
            <Card
              key={index}
              variant='outlined'
              sx={{ padding: 2, marginBottom: 2, width: '100%', position: 'relative' }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  {/* Award Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Award Name'
                      value={awrd.award_name}
                      onChange={e => handleChange(index, 'award_name', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Award Name') && isEditing)}
                      helperText={isEditing && error && error.includes('Award Name') ? 'Award Name is required' : ''}
                    />
                  </Grid>
                  {/* Awarding Authority */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Awarding Authority'
                      value={awrd.awarding_authority}
                      onChange={e => handleChange(index, 'awarding_authority', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Awarding Authority') && isEditing)}
                      helperText={
                        isEditing && error && error.includes('Awarding Authority')
                          ? 'Awarding Authority is required'
                          : ''
                      }
                    />
                  </Grid>
                  {/* Award Received Date */}
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Award Received Date'
                        value={awrd.award_received_date}
                        onChange={(date: Dayjs | null) => handleChange(index, 'award_received_date', date)}
                        disabled={!isEditing}
                        slotProps={{
                          textField: {
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  {/* Description */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Description'
                      multiline
                      rows={3}
                      value={awrd.description}
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
                      <Tooltip title='Remove Award Entry'>
                        <IconButton color='error' onClick={() => handleRemove(index)} aria-label='Remove Award Entry'>
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
              <Tooltip title='Add Award Entry'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleAdd}
                  startIcon={<i className='ri-add-line' />}
                >
                  Add Award
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
              <Tooltip title='Edit Awards'>
                <Button
                  variant='outlined'
                  color='secondary'
                  startIcon={<i className='ri-edit-2-line' />}
                  onClick={() => setIsEditing(true)}
                  disabled={saving}
                  aria-label='Edit Awards'
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
                    aria-label='Save Awards'
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
                    aria-label='Cancel Editing Awards'
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

export default AwardsSection

// // src/components/account-settings/AwardsSection.tsx

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Grid, TextField, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material'
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
// import dayjs, { Dayjs } from 'dayjs'
// import axios from 'axios'
// import { useSession, signIn } from 'next-auth/react'

// type Award = {
//   award_name: string
//   awarding_authority: string
//   award_received_date: Dayjs | null
//   description: string
// }

// const AwardsSection: React.FC = () => {
//   const { data: session, status } = useSession()
//   const [awards, setAwards] = useState<Award[]>([])
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

//     const fetchAwards = async () => {
//       try {
//         const response = await axios.get('/api/user/me')
//         const data = response.data
//         setAwards(
//           data.awards
//             ? data.awards.map((awrd: any) => ({
//                 award_name: awrd.award_name || '',
//                 awarding_authority: awrd.awarding_authority || '',
//                 award_received_date: awrd.award_received_date ? dayjs(awrd.award_received_date) : null,
//                 description: awrd.description || ''
//               }))
//             : []
//         )
//         setLoading(false)
//       } catch (err) {
//         console.error('Error fetching awards:', err)
//         setError('Failed to load awards')
//         setLoading(false)
//       }
//     }

//     fetchAwards()
//   }, [session, status])

//   const handleChange = (index: number, field: keyof Award, value: any) => {
//     const updatedAwards = [...awards]
//     updatedAwards[index] = {
//       ...updatedAwards[index],
//       [field]: value
//     }
//     setAwards(updatedAwards)
//   }

//   const handleAdd = () => {
//     setAwards([
//       ...awards,
//       {
//         award_name: '',
//         awarding_authority: '',
//         award_received_date: null,
//         description: ''
//       }
//     ])
//   }

//   const handleRemove = (index: number) => {
//     const updatedAwards = [...awards]
//     updatedAwards.splice(index, 1)
//     setAwards(updatedAwards)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setSaving(true)
//     setError(null)
//     setSuccess(null)
//     try {
//       const dataToSubmit = {
//         awards: awards.map(awrd => ({
//           award_name: awrd.award_name,
//           awarding_authority: awrd.awarding_authority,
//           award_received_date: awrd.award_received_date ? awrd.award_received_date.toISOString() : null,
//           description: awrd.description
//         }))
//       }
//       await axios.put('/api/user/update', dataToSubmit)
//       setSuccess('Awards updated successfully')
//     } catch (err) {
//       console.error('Error updating awards:', err)
//       setError('Failed to update awards')
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (loading) return <CircularProgress />

//   return (
//     <Card variant='outlined' sx={{ padding: 2, marginBottom: 4 }}>
//       <Typography variant='h6' gutterBottom>
//         Awards
//       </Typography>
//       <form onSubmit={handleSubmit}>
//         <Grid container spacing={2}>
//           {awards.map((awrd, index) => (
//             <Card key={index} variant='outlined' sx={{ padding: 2, marginBottom: 2, width: '100%' }}>
//               <CardContent>
//                 <Grid container spacing={2}>
//                   {/* Award Name */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Award Name'
//                       value={awrd.award_name}
//                       onChange={e => handleChange(index, 'award_name', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Awarding Authority */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Awarding Authority'
//                       value={awrd.awarding_authority}
//                       onChange={e => handleChange(index, 'awarding_authority', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Award Received Date */}
//                   <Grid item xs={12} sm={6}>
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DatePicker
//                         label='Award Received Date'
//                         value={awrd.award_received_date}
//                         onChange={(date: Dayjs | null) => handleChange(index, 'award_received_date', date)}
//                         slotProps={{
//                           textField: {
//                             fullWidth: true
//                           }
//                         }}
//                       />
//                     </LocalizationProvider>
//                   </Grid>
//                   {/* Description */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Description'
//                       multiline
//                       rows={3}
//                       value={awrd.description}
//                       onChange={e => handleChange(index, 'description', e.target.value)}
//                     />
//                   </Grid>
//                   {/* Remove Button */}
//                   <Grid item xs={12}>
//                     <Button variant='outlined' color='error' onClick={() => handleRemove(index)}>
//                       Remove Award
//                     </Button>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           ))}
//           {/* Add Button */}
//           <Grid item xs={12}>
//             <Button variant='contained' onClick={handleAdd}>
//               Add Award
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

// export default AwardsSection
