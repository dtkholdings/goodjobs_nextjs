// src/components/account-settings/AddressSection.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  Grid,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  Alert,
  Tooltip
} from '@mui/material'
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
const AddressSchema = Yup.object().shape({
  line1: Yup.string().required('Address Line 1 is required'),
  line2: Yup.string(),
  city: Yup.string().required('City is required'),
  province: Yup.string().required('Province/State is required'),
  zip_code: Yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Zip Code must be in the format 12345 or 12345-6789')
    .required('Zip Code is required'),
  country: Yup.string()
    .oneOf(['USA', 'UK', 'Australia', 'Germany', 'Sri Lanka'], 'Select a valid country')
    .required('Country is required')
})

type Address = {
  line1: string
  line2?: string
  city: string
  province: string
  zip_code: string
  country: string
}

const countryOptions = ['USA', 'UK', 'Australia', 'Germany', 'Sri Lanka']

const AddressSection: React.FC = () => {
  const { data: session, status } = useSession()
  const [address, setAddress] = useState<Address>({
    line1: '',
    line2: '',
    city: '',
    province: '',
    zip_code: '',
    country: ''
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

    const fetchAddress = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property

        setAddress({
          line1: data.address?.line1 || '',
          line2: data.address?.line2 || '',
          city: data.address?.city || '',
          province: data.address?.province || '',
          zip_code: data.address?.zip_code || '',
          country: data.address?.country || ''
        })
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching address:', err)
        setError('Failed to load address information')
        setLoading(false)
      }
    }

    fetchAddress()
  }, [session, status])

  // Handle input changes
  const handleChange = (field: keyof Address, value: any) => {
    setAddress(prev => ({ ...prev, [field]: value }))
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate the form data
      await AddressSchema.validate(address, { abortEarly: false })

      const dataToSubmit = {
        address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          province: address.province,
          zip_code: address.zip_code,
          country: address.country
        }
      }

      await axios.put('/api/user/update', dataToSubmit)
      setSuccess('Address information updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else {
        console.error('Error updating address:', err)
        setError('Failed to update address information')
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
    const fetchAddress = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user

        setAddress({
          line1: data.address?.line1 || '',
          line2: data.address?.line2 || '',
          city: data.address?.city || '',
          province: data.address?.province || '',
          zip_code: data.address?.zip_code || '',
          country: data.address?.country || ''
        })
      } catch (err: any) {
        console.error('Error refetching address:', err)
        setError('Failed to refetch address information')
      }
    }

    fetchAddress()
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Address
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Providing your address helps employers locate you easily and tailor job opportunities based on your location.
        Ensure your address details are accurate to receive relevant job notifications.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {/* Address Line 1 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Address Line 1'
              value={address.line1}
              onChange={e => handleChange('line1', e.target.value)}
              required
              InputProps={{
                readOnly: !isEditing
              }}
              error={Boolean(error && error.includes('Address Line 1'))}
              helperText={isEditing && error && error.includes('Address Line 1') ? 'Address Line 1 is required' : ''}
            />
          </Grid>
          {/* Address Line 2 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Address Line 2'
              value={address.line2}
              onChange={e => handleChange('line2', e.target.value)}
              InputProps={{
                readOnly: !isEditing
              }}
            />
          </Grid>
          {/* City */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label='City'
              value={address.city}
              onChange={e => handleChange('city', e.target.value)}
              required
              InputProps={{
                readOnly: !isEditing
              }}
              error={Boolean(error && error.includes('City'))}
              helperText={isEditing && error && error.includes('City') ? 'City is required' : ''}
            />
          </Grid>
          {/* Province/State */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label='Province/State'
              value={address.province}
              onChange={e => handleChange('province', e.target.value)}
              required
              InputProps={{
                readOnly: !isEditing
              }}
              error={Boolean(error && error.includes('Province/State'))}
              helperText={isEditing && error && error.includes('Province/State') ? 'Province/State is required' : ''}
            />
          </Grid>
          {/* Zip Code */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label='Zip Code'
              value={address.zip_code}
              onChange={e => handleChange('zip_code', e.target.value)}
              required
              InputProps={{
                readOnly: !isEditing
              }}
              error={Boolean(error && error.includes('Zip Code'))}
              helperText={
                isEditing && error && error.includes('Zip Code')
                  ? 'Zip Code must be in the format 12345 or 12345-6789'
                  : ''
              }
            />
          </Grid>
          {/* Country */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={Boolean(error && error.includes('Country'))}>
              <InputLabel>Country</InputLabel>
              <Select
                label='Country'
                value={address.country}
                onChange={e => handleChange('country', e.target.value)}
                disabled={!isEditing}
              >
                <MenuItem value=''>Select Country</MenuItem>
                {countryOptions.map(country => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
              {isEditing && error && error.includes('Country') && (
                <Typography variant='caption' color='error'>
                  Select a valid country
                </Typography>
              )}
            </FormControl>
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
              <Tooltip title='Edit Address Information'>
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

export default AddressSection
