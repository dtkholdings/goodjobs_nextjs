// src/components/account-settings/EducationSection.tsx

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
const EducationSchema = Yup.object().shape({
  educationList: Yup.array()
    .of(
      Yup.object().shape({
        degree_title: Yup.string().required('Degree Title is required'),
        institute_name: Yup.string().required('Institute Name is required'),
        field_of_study: Yup.string().required('Field of Study is required'),
        start_date: Yup.date()
          .nullable()
          .typeError('Start Date is required')
          .required('Start Date is required')
          .max(new Date(), 'Start Date cannot be in the future'),
        end_date: Yup.date()
          .nullable()
          .typeError('End Date must be a valid date')
          .min(Yup.ref('start_date'), 'End Date cannot be before Start Date'),
        description: Yup.string().max(500, 'Description cannot exceed 500 characters')
      })
    )
    .min(1, 'At least one education entry is required')
})

// Define the Education type
type Education = {
  degree_title: string
  institute_name: string
  field_of_study: string
  start_date: Dayjs | null
  end_date: Dayjs | null
  description: string
}

const EducationSection: React.FC = () => {
  const { data: session, status } = useSession()
  const [educationList, setEducationList] = useState<Education[]>([])
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

    const fetchEducation = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property

        setEducationList(
          data.education
            ? data.education.map((edu: any) => ({
                degree_title: edu.degree_title || '',
                institute_name: edu.institute_name || '',
                field_of_study: edu.field_of_study || '',
                start_date: edu.start_date ? dayjs(edu.start_date) : null,
                end_date: edu.end_date ? dayjs(edu.end_date) : null,
                description: edu.description || ''
              }))
            : []
        )
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching education information:', err)
        setError('Failed to load education information')
        setLoading(false)
      }
    }

    fetchEducation()
  }, [session, status])

  // Handle input changes
  const handleChange = (index: number, field: keyof Education, value: any) => {
    const updatedList = [...educationList]
    updatedList[index] = { ...updatedList[index], [field]: value }
    setEducationList(updatedList)
  }

  // Handle adding a new education entry
  const handleAdd = () => {
    setEducationList([
      ...educationList,
      {
        degree_title: '',
        institute_name: '',
        field_of_study: '',
        start_date: null,
        end_date: null,
        description: ''
      }
    ])
    setIsEditing(true)
  }

  // Handle removing an education entry
  const handleRemove = (index: number) => {
    const updatedList = [...educationList]
    updatedList.splice(index, 1)
    setEducationList(updatedList)
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // Validate the form data
      await EducationSchema.validate({ educationList }, { abortEarly: false })

      const dataToSubmit = {
        education: educationList.map(edu => ({
          degree_title: edu.degree_title,
          institute_name: edu.institute_name,
          field_of_study: edu.field_of_study,
          start_date: edu.start_date ? edu.start_date.toISOString() : null,
          end_date: edu.end_date ? edu.end_date.toISOString() : null,
          description: edu.description
        }))
      }

      await axios.put('/api/user/update', dataToSubmit)
      setSuccess('Education information updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else {
        console.error('Error updating education information:', err)
        setError('Failed to update education information')
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
    const fetchEducation = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user

        setEducationList(
          data.education
            ? data.education.map((edu: any) => ({
                degree_title: edu.degree_title || '',
                institute_name: edu.institute_name || '',
                field_of_study: edu.field_of_study || '',
                start_date: edu.start_date ? dayjs(edu.start_date) : null,
                end_date: edu.end_date ? dayjs(edu.end_date) : null,
                description: edu.description || ''
              }))
            : []
        )
      } catch (err: any) {
        console.error('Error refetching education information:', err)
        setError('Failed to refetch education information')
      }
    }

    fetchEducation()
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Education
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Providing your educational background helps employers understand your qualifications and expertise. Ensure your
        education details are accurate to receive relevant job opportunities.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {educationList.map((edu, index) => (
            <Card
              key={index}
              variant='outlined'
              sx={{ padding: 2, marginBottom: 2, width: '100%', position: 'relative' }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  {/* Degree Title */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Degree Title'
                      value={edu.degree_title}
                      onChange={e => handleChange(index, 'degree_title', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Degree Title') && isEditing)}
                      helperText={
                        isEditing && error && error.includes('Degree Title') ? 'Degree Title is required' : ''
                      }
                    />
                  </Grid>
                  {/* Institute Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Institute Name'
                      value={edu.institute_name}
                      onChange={e => handleChange(index, 'institute_name', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Institute Name') && isEditing)}
                      helperText={
                        isEditing && error && error.includes('Institute Name') ? 'Institute Name is required' : ''
                      }
                    />
                  </Grid>
                  {/* Field of Study */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Field of Study'
                      value={edu.field_of_study}
                      onChange={e => handleChange(index, 'field_of_study', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Field of Study') && isEditing)}
                      helperText={
                        isEditing && error && error.includes('Field of Study') ? 'Field of Study is required' : ''
                      }
                    />
                  </Grid>
                  {/* Start Date */}
                  <Grid item xs={12} sm={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Start Date'
                        value={edu.start_date}
                        onChange={(date: Dayjs | null) => handleChange(index, 'start_date', date)}
                        disabled={!isEditing}
                        slotProps={{
                          textField: {
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  {/* End Date */}
                  <Grid item xs={12} sm={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='End Date'
                        value={edu.end_date}
                        onChange={(date: Dayjs | null) => handleChange(index, 'end_date', date)}
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Description'
                      multiline
                      rows={3}
                      value={edu.description}
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
                      <Tooltip title='Remove Education Entry'>
                        <IconButton
                          color='error'
                          onClick={() => handleRemove(index)}
                          aria-label='Remove Education Entry'
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
              <Tooltip title='Add Education Entry'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleAdd}
                  startIcon={<i className='ri-add-line' />}
                >
                  Add Education
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
              <Tooltip title='Edit Education Information'>
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

export default EducationSection

// // src/components/account-settings/EducationSection.tsx

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Grid, TextField, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material'
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
// import dayjs, { Dayjs } from 'dayjs'
// import axios from 'axios'
// import { useSession, signIn } from 'next-auth/react'

// type Education = {
//   degree_title: string
//   institute_name: string
//   field_of_study: string
//   start_date: Dayjs | null
//   end_date: Dayjs | null
//   description: string
// }

// const EducationSection: React.FC = () => {
//   const { data: session, status } = useSession()
//   const [educationList, setEducationList] = useState<Education[]>([])
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

//     const fetchEducation = async () => {
//       try {
//         const response = await axios.get('/api/user/me')
//         const data = response.data
//         setEducationList(
//           data.education
//             ? data.education.map((edu: any) => ({
//                 degree_title: edu.degree_title || '',
//                 institute_name: edu.institute_name || '',
//                 field_of_study: edu.field_of_study || '',
//                 start_date: edu.start_date ? dayjs(edu.start_date) : null,
//                 end_date: edu.end_date ? dayjs(edu.end_date) : null,
//                 description: edu.description || ''
//               }))
//             : []
//         )
//         setLoading(false)
//       } catch (err) {
//         console.error('Error fetching education information:', err)
//         setError('Failed to load education information')
//         setLoading(false)
//       }
//     }

//     fetchEducation()
//   }, [session, status])

//   const handleChange = (index: number, field: keyof Education, value: any) => {
//     const updatedList = [...educationList]
//     updatedList[index] = { ...updatedList[index], [field]: value }
//     setEducationList(updatedList)
//   }

//   const handleAdd = () => {
//     setEducationList([
//       ...educationList,
//       {
//         degree_title: '',
//         institute_name: '',
//         field_of_study: '',
//         start_date: null,
//         end_date: null,
//         description: ''
//       }
//     ])
//   }

//   const handleRemove = (index: number) => {
//     const updatedList = [...educationList]
//     updatedList.splice(index, 1)
//     setEducationList(updatedList)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setSaving(true)
//     setError(null)
//     setSuccess(null)
//     try {
//       const dataToSubmit = {
//         education: educationList.map(edu => ({
//           degree_title: edu.degree_title,
//           institute_name: edu.institute_name,
//           field_of_study: edu.field_of_study,
//           start_date: edu.start_date ? edu.start_date.toISOString() : null,
//           end_date: edu.end_date ? edu.end_date.toISOString() : null,
//           description: edu.description
//         }))
//       }
//       await axios.put('/api/user/update', dataToSubmit)
//       setSuccess('Education information updated successfully')
//     } catch (err) {
//       console.error('Error updating education information:', err)
//       setError('Failed to update education information')
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (loading) return <CircularProgress />

//   return (
//     <Card variant='outlined' sx={{ padding: 2, marginBottom: 4 }}>
//       <Typography variant='h6' gutterBottom>
//         Education
//       </Typography>
//       <form onSubmit={handleSubmit}>
//         <Grid container spacing={2}>
//           {educationList.map((edu, index) => (
//             <Card key={index} variant='outlined' sx={{ padding: 2, marginBottom: 2, width: '100%' }}>
//               <CardContent>
//                 <Grid container spacing={2}>
//                   {/* Degree Title */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Degree Title'
//                       value={edu.degree_title}
//                       onChange={e => handleChange(index, 'degree_title', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Institute Name */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Institute Name'
//                       value={edu.institute_name}
//                       onChange={e => handleChange(index, 'institute_name', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Field of Study */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Field of Study'
//                       value={edu.field_of_study}
//                       onChange={e => handleChange(index, 'field_of_study', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Start Date */}
//                   <Grid item xs={12} sm={3}>
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DatePicker
//                         label='Start Date'
//                         value={edu.start_date}
//                         onChange={(date: Dayjs | null) => handleChange(index, 'start_date', date)}
//                         slotProps={{
//                     textField: {
//                       fullWidth: true
//                     }
//                   }}
//                       />
//                     </LocalizationProvider>
//                   </Grid>
//                   {/* End Date */}
//                   <Grid item xs={12} sm={3}>
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DatePicker
//                         label='End Date'
//                         value={edu.end_date}
//                         onChange={(date: Dayjs | null) => handleChange(index, 'end_date', date)}
//                         slotProps={{
//                     textField: {
//                       fullWidth: true
//                     }
//                   }}
//                       />
//                     </LocalizationProvider>
//                   </Grid>
//                   {/* Description */}
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       label='Description'
//                       multiline
//                       rows={3}
//                       value={edu.description}
//                       onChange={e => handleChange(index, 'description', e.target.value)}
//                     />
//                   </Grid>
//                   {/* Remove Button */}
//                   <Grid item xs={12}>
//                     <Button variant='outlined' color='error' onClick={() => handleRemove(index)}>
//                       Remove
//                     </Button>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           ))}
//           {/* Add Button */}
//           <Grid item xs={12}>
//             <Button variant='contained' onClick={handleAdd}>
//               Add Education
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

// export default EducationSection
