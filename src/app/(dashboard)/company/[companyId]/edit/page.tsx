// src/app/(dashboard)/company/[companyId]/page.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  Alert,
  Tooltip,
  InputAdornment,
  IconButton,
  Checkbox,
  CircularProgress,
  MenuItem,
  Avatar
} from '@mui/material'
import { Autocomplete } from '@mui/material'
import { useDebounce } from 'use-debounce'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
import * as Yup from 'yup'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

// Define the validation schema using Yup
const CompanySchema = Yup.object().shape({
  company_name: Yup.string().required('Company Name is required'),
  tagline: Yup.string(),
  company_username: Yup.string(),
  company_logo: Yup.string().url('Must be a valid URL'),
  company_cover_image: Yup.string().url('Must be a valid URL'),
  year_founded: Yup.number()
    .min(1800, 'Year Founded cannot be before 1800')
    .max(new Date().getFullYear(), 'Year Founded cannot be in the future'),
  company_size: Yup.string().oneOf(
    ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'],
    'Select a valid company size'
  ),
  company_type: Yup.string().oneOf(
    ['Private', 'Public', 'Non-Profit', 'Government', 'Other'],
    'Select a valid company type'
  ),
  industries: Yup.array().of(Yup.string()).max(3, 'You can select up to 3 industries'),
  specialties: Yup.array().of(
    Yup.object().shape({
      _id: Yup.string().required(),
      specialty_name: Yup.string().required('Specialty name is required')
    })
  ),
  services: Yup.array().of(
    Yup.object().shape({
      _id: Yup.string().required(),
      service_name: Yup.string().required('Service name is required')
    })
  ),
  short_description: Yup.string(),
  long_description: Yup.string(),
  inquiry_email: Yup.string().email('Must be a valid email'),
  support_email: Yup.string().email('Must be a valid email'),
  general_phone_number: Yup.string(),
  secondary_phone_number: Yup.string(),
  fax: Yup.string(),
  address: Yup.object().shape({
    line1: Yup.string().required('Address Line 1 is required'),
    line2: Yup.string(),
    city: Yup.string(),
    zip_code: Yup.string(),
    country: Yup.string()
  }),
  social_links: Yup.object().shape({
    linkedin: Yup.string().url('Must be a valid URL'),
    facebook: Yup.string().url('Must be a valid URL'),
    instagram: Yup.string().url('Must be a valid URL'),
    tiktok: Yup.string().url('Must be a valid URL'),
    twitter: Yup.string().url('Must be a valid URL'),
    github: Yup.string().url('Must be a valid URL'),
    website: Yup.string().url('Must be a valid URL'),
    youtube: Yup.string().url('Must be a valid URL')
  })
})

// Define the Specialty, Service, and Industry types
type Specialty = {
  _id: string
  specialty_name: string
}

type Service = {
  _id: string
  service_name: string
  description?: string
}

type Industry = {
  _id: string
  name: string
  description?: string
}

type CompanyForm = {
  company_name: string
  tagline: string
  company_username: string
  company_logo: string
  company_cover_image: string
  year_founded: number | null
  company_size: string
  company_type: string
  industries: string[] // Array of Industry IDs
  specialties: Specialty[] // Array of Specialty objects
  services: Service[] // Array of Service objects
  short_description: string
  long_description: string
  inquiry_email: string
  support_email: string
  general_phone_number: string
  secondary_phone_number: string
  fax: string
  address: {
    line1: string
    line2?: string
    city?: string
    zip_code?: string
    country?: string
  }
  social_links: {
    linkedin?: string
    facebook?: string
    instagram?: string
    tiktok?: string
    twitter?: string
    github?: string
    website?: string
    youtube?: string
  }
}

const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+']
const companyTypeOptions = ['Private', 'Public', 'Non-Profit', 'Government', 'Other']

