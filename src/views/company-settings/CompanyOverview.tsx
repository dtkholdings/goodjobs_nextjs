// Path: src/components/company/CompanyOverview.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Grid, TextField, Typography, Button, CircularProgress, MenuItem, Card, Alert, Tooltip } from '@mui/material'
import { useForm, Controller, SubmitHandler, ControllerRenderProps } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'

// Define the validation schema using Yup
const CompanyOverviewSchema = Yup.object().shape({
  company_name: Yup.string().required('Company Name is required'),
  tagline: Yup.string(),
  company_username: Yup.string().required('Company Username is required'),
  short_description: Yup.string(),
  long_description: Yup.string(),
  year_founded: Yup.number()
    .typeError('Year Founded must be a number')
    .integer('Year Founded must be an integer')
    .min(1800, 'Year Founded cannot be before 1800')
    .max(new Date().getFullYear(), 'Year Founded cannot be in the future'),
  company_size: Yup.string()
    .oneOf(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'], 'Select a valid company size')
    .required('Company Size is required'),
  company_type: Yup.string()
    .oneOf(['Private', 'Public', 'Non-Profit', 'Government', 'Other'], 'Select a valid company type')
    .required('Company Type is required'),
  industries: Yup.array().of(Yup.string()),
  specialties: Yup.array().of(Yup.string()),
  services: Yup.array().of(Yup.string())
})

type CompanyOverviewForm = {
  company_name: string
  tagline: string
  company_username: string
  short_description: string
  long_description: string
  year_founded: number | null
  company_size: string
  company_type: string
  industries: string[]
  specialties: string[]
  services: string[]
}

interface CompanyOverviewProps {
  companyId: string
  onUpdate: (updatedCompany: any) => void // Adjust the type based on your ICompany interface
}

const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+']
const companyTypeOptions = ['Private', 'Public', 'Non-Profit', 'Government', 'Other']

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ companyId, onUpdate }) => {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CompanyOverviewForm>({
    resolver: yupResolver(CompanyOverviewSchema),
    defaultValues: {
      company_name: '',
      tagline: '',
      company_username: '',
      short_description: '',
      long_description: '',
      year_founded: null,
      company_size: '',
      company_type: '',
      industries: [],
      specialties: [],
      services: []
    }
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      signIn()
      return
    }

    const fetchCompanyOverview = async () => {
      try {
        const response = await axios.get(`/api/company/${companyId}`)
        const data = response.data.company // Adjust based on your API response

        // Transform data as needed
        reset({
          company_name: data.company_name || '',
          tagline: data.tagline || '',
          company_username: data.company_username || '',
          short_description: data.short_description || '',
          long_description: data.long_description || '',
          year_founded: data.year_founded || null,
          company_size: data.company_size || '',
          company_type: data.company_type || '',
          industries: data.industries ? data.industries.map((id: any) => id.toString()) : [],
          specialties: data.specialties ? data.specialties.map((id: any) => id.toString()) : [],
          services: data.services ? data.services.map((id: any) => id.toString()) : []
        })
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching company overview:', err)
        setError('Failed to load company overview')
        setLoading(false)
      }
    }

    fetchCompanyOverview()
  }, [session, status, companyId, reset])

  const onSubmit: SubmitHandler<CompanyOverviewForm> = async data => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const dataToSubmit = {
        company_name: data.company_name,
        tagline: data.tagline,
        company_username: data.company_username,
        short_description: data.short_description,
        long_description: data.long_description,
        year_founded: data.year_founded,
        company_size: data.company_size,
        company_type: data.company_type,
        industries: data.industries,
        specialties: data.specialties,
        services: data.services
      }

      const response = await axios.put(`/api/company/${companyId}`, dataToSubmit)
      onUpdate(response.data.company) // Adjust based on your API response
      setSuccess('Company overview updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error updating company overview:', err)
      setError(err.response?.data?.message || 'Failed to update company overview')

      // Auto-dismiss the error message after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    setSuccess(null)
    // Optionally, refetch the data to reset the form
    const fetchCompanyOverview = async () => {
      try {
        const response = await axios.get(`/api/company/${companyId}`)
        const data = response.data.company

        reset({
          company_name: data.company_name || '',
          tagline: data.tagline || '',
          company_username: data.company_username || '',
          short_description: data.short_description || '',
          long_description: data.long_description || '',
          year_founded: data.year_founded || null,
          company_size: data.company_size || '',
          company_type: data.company_type || '',
          industries: data.industries ? data.industries.map((id: any) => id.toString()) : [],
          specialties: data.specialties ? data.specialties.map((id: any) => id.toString()) : [],
          services: data.services ? data.services.map((id: any) => id.toString()) : []
        })
      } catch (err: any) {
        console.error('Error refetching company overview:', err)
        setError('Failed to refetch company overview')
      }
    }

    fetchCompanyOverview()
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Company Overview
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Manage your company's core information, including descriptive details and categorical associations. Ensure all
        mandatory fields are filled out to maintain a complete profile.
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} alignItems='center'>
          {/* Company Name */}
          <Grid item xs={12} sm={6}>
            <Controller
              name='company_name'
              control={control}
              render={({ field }: { field: ControllerRenderProps<CompanyOverviewForm, 'company_name'>['field'] }) => (
                <TextField
                  {...field}
                  label='Company Name'
                  fullWidth
                  required
                  error={!!errors.company_name}
                  helperText={errors.company_name?.message}
                  InputProps={{
                    readOnly: !isEditing
                  }}
                />
              )}
            />
          </Grid>
          {/* Company Username */}
          <Grid item xs={12} sm={6}>
            <Controller
              name='company_username'
              control={control}
              render={({
                field
              }: {
                field: ControllerRenderProps<CompanyOverviewForm, 'company_username'>['field']
              }) => (
                <TextField
                  {...field}
                  label='Company Username'
                  fullWidth
                  required
                  error={!!errors.company_username}
                  helperText={errors.company_username?.message}
                  InputProps={{
                    readOnly: !isEditing
                  }}
                />
              )}
            />
          </Grid>
          {/* Tagline */}
          <Grid item xs={12}>
            <Controller
              name='tagline'
              control={control}
              render={({ field }: { field: ControllerRenderProps<CompanyOverviewForm, 'tagline'>['field'] }) => (
                <TextField
                  {...field}
                  label='Tagline'
                  fullWidth
                  multiline
                  rows={2}
                  InputProps={{
                    readOnly: !isEditing
                  }}
                />
              )}
            />
          </Grid>
          {/* Short Description */}
          <Grid item xs={12}>
            <Controller
              name='short_description'
              control={control}
              render={({
                field
              }: {
                field: ControllerRenderProps<CompanyOverviewForm, 'short_description'>['field']
              }) => (
                <TextField
                  {...field}
                  label='Short Description'
                  fullWidth
                  multiline
                  rows={3}
                  InputProps={{
                    readOnly: !isEditing
                  }}
                />
              )}
            />
          </Grid>
          {/* Long Description */}
          <Grid item xs={12}>
            <Controller
              name='long_description'
              control={control}
              render={({
                field
              }: {
                field: ControllerRenderProps<CompanyOverviewForm, 'long_description'>['field']
              }) => (
                <TextField
                  {...field}
                  label='Long Description'
                  fullWidth
                  multiline
                  rows={5}
                  InputProps={{
                    readOnly: !isEditing
                  }}
                />
              )}
            />
          </Grid>
          {/* Year Founded */}
          <Grid item xs={12} sm={4}>
            <Controller
              name='year_founded'
              control={control}
              render={({ field }: { field: ControllerRenderProps<CompanyOverviewForm, 'year_founded'>['field'] }) => (
                <TextField
                  {...field}
                  label='Year Founded'
                  type='number'
                  fullWidth
                  error={!!errors.year_founded}
                  helperText={errors.year_founded?.message}
                  InputProps={{
                    readOnly: !isEditing
                  }}
                />
              )}
            />
          </Grid>
          {/* Company Size */}
          <Grid item xs={12} sm={4}>
            <Controller
              name='company_size'
              control={control}
              render={({ field }: { field: ControllerRenderProps<CompanyOverviewForm, 'company_size'>['field'] }) => (
                <TextField
                  {...field}
                  select
                  label='Company Size'
                  fullWidth
                  required
                  error={!!errors.company_size}
                  helperText={errors.company_size?.message}
                  disabled={!isEditing}
                >
                  <MenuItem value=''>Select Size</MenuItem>
                  {companySizeOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          {/* Company Type */}
          <Grid item xs={12} sm={4}>
            <Controller
              name='company_type'
              control={control}
              render={({ field }: { field: ControllerRenderProps<CompanyOverviewForm, 'company_type'>['field'] }) => (
                <TextField
                  {...field}
                  select
                  label='Company Type'
                  fullWidth
                  required
                  error={!!errors.company_type}
                  helperText={errors.company_type?.message}
                  disabled={!isEditing}
                >
                  <MenuItem value=''>Select Type</MenuItem>
                  {companyTypeOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          {/* Industries */}
          <Grid item xs={12} sm={4}>
            <Controller
              name='industries'
              control={control}
              render={({ field }: { field: ControllerRenderProps<CompanyOverviewForm, 'industries'>['field'] }) => (
                <TextField
                  {...field}
                  select
                  label='Industries'
                  fullWidth
                  SelectProps={{
                    multiple: true
                  }}
                  disabled={!isEditing}
                >
                  {/* Replace with dynamic options from your Industries collection */}
                  <MenuItem value='industry1'>Industry 1</MenuItem>
                  <MenuItem value='industry2'>Industry 2</MenuItem>
                  <MenuItem value='industry3'>Industry 3</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          {/* Specialties */}
          <Grid item xs={12} sm={4}>
            <Controller
              name='specialties'
              control={control}
              render={({ field }: { field: ControllerRenderProps<CompanyOverviewForm, 'specialties'>['field'] }) => (
                <TextField
                  {...field}
                  select
                  label='Specialties'
                  fullWidth
                  SelectProps={{
                    multiple: true
                  }}
                  disabled={!isEditing}
                >
                  {/* Replace with dynamic options from your Specialties collection */}
                  <MenuItem value='specialty1'>Specialty 1</MenuItem>
                  <MenuItem value='specialty2'>Specialty 2</MenuItem>
                  <MenuItem value='specialty3'>Specialty 3</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          {/* Services */}
          <Grid item xs={12} sm={4}>
            <Controller
              name='services'
              control={control}
              render={({ field }: { field: ControllerRenderProps<CompanyOverviewForm, 'services'>['field'] }) => (
                <TextField
                  {...field}
                  select
                  label='Services'
                  fullWidth
                  SelectProps={{
                    multiple: true
                  }}
                  disabled={!isEditing}
                >
                  {/* Replace with dynamic options from your Services collection */}
                  <MenuItem value='service1'>Service 1</MenuItem>
                  <MenuItem value='service2'>Service 2</MenuItem>
                  <MenuItem value='service3'>Service 3</MenuItem>
                </TextField>
              )}
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
              <Tooltip title='Edit Company Overview'>
                <Button variant='outlined' color='secondary' onClick={() => setIsEditing(true)} disabled={saving}>
                  Edit
                </Button>
              </Tooltip>
            ) : (
              <Grid container spacing={1}>
                <Grid item>
                  <Button type='submit' variant='contained' color='primary' disabled={saving}>
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

export default CompanyOverview
