// src/components/account-settings/PersonalInformation.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  Grid,
  TextField,
  Typography,
  Button,
  CircularProgress,
  MenuItem,
  Card,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
import * as Yup from 'yup'

// Define the validation schema using Yup
const PersonalInfoSchema = Yup.object().shape({
  first_name: Yup.string().required('First Name is required'),
  middle_name: Yup.string(),
  last_name: Yup.string().required('Last Name is required'),
  display_name: Yup.string().required('Display Name is required'),
  birthday: Yup.date()
    .nullable()
    .typeError('Invalid date')
    .min(new Date(1900, 0, 1), 'Birthday cannot be before 1900')
    .max(new Date(), 'Birthday cannot be in the future'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Select a valid gender').required('Gender is required')
})

type PersonalInfo = {
  first_name: string
  middle_name: string
  last_name: string
  display_name: string
  birthday: Dayjs | null
  gender: string
}

const genderOptions = ['Male', 'Female', 'Other']

const PersonalInformation: React.FC = () => {
  const { data: session, status } = useSession()
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    first_name: '',
    middle_name: '',
    last_name: '',
    display_name: '',
    birthday: null,
    gender: ''
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

    const fetchPersonalInfo = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property

        setPersonalInfo({
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          display_name: data.display_name || '',
          birthday: data.birthday ? dayjs(data.birthday) : null,
          gender: data.gender || ''
        })
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching personal information:', err)
        setError('Failed to load personal information')
        setLoading(false)
      }
    }

    fetchPersonalInfo()
  }, [session, status])

  // Handle input changes
  const handleChange = (field: keyof PersonalInfo, value: any) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }))
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate the form data
      await PersonalInfoSchema.validate(personalInfo, { abortEarly: false })

      const dataToSubmit = {
        first_name: personalInfo.first_name,
        middle_name: personalInfo.middle_name,
        last_name: personalInfo.last_name,
        display_name: personalInfo.display_name,
        birthday: personalInfo.birthday ? personalInfo.birthday.toISOString() : null,
        gender: personalInfo.gender
      }

      await axios.put('/api/user/update', dataToSubmit)
      setSuccess('Personal information updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else {
        console.error('Error updating personal information:', err)
        setError('Failed to update personal information')
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
    const fetchPersonalInfo = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user

        setPersonalInfo({
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          display_name: data.display_name || '',
          birthday: data.birthday ? dayjs(data.birthday) : null,
          gender: data.gender || ''
        })
      } catch (err: any) {
        console.error('Error refetching personal information:', err)
        setError('Failed to refetch personal information')
      }
    }

    fetchPersonalInfo()
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Personal Information
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        We collect your personal information to help you find jobs more easily and manage your profile effectively. This
        data is essential for employers to understand your qualifications and for you to post jobs seamlessly.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {/* First Name */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label='First Name'
              value={personalInfo.first_name}
              onChange={e => handleChange('first_name', e.target.value)}
              required
              InputProps={{
                readOnly: !isEditing
              }}
            />
          </Grid>
          {/* Middle Name */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label='Middle Name'
              value={personalInfo.middle_name}
              onChange={e => handleChange('middle_name', e.target.value)}
              InputProps={{
                readOnly: !isEditing
              }}
            />
          </Grid>
          {/* Last Name */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label='Last Name'
              value={personalInfo.last_name}
              onChange={e => handleChange('last_name', e.target.value)}
              required
              InputProps={{
                readOnly: !isEditing
              }}
            />
          </Grid>
          {/* Display Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Display Name'
              value={personalInfo.display_name}
              onChange={e => handleChange('display_name', e.target.value)}
              required
              InputProps={{
                readOnly: !isEditing
              }}
            />
          </Grid>
          {/* Birthday */}
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label='Birthday'
                value={personalInfo.birthday}
                onChange={(date: Dayjs | null) => handleChange('birthday', date)}
                disabled={!isEditing}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          {/* Gender */}
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label='Gender'
              value={personalInfo.gender}
              onChange={e => handleChange('gender', e.target.value)}
              required
              disabled={!isEditing}
            >
              <MenuItem value=''>Select Gender</MenuItem>
              {genderOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
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
              <Tooltip title='Edit Personal Information'>
                <Button
                  variant='outlined'
                  color='secondary'
                  startIcon={<i className='ri-edit-2-line' />}
                  onClick={() => setIsEditing(true)}
                  disabled={saving}
                >
                  Edit
                </Button>
                {/* <IconButton color='primary' onClick={() => setIsEditing(true)}>
                  <i className='ri-edit-2-line' />
                </IconButton> */}
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
                  <Button variant='outlined' color='secondary' onClick={handleCancel} disabled={saving}>
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

export default PersonalInformation