const EditCompany: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId || ''

  const [companyForm, setCompanyForm] = useState<CompanyForm | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // States for Specialties Autocomplete
  const [specialtyOptions, setSpecialtyOptions] = useState<Specialty[]>([])
  const [specialtyInputValue, setSpecialtyInputValue] = useState<string>('')
  const [debouncedSpecialtyInputValue] = useDebounce(specialtyInputValue, 500)
  const [loadingSpecialties, setLoadingSpecialties] = useState<boolean>(false)

  // States for Services Autocomplete
  const [serviceOptions, setServiceOptions] = useState<Service[]>([])
  const [serviceInputValue, setServiceInputValue] = useState<string>('')
  const [debouncedServiceInputValue] = useDebounce(serviceInputValue, 500)
  const [loadingServices, setLoadingServices] = useState<boolean>(false)

  // States for Industries Autocomplete
  const [industryOptions, setIndustryOptions] = useState<Industry[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>([])
  const [industryInputValue, setIndustryInputValue] = useState<string>('')
  const [debouncedIndustryInputValue] = useDebounce(industryInputValue, 500)
  const [loadingIndustries, setLoadingIndustries] = useState<boolean>(false)

  // States for image uploads
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // State for username availability
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      signIn()
      return
    }

    // Fetch company data
    const fetchCompany = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/company/${companyId}`)
        const data: CompanyForm = response.data

        setCompanyForm(data)
        console.log(data)
      } catch (err: any) {
        console.error('Error fetching company:', err)
        setError('Failed to fetch company data.')
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [session, status, companyId])

  // Fetch Specialties based on input
  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoadingSpecialties(true)
      try {
        const response = await axios.get('/api/specialties', {
          params: { q: debouncedSpecialtyInputValue }
        })
        setSpecialtyOptions(response.data)
      } catch (err) {
        console.error('Error fetching specialties:', err)
      } finally {
        setLoadingSpecialties(false)
      }
    }

    if (debouncedSpecialtyInputValue !== '') {
      fetchSpecialties()
    } else {
      setSpecialtyOptions([])
    }
  }, [debouncedSpecialtyInputValue])

  // Fetch Services based on input
  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true)
      try {
        const response = await axios.get('/api/services', {
          params: { q: debouncedServiceInputValue }
        })
        setServiceOptions(response.data)
      } catch (err) {
        console.error('Error fetching services:', err)
      } finally {
        setLoadingServices(false)
      }
    }

    if (debouncedServiceInputValue !== '') {
      fetchServices()
    } else {
      setServiceOptions([])
    }
  }, [debouncedServiceInputValue])

  // Fetch Industries based on input
  useEffect(() => {
    const fetchIndustries = async () => {
      setLoadingIndustries(true)
      try {
        const response = await axios.get('/api/industries', {
          params: { q: debouncedIndustryInputValue }
        })
        const fetchedIndustries: Industry[] = response.data

        // Merge selected industries with fetched industries to ensure selected ones are always present
        const mergedIndustries = [
          ...fetchedIndustries,
          ...selectedIndustries.filter(selected => !fetchedIndustries.some(fetched => fetched._id === selected._id))
        ]

        setIndustryOptions(mergedIndustries)
        console.log('Merged Industries:', mergedIndustries) // Debugging
      } catch (err) {
        console.error('Error fetching industries:', err)
      } finally {
        setLoadingIndustries(false)
      }
    }

    if (debouncedIndustryInputValue !== '') {
      fetchIndustries()
    } else {
      // Fetch default industries when input is empty
      const fetchDefaultIndustries = async () => {
        setLoadingIndustries(true)
        try {
          const response = await axios.get('/api/industries')
          const fetchedIndustries: Industry[] = response.data

          // Merge selected industries with fetched industries
          const mergedIndustries = [
            ...fetchedIndustries,
            ...selectedIndustries.filter(selected => !fetchedIndustries.some(fetched => fetched._id === selected._id))
          ]

          setIndustryOptions(mergedIndustries)
          console.log('Fetched Default and Merged Industries:', mergedIndustries) // Debugging
        } catch (err) {
          console.error('Error fetching default industries:', err)
        } finally {
          setLoadingIndustries(false)
        }
      }
      fetchDefaultIndustries()
    }
  }, [debouncedIndustryInputValue, selectedIndustries])

  // Handle input changes for simple fields
  const handleChange = (
    field: keyof CompanyForm | keyof CompanyForm['address'] | keyof CompanyForm['social_links'],
    value: any
  ) => {
    if (field in companyForm!.address) {
      setCompanyForm(prev => ({
        ...prev!,
        address: { ...prev!.address, [field]: value }
      }))
    } else if (field in companyForm!.social_links) {
      setCompanyForm(prev => ({
        ...prev!,
        social_links: { ...prev!.social_links, [field]: value }
      }))
    } else {
      setCompanyForm(prev => ({ ...prev!, [field]: value }))
    }
  }

  // Handle Specialties change
  const handleSpecialtiesChange = async (event: any, newValue: (Specialty | string)[]) => {
    // Check if the last entered value is a new specialty (string)
    const lastValue = newValue[newValue.length - 1]
    if (typeof lastValue === 'string') {
      try {
        // Create new specialty via API
        const response = await axios.post('/api/specialties', { specialty_name: lastValue })
        const newSpecialty: Specialty = response.data
        setCompanyForm(prev => ({
          ...prev!,
          specialties: [...prev!.specialties, newSpecialty]
        }))
      } catch (err: any) {
        console.error('Error creating new specialty:', err)
        setError('Failed to add new specialty')
        // Optionally, handle the failed addition (e.g., remove the string entry)
      }
    } else {
      // newValue contains only Specialty objects
      setCompanyForm(prev => ({
        ...prev!,
        specialties: newValue as Specialty[]
      }))
    }
  }

  // Handle Services change
  const handleServicesChange = async (event: any, newValue: (Service | string)[]) => {
    // Check if the last entered value is a new service (string)
    const lastValue = newValue[newValue.length - 1]
    if (typeof lastValue === 'string') {
      try {
        // Create new service via API
        const response = await axios.post('/api/services', { service_name: lastValue })
        const newService: Service = response.data
        setCompanyForm(prev => ({
          ...prev!,
          services: [...prev!.services, newService]
        }))
      } catch (err: any) {
        console.error('Error creating new service:', err)
        setError('Failed to add new service')
        // Optionally, handle the failed addition (e.g., remove the string entry)
      }
    } else {
      // newValue contains only Service objects
      setCompanyForm(prev => ({
        ...prev!,
        services: newValue as Service[]
      }))
    }
  }

  // Function to check username availability
  const checkUsernameAvailability = async () => {
    const username = companyForm!.company_username.trim()

    // If username is empty, do not proceed
    if (!username) {
      setError('Please enter a company username to check.')
      setIsUsernameAvailable(null)
      return
    }

    setCheckingUsername(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await axios.get('/api/company/check-username', {
        params: { username }
      })

      if (response.data.available) {
        setIsUsernameAvailable(true)
        setSuccess('Username is available!')
      } else {
        setIsUsernameAvailable(false)
        setError('Username is already taken.')
      }
    } catch (err: any) {
      console.error('Error checking username:', err)
      setError('Failed to check username availability.')
      setIsUsernameAvailable(null)
    } finally {
      setCheckingUsername(false)
    }
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate the form data
      await CompanySchema.validate(companyForm!, { abortEarly: false })

      // Ensure username is available before submitting
      if (isUsernameAvailable === false) {
        setError('Please choose a different company username.')
        setSaving(false)
        return
      }

      // Prepare data to submit
      const dataToSubmit = {
        ...companyForm,
        year_founded: companyForm?.year_founded,
        address: companyForm?.address,
        social_links: companyForm?.social_links,
        industries: companyForm?.industries, // Array of Industry IDs
        specialties: companyForm?.specialties.map(s => s._id),
        services: companyForm?.services.map(s => s._id)
        // admins: [session?.user.id] // Assuming the current user is the admin
      }

      const response = await axios.put(`/api/company/${companyId}`, dataToSubmit)

      if (response.data.success) {
        setSuccess('Company updated successfully')
        setIsEditing(false)
        // Optionally, refresh data or redirect
      } else {
        setError('Failed to update company')
      }

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error)
      } else {
        console.error('Error updating company:', err)
        setError('Failed to update company')
      }

      // Auto-dismiss the error message after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  // Handle Cover Image Upload
  const handleCoverImageUpload = async () => {
    if (!coverImageFile) return

    const formData = new FormData()
    formData.append('image', coverImageFile)

    try {
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const { url } = response.data
      setCompanyForm(prev => ({
        ...prev!,
        company_cover_image: url
      }))
      setCoverImageFile(null)
      setSuccess('Cover image uploaded successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error uploading cover image:', err)
      setError('Failed to upload cover image.')
      setTimeout(() => setError(null), 5000)
    }
  }

  // Handle Logo Upload
  const handleLogoUpload = async () => {
    if (!logoFile) return

    const formData = new FormData()
    formData.append('image', logoFile)

    try {
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const { url } = response.data
      setCompanyForm(prev => ({
        ...prev!,
        company_logo: url
      }))
      setLogoFile(null)
      setSuccess('Logo uploaded successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error uploading logo:', err)
      setError('Failed to upload logo.')
      setTimeout(() => setError(null), 5000)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Grid container justifyContent='center' alignItems='center' style={{ height: '100vh' }}>
        <CircularProgress />
      </Grid>
    )
  }

  if (!companyForm) {
    return (
      <Typography variant='h6' align='center'>
        Loading...
      </Typography>
    )
  }

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Grid container justifyContent='space-between' alignItems='center'>
        <Grid item>
          <Typography variant='h6' gutterBottom>
            Company Information
          </Typography>
        </Grid>
        <Grid item>
          {!isEditing ? (
            <Tooltip title='Edit Company'>
              <Button onClick={() => setIsEditing(true)}>
                <EditIcon /> Edit
              </Button>
            </Tooltip>
          ) : (
            <Grid container spacing={1}>
              <Grid item>
                <Tooltip title='Save Changes'>
                  <IconButton type='submit' form='company-form' disabled={saving}>
                    <SaveIcon color='primary' />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title='Cancel'>
                  <IconButton
                    onClick={() => {
                      setIsEditing(false)
                      setError(null)
                      setSuccess(null)
                      // Optionally, reset companyForm to initial data
                    }}
                  >
                    <CancelIcon color='error' />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Feedback Messages */}
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

      <form id='company-form' onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Cover Image Section */}
          <Grid item xs={12}>
            <Typography variant='subtitle1' gutterBottom>
              Cover Image
            </Typography>
            {isEditing ? (
              <>
                {companyForm.company_cover_image && (
                  <img
                    src={companyForm.company_cover_image}
                    alt='Cover Image'
                    style={{ width: '100%', height: 'auto', borderRadius: 8, marginBottom: 8 }}
                  />
                )}
                <Grid container alignItems='center' spacing={2}>
                  <Grid item>
                    <input
                      accept='image/*'
                      style={{ display: 'none' }}
                      id='cover-image-upload'
                      type='file'
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setCoverImageFile(e.target.files[0])
                        }
                      }}
                    />
                    <label htmlFor='cover-image-upload'>
                      <Button variant='contained' component='span'>
                        Choose Cover Image
                      </Button>
                    </label>
                  </Grid>
                  <Grid item>
                    <Button
                      variant='outlined'
                      color='primary'
                      onClick={handleCoverImageUpload}
                      disabled={!coverImageFile}
                    >
                      Upload
                    </Button>
                  </Grid>
                </Grid>
              </>
            ) : companyForm.company_cover_image ? (
              <img
                src={companyForm.company_cover_image}
                alt='Cover Image'
                style={{ width: '100%', height: 'auto', borderRadius: 8 }}
              />
            ) : (
              <Typography variant='body2' color='textSecondary'>
                No cover image provided.
              </Typography>
            )}
          </Grid>

          {/* Logo Section */}
          <Grid item xs={12}>
            <Typography variant='subtitle1' gutterBottom>
              Company Logo
            </Typography>
            {isEditing ? (
              <>
                {companyForm.company_logo && (
                  <Avatar
                    src={companyForm.company_logo}
                    alt='Company Logo'
                    sx={{ width: 100, height: 100, marginBottom: 2 }}
                  />
                )}
                <Grid container alignItems='center' spacing={2}>
                  <Grid item>
                    <input
                      accept='image/*'
                      style={{ display: 'none' }}
                      id='logo-upload'
                      type='file'
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setLogoFile(e.target.files[0])
                        }
                      }}
                    />
                    <label htmlFor='logo-upload'>
                      <Button variant='contained' component='span'>
                        Choose Logo
                      </Button>
                    </label>
                  </Grid>
                  <Grid item>
                    <Button variant='outlined' color='primary' onClick={handleLogoUpload} disabled={!logoFile}>
                      Upload
                    </Button>
                  </Grid>
                </Grid>
              </>
            ) : companyForm.company_logo ? (
              <Avatar src={companyForm.company_logo} alt='Company Logo' sx={{ width: 100, height: 100 }} />
            ) : (
              <Typography variant='body2' color='textSecondary'>
                No logo provided.
              </Typography>
            )}
          </Grid>

          {/* Company Name */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Company Name'
                value={companyForm.company_name}
                onChange={e => handleChange('company_name', e.target.value)}
                required
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Company Name</Typography>
                <Typography variant='body1'>{companyForm.company_name}</Typography>
              </>
            )}
          </Grid>

          {/* Tagline */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Tagline'
                value={companyForm.tagline}
                onChange={e => handleChange('tagline', e.target.value)}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Tagline</Typography>
                <Typography variant='body1'>{companyForm.tagline || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Company Username */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Company Username'
                value={companyForm.company_username}
                onChange={e => {
                  handleChange('company_username', e.target.value)
                  setIsUsernameAvailable(null) // Reset availability status on change
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Tooltip title='Check Username Availability'>
                        <IconButton
                          onClick={checkUsernameAvailability}
                          edge='end'
                          disabled={checkingUsername || !companyForm.company_username?.trim()}
                        >
                          {checkingUsername ? (
                            <CircularProgress size={24} />
                          ) : isUsernameAvailable === true ? (
                            <i className='ri-check-line' style={{ color: 'green' }} />
                          ) : isUsernameAvailable === false ? (
                            <i className='ri-close-line' style={{ color: 'red' }} />
                          ) : (
                            <i className='ri-question-line' style={{ color: 'gray' }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Company Username</Typography>
                <Typography variant='body1'>{companyForm.company_username}</Typography>
              </>
            )}
          </Grid>

          {/* Year Founded */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Year Founded'
                value={companyForm.year_founded || ''}
                onChange={e => handleChange('year_founded', e.target.value ? parseInt(e.target.value) : null)}
                type='number'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Year Founded</Typography>
                <Typography variant='body1'>{companyForm.year_founded || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Company Size */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                select
                fullWidth
                label='Company Size'
                value={companyForm.company_size}
                onChange={e => handleChange('company_size', e.target.value)}
                margin='normal'
              >
                <MenuItem value=''>Select Size</MenuItem>
                {companySizeOptions.map(size => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <>
                <Typography variant='subtitle2'>Company Size</Typography>
                <Typography variant='body1'>{companyForm.company_size || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Company Type */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                select
                fullWidth
                label='Company Type'
                value={companyForm.company_type}
                onChange={e => handleChange('company_type', e.target.value)}
                margin='normal'
              >
                <MenuItem value=''>Select Type</MenuItem>
                {companyTypeOptions.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <>
                <Typography variant='subtitle2'>Company Type</Typography>
                <Typography variant='body1'>{companyForm.company_type || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Industries */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <Autocomplete
                multiple
                options={industryOptions}
                getOptionLabel={(option: Industry) => option.name}
                value={selectedIndustries}
                onChange={(event, newValue) => {
                  if (newValue.length > 3) return
                  setSelectedIndustries(newValue)
                  setCompanyForm(prev => ({
                    ...prev!,
                    industries: newValue.map(industry => industry._id)
                  }))
                }}
                inputValue={industryInputValue}
                onInputChange={(event, newInputValue) => setIndustryInputValue(newInputValue)}
                filterSelectedOptions
                loading={loadingIndustries}
                limitTags={3}
                disableCloseOnSelect
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={<i className='ri-checkbox-blank-circle-line' />}
                      checkedIcon={<i className='ri-checkbox-circle-line' />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                      disabled={selectedIndustries.length >= 3 && !selected}
                    />
                    {option.name}
                  </li>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Industries'
                    placeholder='Select industries'
                    helperText='You can select up to 3 industries'
                    margin='normal'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingIndustries ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Industries</Typography>
                <Typography variant='body1'>
                  {selectedIndustries?.length > 0 ? selectedIndustries.map(ind => ind.name).join(', ') : 'N/A'}
                </Typography>
              </>
            )}
          </Grid>

          {/* Specialties */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <Autocomplete
                multiple
                options={specialtyOptions}
                getOptionLabel={(option: string | Specialty) =>
                  typeof option === 'string' ? option : option.specialty_name
                }
                value={companyForm.specialties}
                onChange={handleSpecialtiesChange}
                inputValue={specialtyInputValue}
                onInputChange={(event, newInputValue) => setSpecialtyInputValue(newInputValue)}
                filterSelectedOptions
                loading={loadingSpecialties}
                freeSolo
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Specialties'
                    placeholder='Add specialty'
                    margin='normal'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingSpecialties ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Specialties</Typography>
                <Typography variant='body1'>
                  {companyForm.specialties?.length > 0
                    ? companyForm.specialties.map(spec => spec.specialty_name).join(', ')
                    : 'N/A'}
                </Typography>
              </>
            )}
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <Autocomplete
                multiple
                options={serviceOptions}
                getOptionLabel={(option: string | Service) =>
                  typeof option === 'string' ? option : option.service_name
                }
                value={companyForm.services}
                onChange={handleServicesChange}
                inputValue={serviceInputValue}
                onInputChange={(event, newInputValue) => setServiceInputValue(newInputValue)}
                filterSelectedOptions
                loading={loadingServices}
                freeSolo
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Services'
                    placeholder='Add service'
                    margin='normal'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingServices ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Services</Typography>
                <Typography variant='body1'>
                  {companyForm.services?.length > 0
                    ? companyForm.services.map(serv => serv.service_name).join(', ')
                    : 'N/A'}
                </Typography>
              </>
            )}
          </Grid>

          {/* Short Description */}
          <Grid item xs={12}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Short Description'
                value={companyForm.short_description}
                onChange={e => handleChange('short_description', e.target.value)}
                multiline
                rows={2}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Short Description</Typography>
                <Typography variant='body1'>{companyForm.short_description || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Long Description */}
          <Grid item xs={12}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Long Description'
                value={companyForm.long_description}
                onChange={e => handleChange('long_description', e.target.value)}
                multiline
                rows={4}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Long Description</Typography>
                <Typography variant='body1'>{companyForm.long_description || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Inquiry Email */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Inquiry Email'
                value={companyForm.inquiry_email}
                onChange={e => handleChange('inquiry_email', e.target.value)}
                type='email'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Inquiry Email</Typography>
                <Typography variant='body1'>{companyForm.inquiry_email || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Support Email */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Support Email'
                value={companyForm.support_email}
                onChange={e => handleChange('support_email', e.target.value)}
                type='email'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Support Email</Typography>
                <Typography variant='body1'>{companyForm.support_email || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* General Phone Number */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='General Phone Number'
                value={companyForm.general_phone_number}
                onChange={e => handleChange('general_phone_number', e.target.value)}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>General Phone Number</Typography>
                <Typography variant='body1'>{companyForm.general_phone_number || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Secondary Phone Number */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Secondary Phone Number'
                value={companyForm.secondary_phone_number}
                onChange={e => handleChange('secondary_phone_number', e.target.value)}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Secondary Phone Number</Typography>
                <Typography variant='body1'>{companyForm.secondary_phone_number || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Fax */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Fax'
                value={companyForm.fax}
                onChange={e => handleChange('fax', e.target.value)}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Fax</Typography>
                <Typography variant='body1'>{companyForm.fax || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Address Line 1 */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Address Line 1'
                value={companyForm.address?.line1}
                onChange={e => handleChange('line1', e.target.value)}
                required
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Address Line 1</Typography>
                <Typography variant='body1'>{companyForm.address?.line1}</Typography>
              </>
            )}
          </Grid>

          {/* Address Line 2 */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Address Line 2'
                value={companyForm.address?.line2}
                onChange={e => handleChange('line2', e.target.value)}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Address Line 2</Typography>
                <Typography variant='body1'>{companyForm.address?.line2 || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* City */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='City'
                value={companyForm.address?.city}
                onChange={e => handleChange('city', e.target.value)}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>City</Typography>
                <Typography variant='body1'>{companyForm.address?.city || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Zip Code */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Zip Code'
                value={companyForm.address?.zip_code}
                onChange={e => handleChange('zip_code', e.target.value)}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Zip Code</Typography>
                <Typography variant='body1'>{companyForm.address?.zip_code || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Country */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Country'
                value={companyForm.address?.country}
                onChange={e => handleChange('country', e.target.value)}
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Country</Typography>
                <Typography variant='body1'>{companyForm.address?.country || 'N/A'}</Typography>
              </>
            )}
          </Grid>

          {/* Social Links */}
          <Grid item xs={12}>
            <Typography variant='subtitle1' gutterBottom>
              Social Links
            </Typography>
          </Grid>

          {/* LinkedIn */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='LinkedIn URL'
                value={companyForm.social_links?.linkedin}
                onChange={e => handleChange('linkedin', e.target.value)}
                type='url'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>LinkedIn</Typography>
                <Typography variant='body1'>
                  {companyForm.social_links?.linkedin ? (
                    <a href={companyForm.social_links?.linkedin} target='_blank' rel='noopener noreferrer'>
                      {companyForm.social_links?.linkedin}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </>
            )}
          </Grid>

          {/* Facebook */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Facebook URL'
                value={companyForm.social_links?.facebook}
                onChange={e => handleChange('facebook', e.target.value)}
                type='url'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Facebook</Typography>
                <Typography variant='body1'>
                  {companyForm.social_links?.facebook ? (
                    <a href={companyForm.social_links?.facebook} target='_blank' rel='noopener noreferrer'>
                      {companyForm.social_links?.facebook}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </>
            )}
          </Grid>

          {/* Instagram */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Instagram URL'
                value={companyForm.social_links?.instagram}
                onChange={e => handleChange('instagram', e.target.value)}
                type='url'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Instagram</Typography>
                <Typography variant='body1'>
                  {companyForm.social_links?.instagram ? (
                    <a href={companyForm.social_links?.instagram} target='_blank' rel='noopener noreferrer'>
                      {companyForm.social_links?.instagram}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </>
            )}
          </Grid>

          {/* Twitter */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Twitter URL'
                value={companyForm.social_links?.twitter}
                onChange={e => handleChange('twitter', e.target.value)}
                type='url'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Twitter</Typography>
                <Typography variant='body1'>
                  {companyForm.social_links?.twitter ? (
                    <a href={companyForm.social_links?.twitter} target='_blank' rel='noopener noreferrer'>
                      {companyForm.social_links?.twitter}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </>
            )}
          </Grid>

          {/* YouTube */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='YouTube URL'
                value={companyForm.social_links?.youtube}
                onChange={e => handleChange('youtube', e.target.value)}
                type='url'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>YouTube</Typography>
                <Typography variant='body1'>
                  {companyForm.social_links?.youtube ? (
                    <a href={companyForm.social_links?.youtube} target='_blank' rel='noopener noreferrer'>
                      {companyForm.social_links?.youtube}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </>
            )}
          </Grid>

          {/* TikTok */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='TikTok URL'
                value={companyForm.social_links?.tiktok}
                onChange={e => handleChange('tiktok', e.target.value)}
                type='url'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>TikTok</Typography>
                <Typography variant='body1'>
                  {companyForm.social_links?.tiktok ? (
                    <a href={companyForm.social_links?.tiktok} target='_blank' rel='noopener noreferrer'>
                      {companyForm.social_links?.tiktok}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </>
            )}
          </Grid>

          {/* GitHub */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='GitHub URL'
                value={companyForm.social_links?.github}
                onChange={e => handleChange('github', e.target.value)}
                type='url'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>GitHub</Typography>
                <Typography variant='body1'>
                  {companyForm.social_links?.github ? (
                    <a href={companyForm.social_links?.github} target='_blank' rel='noopener noreferrer'>
                      {companyForm.social_links?.github}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </>
            )}
          </Grid>

          {/* Website */}
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label='Website URL'
                value={companyForm.social_links?.website}
                onChange={e => handleChange('website', e.target.value)}
                type='url'
                margin='normal'
              />
            ) : (
              <>
                <Typography variant='subtitle2'>Website</Typography>
                <Typography variant='body1'>
                  {companyForm.social_links?.website ? (
                    <a href={companyForm.social_links?.website} target='_blank' rel='noopener noreferrer'>
                      {companyForm.social_links?.website}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default EditCompany

// // src/app/(dashboard)/company/[companyId]/page.tsx

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { useRouter, useParams  } from 'next/navigation'
// import {
//   Typography,
//   TextField,
//   Button,
//   Grid,
//   Card,
//   Alert,
//   Tooltip,
//   InputAdornment,
//   IconButton,
//   Checkbox,
//   CircularProgress,
//   MenuItem,
//   Avatar
// } from '@mui/material'
// import { Autocomplete } from '@mui/material'
// import { useDebounce } from 'use-debounce'
// import axios from 'axios'
// import { useSession, signIn } from 'next-auth/react'
// import * as Yup from 'yup'
// import EditIcon from '@mui/icons-material/Edit'
// import SaveIcon from '@mui/icons-material/Save'
// import CancelIcon from '@mui/icons-material/Cancel'

// // Define the validation schema using Yup
// const CompanySchema = Yup.object().shape({
//   company_name: Yup.string().required('Company Name is required'),
//   tagline: Yup.string(),
//   company_username: Yup.string(),
//   company_logo: Yup.string().url('Must be a valid URL'),
//   company_cover_image: Yup.string().url('Must be a valid URL'),
//   year_founded: Yup.number()
//     .min(1800, 'Year Founded cannot be before 1800')
//     .max(new Date().getFullYear(), 'Year Founded cannot be in the future'),
//   company_size: Yup.string().oneOf(
//     ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'],
//     'Select a valid company size'
//   ),
//   company_type: Yup.string().oneOf(
//     ['Private', 'Public', 'Non-Profit', 'Government', 'Other'],
//     'Select a valid company type'
//   ),
//   industries: Yup.array().of(Yup.string()).max(3, 'You can select up to 3 industries'),
//   specialties: Yup.array().of(
//     Yup.object().shape({
//       _id: Yup.string().required(),
//       specialty_name: Yup.string().required('Specialty name is required')
//     })
//   ),
//   services: Yup.array().of(
//     Yup.object().shape({
//       _id: Yup.string().required(),
//       service_name: Yup.string().required('Service name is required')
//     })
//   ),
//   short_description: Yup.string(),
//   long_description: Yup.string(),
//   inquiry_email: Yup.string().email('Must be a valid email'),
//   support_email: Yup.string().email('Must be a valid email'),
//   general_phone_number: Yup.string(),
//   secondary_phone_number: Yup.string(),
//   fax: Yup.string(),
//   address: Yup.object().shape({
//     line1: Yup.string().required('Address Line 1 is required'),
//     line2: Yup.string(),
//     city: Yup.string(),
//     zip_code: Yup.string(),
//     country: Yup.string()
//   }),
//   social_links: Yup.object().shape({
//     linkedin: Yup.string().url('Must be a valid URL'),
//     facebook: Yup.string().url('Must be a valid URL'),
//     instagram: Yup.string().url('Must be a valid URL'),
//     tiktok: Yup.string().url('Must be a valid URL'),
//     twitter: Yup.string().url('Must be a valid URL'),
//     github: Yup.string().url('Must be a valid URL'),
//     website: Yup.string().url('Must be a valid URL'),
//     youtube: Yup.string().url('Must be a valid URL')
//   })
// })

// // Define the Specialty, Service, and Industry types
// type Specialty = {
//   _id: string
//   specialty_name: string
// }

// type Service = {
//   _id: string
//   service_name: string
//   description?: string
// }

// type Industry = {
//   _id: string
//   name: string
//   description?: string
// }

// type CompanyForm = {
//   company_name: string
//   tagline: string
//   company_username: string
//   company_logo: string
//   company_cover_image: string
//   year_founded: number | null
//   company_size: string
//   company_type: string
//   industries: string[] // Array of Industry IDs
//   specialties: Specialty[] // Array of Specialty objects
//   services: Service[] // Array of Service objects
//   short_description: string
//   long_description: string
//   inquiry_email: string
//   support_email: string
//   general_phone_number: string
//   secondary_phone_number: string
//   fax: string
//   address: {
//     line1: string
//     line2?: string
//     city?: string
//     zip_code?: string
//     country?: string
//   }
//   social_links: {
//     linkedin?: string
//     facebook?: string
//     instagram?: string
//     tiktok?: string
//     twitter?: string
//     github?: string
//     website?: string
//     youtube?: string
//   }
// }

// const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+']
// const companyTypeOptions = ['Private', 'Public', 'Non-Profit', 'Government', 'Other']

// const EditCompany: React.FC = () => {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const searchParams = useParams ()
//   const companyId = searchParams.get('companyId') || ''

//   const [companyForm, setCompanyForm] = useState<CompanyForm | null>(null)
//   const [loading, setLoading] = useState<boolean>(true)
//   const [saving, setSaving] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)
//   const [isEditing, setIsEditing] = useState<boolean>(false)

//   // States for Specialties Autocomplete
//   const [specialtyOptions, setSpecialtyOptions] = useState<Specialty[]>([])
//   const [specialtyInputValue, setSpecialtyInputValue] = useState<string>('')
//   const [debouncedSpecialtyInputValue] = useDebounce(specialtyInputValue, 500)
//   const [loadingSpecialties, setLoadingSpecialties] = useState<boolean>(false)

//   // States for Services Autocomplete
//   const [serviceOptions, setServiceOptions] = useState<Service[]>([])
//   const [serviceInputValue, setServiceInputValue] = useState<string>('')
//   const [debouncedServiceInputValue] = useDebounce(serviceInputValue, 500)
//   const [loadingServices, setLoadingServices] = useState<boolean>(false)

//   // States for Industries Autocomplete
//   const [industryOptions, setIndustryOptions] = useState<Industry[]>([])
//   const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>([])
//   const [industryInputValue, setIndustryInputValue] = useState<string>('')
//   const [debouncedIndustryInputValue] = useDebounce(industryInputValue, 500)
//   const [loadingIndustries, setLoadingIndustries] = useState<boolean>(false)

//   // States for image uploads
//   const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
//   const [logoFile, setLogoFile] = useState<File | null>(null)

//   // State for username availability
//   const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
//   const [checkingUsername, setCheckingUsername] = useState<boolean>(false)

//   useEffect(() => {
//     if (status === 'loading') return
//     if (!session) {
//       signIn()
//       return
//     }

//     // Fetch company data
//     const fetchCompany = async () => {
//       setLoading(true)
//       try {
//         const response = await axios.get(`/api/company/${companyId}`)
//         const data: CompanyForm = response.data

//         setCompanyForm(data)
//         // Fetch the selected industries to populate selectedIndustries
//         const fetchedIndustries: Industry[] = data.industries as unknown as Industry[]
//         setSelectedIndustries(fetchedIndustries)
//       } catch (err: any) {
//         console.error('Error fetching company:', err)
//         setError('Failed to fetch company data.')
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchCompany()
//   }, [session, status, companyId])

//   // Fetch Specialties based on input
//   useEffect(() => {
//     const fetchSpecialties = async () => {
//       setLoadingSpecialties(true)
//       try {
//         const response = await axios.get('/api/specialties', {
//           params: { q: debouncedSpecialtyInputValue }
//         })
//         setSpecialtyOptions(response.data)
//       } catch (err) {
//         console.error('Error fetching specialties:', err)
//       } finally {
//         setLoadingSpecialties(false)
//       }
//     }

//     if (debouncedSpecialtyInputValue !== '') {
//       fetchSpecialties()
//     } else {
//       setSpecialtyOptions([])
//     }
//   }, [debouncedSpecialtyInputValue])

//   // Fetch Services based on input
//   useEffect(() => {
//     const fetchServices = async () => {
//       setLoadingServices(true)
//       try {
//         const response = await axios.get('/api/services', {
//           params: { q: debouncedServiceInputValue }
//         })
//         setServiceOptions(response.data)
//       } catch (err) {
//         console.error('Error fetching services:', err)
//       } finally {
//         setLoadingServices(false)
//       }
//     }

//     if (debouncedServiceInputValue !== '') {
//       fetchServices()
//     } else {
//       setServiceOptions([])
//     }
//   }, [debouncedServiceInputValue])

//   // Fetch Industries based on input
//   useEffect(() => {
//     const fetchIndustries = async () => {
//       setLoadingIndustries(true)
//       try {
//         const response = await axios.get('/api/industries', {
//           params: { q: debouncedIndustryInputValue }
//         })
//         const fetchedIndustries: Industry[] = response.data

//         // Merge selected industries with fetched industries to ensure selected ones are always present
//         const mergedIndustries = [
//           ...fetchedIndustries,
//           ...selectedIndustries.filter(selected => !fetchedIndustries.some(fetched => fetched._id === selected._id))
//         ]

//         setIndustryOptions(mergedIndustries)
//         console.log('Merged Industries:', mergedIndustries) // Debugging
//       } catch (err) {
//         console.error('Error fetching industries:', err)
//       } finally {
//         setLoadingIndustries(false)
//       }
//     }

//     if (debouncedIndustryInputValue !== '') {
//       fetchIndustries()
//     } else {
//       // Fetch default industries when input is empty
//       const fetchDefaultIndustries = async () => {
//         setLoadingIndustries(true)
//         try {
//           const response = await axios.get('/api/industries')
//           const fetchedIndustries: Industry[] = response.data

//           // Merge selected industries with fetched industries
//           const mergedIndustries = [
//             ...fetchedIndustries,
//             ...selectedIndustries.filter(selected => !fetchedIndustries.some(fetched => fetched._id === selected._id))
//           ]

//           setIndustryOptions(mergedIndustries)
//           console.log('Fetched Default and Merged Industries:', mergedIndustries) // Debugging
//         } catch (err) {
//           console.error('Error fetching default industries:', err)
//         } finally {
//           setLoadingIndustries(false)
//         }
//       }
//       fetchDefaultIndustries()
//     }
//   }, [debouncedIndustryInputValue, selectedIndustries])

//   // Handle input changes for simple fields
//   const handleChange = (
//     field: keyof CompanyForm | keyof CompanyForm['address'] | keyof CompanyForm['social_links'],
//     value: any
//   ) => {
//     if (field in companyForm!.address) {
//       setCompanyForm(prev => ({
//         ...prev!,
//         address: { ...prev!.address, [field]: value }
//       }))
//     } else if (field in companyForm!.social_links) {
//       setCompanyForm(prev => ({
//         ...prev!,
//         social_links: { ...prev!.social_links, [field]: value }
//       }))
//     } else {
//       setCompanyForm(prev => ({ ...prev!, [field]: value }))
//     }
//   }

//   // Handle Specialties change
//   const handleSpecialtiesChange = async (event: any, newValue: (Specialty | string)[]) => {
//     // Check if the last entered value is a new specialty (string)
//     const lastValue = newValue[newValue.length - 1]
//     if (typeof lastValue === 'string') {
//       try {
//         // Create new specialty via API
//         const response = await axios.post('/api/specialties', { specialty_name: lastValue })
//         const newSpecialty: Specialty = response.data
//         setCompanyForm(prev => ({
//           ...prev!,
//           specialties: [...prev!.specialties, newSpecialty]
//         }))
//       } catch (err: any) {
//         console.error('Error creating new specialty:', err)
//         setError('Failed to add new specialty')
//         // Optionally, handle the failed addition (e.g., remove the string entry)
//       }
//     } else {
//       // newValue contains only Specialty objects
//       setCompanyForm(prev => ({
//         ...prev!,
//         specialties: newValue as Specialty[]
//       }))
//     }
//   }

//   // Handle Services change
//   const handleServicesChange = async (event: any, newValue: (Service | string)[]) => {
//     // Check if the last entered value is a new service (string)
//     const lastValue = newValue[newValue.length - 1]
//     if (typeof lastValue === 'string') {
//       try {
//         // Create new service via API
//         const response = await axios.post('/api/services', { service_name: lastValue })
//         const newService: Service = response.data
//         setCompanyForm(prev => ({
//           ...prev!,
//           services: [...prev!.services, newService]
//         }))
//       } catch (err: any) {
//         console.error('Error creating new service:', err)
//         setError('Failed to add new service')
//         // Optionally, handle the failed addition (e.g., remove the string entry)
//       }
//     } else {
//       // newValue contains only Service objects
//       setCompanyForm(prev => ({
//         ...prev!,
//         services: newValue as Service[]
//       }))
//     }
//   }

//   // Function to check username availability
//   const checkUsernameAvailability = async () => {
//     const username = companyForm!.company_username.trim()

//     // If username is empty, do not proceed
//     if (!username) {
//       setError('Please enter a company username to check.')
//       setIsUsernameAvailable(null)
//       return
//     }

//     setCheckingUsername(true)
//     setError(null)
//     setSuccess(null)

//     try {
//       const response = await axios.get('/api/company/check-username', {
//         params: { username }
//       })

//       if (response.data.available) {
//         setIsUsernameAvailable(true)
//         setSuccess('Username is available!')
//       } else {
//         setIsUsernameAvailable(false)
//         setError('Username is already taken.')
//       }
//     } catch (err: any) {
//       console.error('Error checking username:', err)
//       setError('Failed to check username availability.')
//       setIsUsernameAvailable(null)
//     } finally {
//       setCheckingUsername(false)
//     }
//   }

//   // Handle form submission with validation
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setSaving(true)
//     setError(null)
//     setSuccess(null)

//     try {
//       // Validate the form data
//       await CompanySchema.validate(companyForm!, { abortEarly: false })

//       // Ensure username is available before submitting
//       if (isUsernameAvailable === false) {
//         setError('Please choose a different company username.')
//         setSaving(false)
//         return
//       }

//       // Prepare data to submit
//       const dataToSubmit = {
//         ...companyForm,
//         year_founded: companyForm.year_founded,
//         address: companyForm.address,
//         social_links: companyForm.social_links,
//         industries: companyForm.industries, // Array of Industry IDs
//         specialties: companyForm.specialties.map(s => s._id),
//         services: companyForm.services.map(s => s._id)
//         // admins: [session?.user.id] // Assuming the current user is the admin
//       }

//       const response = await axios.put(`/api/company/${companyId}`, dataToSubmit)

//       if (response.data.success) {
//         setSuccess('Company updated successfully')
//         setIsEditing(false)
//         // Optionally, refresh data or redirect
//       } else {
//         setError('Failed to update company')
//       }

//       // Auto-dismiss the success message after 3 seconds
//       setTimeout(() => setSuccess(null), 3000)
//     } catch (err: any) {
//       if (err.name === 'ValidationError') {
//         // Collect all validation errors
//         const validationErrors = err.inner.map((error: any) => error.message).join(', ')
//         setError(validationErrors)
//       } else if (err.response && err.response.data && err.response.data.error) {
//         setError(err.response.data.error)
//       } else {
//         console.error('Error updating company:', err)
//         setError('Failed to update company')
//       }

//       // Auto-dismiss the error message after 5 seconds
//       setTimeout(() => setError(null), 5000)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Handle Cover Image Upload
//   const handleCoverImageUpload = async () => {
//     if (!coverImageFile) return

//     const formData = new FormData()
//     formData.append('image', coverImageFile)

//     try {
//       const response = await axios.post('/api/upload/image', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       })
//       const { url } = response.data
//       setCompanyForm(prev => ({
//         ...prev!,
//         company_cover_image: url
//       }))
//       setCoverImageFile(null)
//       setSuccess('Cover image uploaded successfully!')
//       setTimeout(() => setSuccess(null), 3000)
//     } catch (err: any) {
//       console.error('Error uploading cover image:', err)
//       setError('Failed to upload cover image.')
//       setTimeout(() => setError(null), 5000)
//     }
//   }

//   // Handle Logo Upload
//   const handleLogoUpload = async () => {
//     if (!logoFile) return

//     const formData = new FormData()
//     formData.append('image', logoFile)

//     try {
//       const response = await axios.post('/api/upload/image', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       })
//       const { url } = response.data
//       setCompanyForm(prev => ({
//         ...prev!,
//         company_logo: url
//       }))
//       setLogoFile(null)
//       setSuccess('Logo uploaded successfully!')
//       setTimeout(() => setSuccess(null), 3000)
//     } catch (err: any) {
//       console.error('Error uploading logo:', err)
//       setError('Failed to upload logo.')
//       setTimeout(() => setError(null), 5000)
//     }
//   }

//   if (status === 'loading' || loading) return <CircularProgress />

//   if (!companyForm) return <Typography variant='h6'>Loading...</Typography>

//   return (
//     <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
//       <Grid container justifyContent='space-between' alignItems='center'>
//         <Grid item>
//           <Typography variant='h6' gutterBottom>
//             Company Information
//           </Typography>
//         </Grid>
//         <Grid item>
//           {!isEditing ? (
//             <Tooltip title='Edit Company'>
//               <IconButton onClick={() => setIsEditing(true)}>
//                 <EditIcon />
//               </IconButton>
//             </Tooltip>
//           ) : (
//             <Grid container spacing={1}>
//               <Grid item>
//                 <Tooltip title='Save Changes'>
//                   <IconButton type='submit' form='company-form'>
//                     <SaveIcon color='primary' />
//                   </IconButton>
//                 </Tooltip>
//               </Grid>
//               <Grid item>
//                 <Tooltip title='Cancel'>
//                   <IconButton
//                     onClick={() => {
//                       setIsEditing(false)
//                       setError(null)
//                       setSuccess(null)
//                     }}
//                   >
//                     <CancelIcon color='error' />
//                   </IconButton>
//                 </Tooltip>
//               </Grid>
//             </Grid>
//           )}
//         </Grid>
//       </Grid>

//       {/* Feedback Messages */}
//       {error && (
//         <Alert severity='error' sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}
//       {success && (
//         <Alert severity='success' sx={{ mb: 2 }}>
//           {success}
//         </Alert>
//       )}

//       <form id='company-form' onSubmit={handleSubmit}>
//         <Grid container spacing={2}>
//           {/* Cover Image Section */}
//           <Grid item xs={12}>
//             <Typography variant='subtitle1' gutterBottom>
//               Cover Image
//             </Typography>
//             {isEditing ? (
//               <>
//                 {companyForm.company_cover_image && (
//                   <img
//                     src={companyForm.company_cover_image}
//                     alt='Cover Image'
//                     style={{ width: '100%', height: 'auto', borderRadius: 8, marginBottom: 8 }}
//                   />
//                 )}
//                 <Grid container alignItems='center' spacing={2}>
//                   <Grid item>
//                     <input
//                       accept='image/*'
//                       style={{ display: 'none' }}
//                       id='cover-image-upload'
//                       type='file'
//                       onChange={e => {
//                         if (e.target.files && e.target.files[0]) {
//                           setCoverImageFile(e.target.files[0])
//                         }
//                       }}
//                     />
//                     <label htmlFor='cover-image-upload'>
//                       <Button variant='contained' component='span'>
//                         Choose Cover Image
//                       </Button>
//                     </label>
//                   </Grid>
//                   <Grid item>
//                     <Button
//                       variant='outlined'
//                       color='primary'
//                       onClick={handleCoverImageUpload}
//                       disabled={!coverImageFile}
//                     >
//                       Upload
//                     </Button>
//                   </Grid>
//                 </Grid>
//               </>
//             ) : companyForm.company_cover_image ? (
//               <img
//                 src={companyForm.company_cover_image}
//                 alt='Cover Image'
//                 style={{ width: '100%', height: 'auto', borderRadius: 8 }}
//               />
//             ) : (
//               <Typography variant='body2' color='textSecondary'>
//                 No cover image provided.
//               </Typography>
//             )}
//           </Grid>

//           {/* Logo Section */}
//           <Grid item xs={12}>
//             <Typography variant='subtitle1' gutterBottom>
//               Company Logo
//             </Typography>
//             {isEditing ? (
//               <>
//                 {companyForm.company_logo && (
//                   <Avatar
//                     src={companyForm.company_logo}
//                     alt='Company Logo'
//                     sx={{ width: 100, height: 100, marginBottom: 2 }}
//                   />
//                 )}
//                 <Grid container alignItems='center' spacing={2}>
//                   <Grid item>
//                     <input
//                       accept='image/*'
//                       style={{ display: 'none' }}
//                       id='logo-upload'
//                       type='file'
//                       onChange={e => {
//                         if (e.target.files && e.target.files[0]) {
//                           setLogoFile(e.target.files[0])
//                         }
//                       }}
//                     />
//                     <label htmlFor='logo-upload'>
//                       <Button variant='contained' component='span'>
//                         Choose Logo
//                       </Button>
//                     </label>
//                   </Grid>
//                   <Grid item>
//                     <Button variant='outlined' color='primary' onClick={handleLogoUpload} disabled={!logoFile}>
//                       Upload
//                     </Button>
//                   </Grid>
//                 </Grid>
//               </>
//             ) : companyForm.company_logo ? (
//               <Avatar src={companyForm.company_logo} alt='Company Logo' sx={{ width: 100, height: 100 }} />
//             ) : (
//               <Typography variant='body2' color='textSecondary'>
//                 No logo provided.
//               </Typography>
//             )}
//           </Grid>

//           {/* Company Name */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Company Name'
//                 value={companyForm.company_name}
//                 onChange={e => handleChange('company_name', e.target.value)}
//                 required
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Company Name</Typography>
//                 <Typography variant='body1'>{companyForm.company_name}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Tagline */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Tagline'
//                 value={companyForm.tagline}
//                 onChange={e => handleChange('tagline', e.target.value)}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Tagline</Typography>
//                 <Typography variant='body1'>{companyForm.tagline || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Company Username */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Company Username'
//                 value={companyForm.company_username}
//                 onChange={e => {
//                   handleChange('company_username', e.target.value)
//                   setIsUsernameAvailable(null) // Reset availability status on change
//                 }}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position='end'>
//                       <Tooltip title='Check Username Availability'>
//                         <IconButton
//                           onClick={checkUsernameAvailability}
//                           edge='end'
//                           disabled={checkingUsername || !companyForm.company_username.trim()}
//                         >
//                           {checkingUsername ? (
//                             <CircularProgress size={24} />
//                           ) : isUsernameAvailable === true ? (
//                             <i className='ri-check-line' style={{ color: 'green' }} />
//                           ) : isUsernameAvailable === false ? (
//                             <i className='ri-close-line' style={{ color: 'red' }} />
//                           ) : (
//                             <i className='ri-question-line' style={{ color: 'gray' }} />
//                           )}
//                         </IconButton>
//                       </Tooltip>
//                     </InputAdornment>
//                   )
//                 }}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Company Username</Typography>
//                 <Typography variant='body1'>{companyForm.company_username}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Year Founded */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Year Founded'
//                 value={companyForm.year_founded || ''}
//                 onChange={e => handleChange('year_founded', e.target.value ? parseInt(e.target.value) : null)}
//                 type='number'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Year Founded</Typography>
//                 <Typography variant='body1'>{companyForm.year_founded || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Company Size */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 select
//                 fullWidth
//                 label='Company Size'
//                 value={companyForm.company_size}
//                 onChange={e => handleChange('company_size', e.target.value)}
//                 margin='normal'
//               >
//                 <MenuItem value=''>Select Size</MenuItem>
//                 {companySizeOptions.map(size => (
//                   <MenuItem key={size} value={size}>
//                     {size}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Company Size</Typography>
//                 <Typography variant='body1'>{companyForm.company_size || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Company Type */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 select
//                 fullWidth
//                 label='Company Type'
//                 value={companyForm.company_type}
//                 onChange={e => handleChange('company_type', e.target.value)}
//                 margin='normal'
//               >
//                 <MenuItem value=''>Select Type</MenuItem>
//                 {companyTypeOptions.map(type => (
//                   <MenuItem key={type} value={type}>
//                     {type}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Company Type</Typography>
//                 <Typography variant='body1'>{companyForm.company_type || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Industries */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <Autocomplete
//                 multiple
//                 options={industryOptions}
//                 getOptionLabel={(option: Industry) => option.name}
//                 value={selectedIndustries}
//                 onChange={(event, newValue) => {
//                   if (newValue.length > 3) return
//                   setSelectedIndustries(newValue)
//                   setCompanyForm(prev => ({
//                     ...prev!,
//                     industries: newValue.map(industry => industry._id)
//                   }))
//                 }}
//                 inputValue={industryInputValue}
//                 onInputChange={(event, newInputValue) => setIndustryInputValue(newInputValue)}
//                 filterSelectedOptions
//                 loading={loadingIndustries}
//                 limitTags={3}
//                 disableCloseOnSelect
//                 renderOption={(props, option, { selected }) => (
//                   <li {...props}>
//                     <Checkbox
//                       icon={<i className='ri-checkbox-blank-circle-line' />}
//                       checkedIcon={<i className='ri-checkbox-circle-line' />}
//                       style={{ marginRight: 8 }}
//                       checked={selected}
//                       disabled={selectedIndustries.length >= 3 && !selected}
//                     />
//                     {option.name}
//                   </li>
//                 )}
//                 renderInput={params => (
//                   <TextField
//                     {...params}
//                     label='Industries'
//                     placeholder='Select industries'
//                     helperText='You can select up to 3 industries'
//                     margin='normal'
//                     InputProps={{
//                       ...params.InputProps,
//                       endAdornment: (
//                         <>
//                           {loadingIndustries ? <CircularProgress color='inherit' size={20} /> : null}
//                           {params.InputProps.endAdornment}
//                         </>
//                       )
//                     }}
//                   />
//                 )}
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Industries</Typography>
//                 <Typography variant='body1'>
//                   {selectedIndustries?.length > 0 ? selectedIndustries.map(ind => ind.name).join(', ') : 'N/A'}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* Specialties */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <Autocomplete
//                 multiple
//                 options={specialtyOptions}
//                 getOptionLabel={(option: string | Specialty) =>
//                   typeof option === 'string' ? option : option.specialty_name
//                 }
//                 value={companyForm.specialties}
//                 onChange={handleSpecialtiesChange}
//                 inputValue={specialtyInputValue}
//                 onInputChange={(event, newInputValue) => setSpecialtyInputValue(newInputValue)}
//                 filterSelectedOptions
//                 loading={loadingSpecialties}
//                 freeSolo
//                 renderInput={params => (
//                   <TextField
//                     {...params}
//                     label='Specialties'
//                     placeholder='Add specialty'
//                     margin='normal'
//                     InputProps={{
//                       ...params.InputProps,
//                       endAdornment: (
//                         <>
//                           {loadingSpecialties ? <CircularProgress color='inherit' size={20} /> : null}
//                           {params.InputProps.endAdornment}
//                         </>
//                       )
//                     }}
//                   />
//                 )}
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Specialties</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.specialties?.length > 0
//                     ? companyForm.specialties.map(spec => spec.specialty_name).join(', ')
//                     : 'N/A'}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* Services */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <Autocomplete
//                 multiple
//                 options={serviceOptions}
//                 getOptionLabel={(option: string | Service) =>
//                   typeof option === 'string' ? option : option.service_name
//                 }
//                 value={companyForm.services}
//                 onChange={handleServicesChange}
//                 inputValue={serviceInputValue}
//                 onInputChange={(event, newInputValue) => setServiceInputValue(newInputValue)}
//                 filterSelectedOptions
//                 loading={loadingServices}
//                 freeSolo
//                 renderInput={params => (
//                   <TextField
//                     {...params}
//                     label='Services'
//                     placeholder='Add service'
//                     margin='normal'
//                     InputProps={{
//                       ...params.InputProps,
//                       endAdornment: (
//                         <>
//                           {loadingServices ? <CircularProgress color='inherit' size={20} /> : null}
//                           {params.InputProps.endAdornment}
//                         </>
//                       )
//                     }}
//                   />
//                 )}
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Services</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.services?.length > 0
//                     ? companyForm.services.map(serv => serv.service_name).join(', ')
//                     : 'N/A'}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* Short Description */}
//           <Grid item xs={12}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Short Description'
//                 value={companyForm.short_description}
//                 onChange={e => handleChange('short_description', e.target.value)}
//                 multiline
//                 rows={2}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Short Description</Typography>
//                 <Typography variant='body1'>{companyForm.short_description || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Long Description */}
//           <Grid item xs={12}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Long Description'
//                 value={companyForm.long_description}
//                 onChange={e => handleChange('long_description', e.target.value)}
//                 multiline
//                 rows={4}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Long Description</Typography>
//                 <Typography variant='body1'>{companyForm.long_description || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Inquiry Email */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Inquiry Email'
//                 value={companyForm.inquiry_email}
//                 onChange={e => handleChange('inquiry_email', e.target.value)}
//                 type='email'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Inquiry Email</Typography>
//                 <Typography variant='body1'>{companyForm.inquiry_email || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Support Email */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Support Email'
//                 value={companyForm.support_email}
//                 onChange={e => handleChange('support_email', e.target.value)}
//                 type='email'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Support Email</Typography>
//                 <Typography variant='body1'>{companyForm.support_email || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* General Phone Number */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='General Phone Number'
//                 value={companyForm.general_phone_number}
//                 onChange={e => handleChange('general_phone_number', e.target.value)}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>General Phone Number</Typography>
//                 <Typography variant='body1'>{companyForm.general_phone_number || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Secondary Phone Number */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Secondary Phone Number'
//                 value={companyForm.secondary_phone_number}
//                 onChange={e => handleChange('secondary_phone_number', e.target.value)}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Secondary Phone Number</Typography>
//                 <Typography variant='body1'>{companyForm.secondary_phone_number || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Fax */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Fax'
//                 value={companyForm.fax}
//                 onChange={e => handleChange('fax', e.target.value)}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Fax</Typography>
//                 <Typography variant='body1'>{companyForm.fax || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Address Line 1 */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Address Line 1'
//                 value={companyForm.address.line1}
//                 onChange={e => handleChange('line1', e.target.value)}
//                 required
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Address Line 1</Typography>
//                 <Typography variant='body1'>{companyForm.address.line1}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Address Line 2 */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Address Line 2'
//                 value={companyForm.address.line2}
//                 onChange={e => handleChange('line2', e.target.value)}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Address Line 2</Typography>
//                 <Typography variant='body1'>{companyForm.address.line2 || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* City */}
//           <Grid item xs={12} sm={4}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='City'
//                 value={companyForm.address.city}
//                 onChange={e => handleChange('city', e.target.value)}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>City</Typography>
//                 <Typography variant='body1'>{companyForm.address.city || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Zip Code */}
//           <Grid item xs={12} sm={4}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Zip Code'
//                 value={companyForm.address.zip_code}
//                 onChange={e => handleChange('zip_code', e.target.value)}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Zip Code</Typography>
//                 <Typography variant='body1'>{companyForm.address.zip_code || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Country */}
//           <Grid item xs={12} sm={4}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Country'
//                 value={companyForm.address.country}
//                 onChange={e => handleChange('country', e.target.value)}
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Country</Typography>
//                 <Typography variant='body1'>{companyForm.address.country || 'N/A'}</Typography>
//               </>
//             )}
//           </Grid>

//           {/* Social Links */}
//           <Grid item xs={12}>
//             <Typography variant='subtitle1' gutterBottom>
//               Social Links
//             </Typography>
//           </Grid>

//           {/* LinkedIn */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='LinkedIn URL'
//                 value={companyForm.social_links?.linkedin}
//                 onChange={e => handleChange('linkedin', e.target.value)}
//                 type='url'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>LinkedIn</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.social_links?.linkedin ? (
//                     <a href={companyForm.social_links?.linkedin} target='_blank' rel='noopener noreferrer'>
//                       {companyForm.social_links?.linkedin}
//                     </a>
//                   ) : (
//                     'N/A'
//                   )}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* Facebook */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Facebook URL'
//                 value={companyForm.social_links?.facebook}
//                 onChange={e => handleChange('facebook', e.target.value)}
//                 type='url'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Facebook</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.social_links?.facebook ? (
//                     <a href={companyForm.social_links?.facebook} target='_blank' rel='noopener noreferrer'>
//                       {companyForm.social_links?.facebook}
//                     </a>
//                   ) : (
//                     'N/A'
//                   )}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* Instagram */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Instagram URL'
//                 value={companyForm.social_links?.instagram}
//                 onChange={e => handleChange('instagram', e.target.value)}
//                 type='url'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Instagram</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.social_links?.instagram ? (
//                     <a href={companyForm.social_links?.instagram} target='_blank' rel='noopener noreferrer'>
//                       {companyForm.social_links?.instagram}
//                     </a>
//                   ) : (
//                     'N/A'
//                   )}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* Twitter */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Twitter URL'
//                 value={companyForm.social_links?.twitter}
//                 onChange={e => handleChange('twitter', e.target.value)}
//                 type='url'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Twitter</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.social_links?.twitter ? (
//                     <a href={companyForm.social_links?.twitter} target='_blank' rel='noopener noreferrer'>
//                       {companyForm.social_links?.twitter}
//                     </a>
//                   ) : (
//                     'N/A'
//                   )}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* YouTube */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='YouTube URL'
//                 value={companyForm.social_links?.youtube}
//                 onChange={e => handleChange('youtube', e.target.value)}
//                 type='url'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>YouTube</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.social_links?.youtube ? (
//                     <a href={companyForm.social_links?.youtube} target='_blank' rel='noopener noreferrer'>
//                       {companyForm.social_links?.youtube}
//                     </a>
//                   ) : (
//                     'N/A'
//                   )}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* TikTok */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='TikTok URL'
//                 value={companyForm.social_links?.tiktok}
//                 onChange={e => handleChange('tiktok', e.target.value)}
//                 type='url'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>TikTok</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.social_links?.tiktok ? (
//                     <a href={companyForm.social_links?.tiktok} target='_blank' rel='noopener noreferrer'>
//                       {companyForm.social_links?.tiktok}
//                     </a>
//                   ) : (
//                     'N/A'
//                   )}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* GitHub */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='GitHub URL'
//                 value={companyForm.social_links?.github}
//                 onChange={e => handleChange('github', e.target.value)}
//                 type='url'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>GitHub</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.social_links?.github ? (
//                     <a href={companyForm.social_links?.github} target='_blank' rel='noopener noreferrer'>
//                       {companyForm.social_links?.github}
//                     </a>
//                   ) : (
//                     'N/A'
//                   )}
//                 </Typography>
//               </>
//             )}
//           </Grid>

//           {/* Website */}
//           <Grid item xs={12} sm={6}>
//             {isEditing ? (
//               <TextField
//                 fullWidth
//                 label='Website URL'
//                 value={companyForm.social_links?.website}
//                 onChange={e => handleChange('website', e.target.value)}
//                 type='url'
//                 margin='normal'
//               />
//             ) : (
//               <>
//                 <Typography variant='subtitle2'>Website</Typography>
//                 <Typography variant='body1'>
//                   {companyForm.social_links?.website ? (
//                     <a href={companyForm.social_links?.website} target='_blank' rel='noopener noreferrer'>
//                       {companyForm.social_links?.website}
//                     </a>
//                   ) : (
//                     'N/A'
//                   )}
//                 </Typography>
//               </>
//             )}
//           </Grid>
//         </Grid>
//       </form>
//     </Card>
//   )
// }

// export default EditCompany

// // src/app/(dashboard)/company/[companyId]/page.tsx

// 'use client'

// import React from 'react'
// import { useRouter, useParams  } from 'next/navigation'
// import { Typography, TextField, Button, Grid } from '@mui/material'
// import { companies, Company } from '../../../../data/companies' // Adjust the path as necessary

// const EditCompany: React.FC = () => {
//   const router = useRouter()
//   const searchParams = useParams ()
//   const companyId = searchParams.get('companyId') || ''

//   // Find the company based on the companyId
//   const company: Company | undefined = companies.find(c => c.id === companyId)

//   if (!company) {
//     return <Typography variant='h6'>Company not found.</Typography>
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Handle form submission and update company logic here
//     // For now, we'll just redirect back to the company settings page
//     router.push('/company')
//   }

//   return (
//     <Grid container justifyContent='center'>
//       <Grid item xs={12} sm={8} md={6}>
//         <Typography variant='h4' gutterBottom>
//           Edit Company
//         </Typography>
//         <form onSubmit={handleSubmit}>
//           <TextField
//             label='Company Name'
//             variant='outlined'
//             fullWidth
//             required
//             margin='normal'
//             defaultValue={company.name}
//           />
//           <TextField
//             label='Description'
//             variant='outlined'
//             fullWidth
//             required
//             margin='normal'
//             multiline
//             rows={4}
//             defaultValue={company.description}
//           />
//           {/* Add more form fields as necessary */}
//           <Button type='submit' variant='contained' color='primary' fullWidth>
//             Save Changes
//           </Button>
//         </form>
//       </Grid>
//     </Grid>
//   )
// }

// export default EditCompany
