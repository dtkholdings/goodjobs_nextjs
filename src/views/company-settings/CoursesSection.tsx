// src/components/account-settings/CoursesSection.tsx

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
const CourseSchema = Yup.object().shape({
  courses: Yup.array()
    .of(
      Yup.object().shape({
        course_name: Yup.string().required('Course Name is required'),
        institution: Yup.string().required('Institution is required'),
        start_date: Yup.date()
          .nullable()
          .typeError('Start Date is required')
          .required('Start Date is required')
          .max(new Date(), 'Start Date cannot be in the future'),
        end_date: Yup.date()
          .nullable()
          .typeError('End Date must be a valid date')
          .min(Yup.ref('start_date'), 'End Date cannot be before Start Date')
          .max(new Date(), 'End Date cannot be in the future'),
        description: Yup.string().max(500, 'Description cannot exceed 500 characters').nullable()
      })
    )
    .min(1, 'At least one course is required')
})

// Define the Course type
type Course = {
  course_name: string
  institution: string
  start_date: Dayjs | null
  end_date: Dayjs | null
  description: string
}

const CoursesSection: React.FC = () => {
  const { data: session, status } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
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

    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property

        setCourses(
          data.courses
            ? data.courses.map((course: any) => ({
                course_name: course.course_name || '',
                institution: course.institution || '',
                start_date: course.start_date ? dayjs(course.start_date) : null,
                end_date: course.end_date ? dayjs(course.end_date) : null,
                description: course.description || ''
              }))
            : []
        )
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses')
        setLoading(false)
      }
    }

    fetchCourses()
  }, [session, status])

  // Handle input changes
  const handleChange = (index: number, field: keyof Course, value: any) => {
    const updatedCourses = [...courses]
    updatedCourses[index] = {
      ...updatedCourses[index],
      [field]: value
    }
    setCourses(updatedCourses)
  }

  // Handle adding a new course entry
  const handleAdd = () => {
    setCourses([
      ...courses,
      {
        course_name: '',
        institution: '',
        start_date: null,
        end_date: null,
        description: ''
      }
    ])
    setIsEditing(true)
  }

  // Handle removing a course entry
  const handleRemove = (index: number) => {
    const updatedCourses = [...courses]
    updatedCourses.splice(index, 1)
    setCourses(updatedCourses)
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // Validate the form data
      await CourseSchema.validate({ courses }, { abortEarly: false })

      const dataToSubmit = {
        courses: courses.map(course => ({
          course_name: course.course_name,
          institution: course.institution,
          start_date: course.start_date ? course.start_date.toISOString() : null,
          end_date: course.end_date ? course.end_date.toISOString() : null,
          description: course.description || null
        }))
      }

      await axios.put('/api/user/update', dataToSubmit)
      setSuccess('Courses updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else {
        console.error('Error updating courses:', err)
        setError('Failed to update courses')
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
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user

        setCourses(
          data.courses
            ? data.courses.map((course: any) => ({
                course_name: course.course_name || '',
                institution: course.institution || '',
                start_date: course.start_date ? dayjs(course.start_date) : null,
                end_date: course.end_date ? dayjs(course.end_date) : null,
                description: course.description || ''
              }))
            : []
        )
      } catch (err: any) {
        console.error('Error refetching courses:', err)
        setError('Failed to refetch courses')
      }
    }

    fetchCourses()
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Courses
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Providing your course details helps employers understand your continuous learning and expertise. Ensure your
        course information is accurate to receive relevant job opportunities.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {courses.map((course, index) => (
            <Card
              key={index}
              variant='outlined'
              sx={{ padding: 2, marginBottom: 2, width: '100%', position: 'relative' }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  {/* Course Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Course Name'
                      value={course.course_name}
                      onChange={e => handleChange(index, 'course_name', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Course Name') && isEditing)}
                      helperText={isEditing && error && error.includes('Course Name') ? 'Course Name is required' : ''}
                    />
                  </Grid>
                  {/* Institution */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Institution'
                      value={course.institution}
                      onChange={e => handleChange(index, 'institution', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Institution') && isEditing)}
                      helperText={isEditing && error && error.includes('Institution') ? 'Institution is required' : ''}
                    />
                  </Grid>
                  {/* Start Date */}
                  <Grid item xs={12} sm={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Start Date'
                        value={course.start_date}
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
                        value={course.end_date}
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
                      value={course.description}
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
                      <Tooltip title='Remove Course Entry'>
                        <IconButton color='error' onClick={() => handleRemove(index)} aria-label='Remove Course Entry'>
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
              <Tooltip title='Add Course Entry'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleAdd}
                  startIcon={<i className='ri-add-line' />}
                >
                  Add Course
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
              <Tooltip title='Edit Courses'>
                <Button
                  variant='outlined'
                  color='secondary'
                  startIcon={<i className='ri-edit-2-line' />}
                  onClick={() => setIsEditing(true)}
                  disabled={saving}
                  aria-label='Edit Courses'
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
                    aria-label='Save Courses'
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
                    aria-label='Cancel Editing Courses'
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

export default CoursesSection

// // src/components/account-settings/CoursesSection.tsx

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Grid, TextField, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material'
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
// import dayjs, { Dayjs } from 'dayjs'
// import axios from 'axios'
// import { useSession, signIn } from 'next-auth/react'

// type Course = {
//   course_name: string
//   institution: string
//   start_date: Dayjs | null
//   end_date: Dayjs | null
//   description: string
// }

// const CoursesSection: React.FC = () => {
//   const { data: session, status } = useSession()
//   const [courses, setCourses] = useState<Course[]>([])
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

//     const fetchCourses = async () => {
//       try {
//         const response = await axios.get('/api/user/me')
//         const data = response.data
//         setCourses(
//           data.courses
//             ? data.courses.map((course: any) => ({
//                 course_name: course.course_name || '',
//                 institution: course.institution || '',
//                 start_date: course.start_date ? dayjs(course.start_date) : null,
//                 end_date: course.end_date ? dayjs(course.end_date) : null,
//                 description: course.description || ''
//               }))
//             : []
//         )
//         setLoading(false)
//       } catch (err) {
//         console.error('Error fetching courses:', err)
//         setError('Failed to load courses')
//         setLoading(false)
//       }
//     }

//     fetchCourses()
//   }, [session, status])

//   const handleChange = (index: number, field: keyof Course, value: any) => {
//     const updatedCourses = [...courses]
//     updatedCourses[index] = {
//       ...updatedCourses[index],
//       [field]: value
//     }
//     setCourses(updatedCourses)
//   }

//   const handleAdd = () => {
//     setCourses([
//       ...courses,
//       {
//         course_name: '',
//         institution: '',
//         start_date: null,
//         end_date: null,
//         description: ''
//       }
//     ])
//   }

//   const handleRemove = (index: number) => {
//     const updatedCourses = [...courses]
//     updatedCourses.splice(index, 1)
//     setCourses(updatedCourses)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setSaving(true)
//     setError(null)
//     setSuccess(null)
//     try {
//       const dataToSubmit = {
//         courses: courses.map(course => ({
//           course_name: course.course_name,
//           institution: course.institution,
//           start_date: course.start_date ? course.start_date.toISOString() : null,
//           end_date: course.end_date ? course.end_date.toISOString() : null,
//           description: course.description
//         }))
//       }
//       await axios.put('/api/user/update', dataToSubmit)
//       setSuccess('Courses updated successfully')
//     } catch (err) {
//       console.error('Error updating courses:', err)
//       setError('Failed to update courses')
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (loading) return <CircularProgress />

//   return (
//     <Card variant='outlined' sx={{ padding: 2, marginBottom: 4 }}>
//       <Typography variant='h6' gutterBottom>
//         Courses
//       </Typography>
//       <form onSubmit={handleSubmit}>
//         <Grid container spacing={2}>
//           {courses.map((course, index) => (
//             <Card key={index} variant='outlined' sx={{ padding: 2, marginBottom: 2, width: '100%' }}>
//               <CardContent>
//                 <Grid container spacing={2}>
//                   {/* Course Name */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Course Name'
//                       value={course.course_name}
//                       onChange={e => handleChange(index, 'course_name', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Institution */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Institution'
//                       value={course.institution}
//                       onChange={e => handleChange(index, 'institution', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Start Date */}
//                   <Grid item xs={12} sm={3}>
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DatePicker
//                         label='Start Date'
//                         value={course.start_date}
//                         onChange={(date: Dayjs | null) => handleChange(index, 'start_date', date)}
//                         slotProps={{
//                           textField: {
//                             fullWidth: true
//                           }
//                         }}
//                       />
//                     </LocalizationProvider>
//                   </Grid>
//                   {/* End Date */}
//                   <Grid item xs={12} sm={3}>
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DatePicker
//                         label='End Date'
//                         value={course.end_date}
//                         onChange={(date: Dayjs | null) => handleChange(index, 'end_date', date)}
//                         slotProps={{
//                           textField: {
//                             fullWidth: true
//                           }
//                         }}
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
//                       value={course.description}
//                       onChange={e => handleChange(index, 'description', e.target.value)}
//                     />
//                   </Grid>
//                   {/* Remove Button */}
//                   <Grid item xs={12}>
//                     <Button variant='outlined' color='error' onClick={() => handleRemove(index)}>
//                       Remove Course
//                     </Button>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           ))}
//           {/* Add Button */}
//           <Grid item xs={12}>
//             <Button variant='contained' onClick={handleAdd}>
//               Add Course
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

// export default CoursesSection
