// src/components/company/AddCompany.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import {
  Grid,
  TextField,
  Typography,
  Button,
  CircularProgress,
  MenuItem,
  Card,
  Alert,
  Tooltip,
  InputAdornment,
  IconButton,
  Checkbox
} from '@mui/material'
import { Autocomplete } from '@mui/material'
import { useDebounce } from 'use-debounce'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
import * as Yup from 'yup'

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

const AddCompany: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    company_name: '',
    tagline: '',
    company_username: '',
    company_logo: '',
    company_cover_image: '',
    year_founded: null,
    company_size: '',
    company_type: '',
    industries: [],
    specialties: [],
    services: [],
    short_description: '',
    long_description: '',
    inquiry_email: '',
    support_email: '',
    general_phone_number: '',
    secondary_phone_number: '',
    fax: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      zip_code: '',
      country: ''
    },
    social_links: {
      linkedin: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      twitter: '',
      github: '',
      website: '',
      youtube: ''
    }
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  // Industries Autocomplete States
  const [industryOptions, setIndustryOptions] = useState<Industry[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>([])
  const [industryInputValue, setIndustryInputValue] = useState<string>('')
  const [debouncedIndustryInputValue] = useDebounce(industryInputValue, 500)
  const [loadingIndustries, setLoadingIndustries] = useState<boolean>(false)

  // State for username availability
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      signIn()
      return
    }

    // If needed, fetch additional data like specialties, services, and industries
  }, [session, status])

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

  // Inside the useEffect for fetching industries
  useEffect(() => {
    const fetchIndustries = async () => {
      setLoadingIndustries(true)
      try {
        const response = await axios.get('/api/industries', {
          params: { q: debouncedIndustryInputValue }
        })
        console.log('Fetched Industries:', response.data) // Add this line
        setIndustryOptions(response.data)
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
          console.log('Fetched Default Industries:', response.data) // Add this line
          setIndustryOptions(response.data)
        } catch (err) {
          console.error('Error fetching default industries:', err)
        } finally {
          setLoadingIndustries(false)
        }
      }
      fetchDefaultIndustries()
    }
  }, [debouncedIndustryInputValue])

  // Handle input changes for simple fields
  const handleChange = (
    field: keyof CompanyForm | keyof CompanyForm['address'] | keyof CompanyForm['social_links'],
    value: any
  ) => {
    if (field in companyForm.address) {
      setCompanyForm(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    } else if (field in companyForm.social_links) {
      setCompanyForm(prev => ({
        ...prev,
        social_links: { ...prev.social_links, [field]: value }
      }))
    } else {
      setCompanyForm(prev => ({ ...prev, [field]: value }))
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
          ...prev,
          specialties: [...prev.specialties, newSpecialty]
        }))
      } catch (err: any) {
        console.error('Error creating new specialty:', err)
        setError('Failed to add new specialty')
        // Optionally, handle the failed addition (e.g., remove the string entry)
      }
    } else {
      // newValue contains only Specialty objects
      setCompanyForm(prev => ({
        ...prev,
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
          ...prev,
          services: [...prev.services, newService]
        }))
      } catch (err: any) {
        console.error('Error creating new service:', err)
        setError('Failed to add new service')
        // Optionally, handle the failed addition (e.g., remove the string entry)
      }
    } else {
      // newValue contains only Service objects
      setCompanyForm(prev => ({
        ...prev,
        services: newValue as Service[]
      }))
    }
  }

  // Function to check username availability
  const checkUsernameAvailability = async () => {
    const username = companyForm.company_username.trim()

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
      await CompanySchema.validate(companyForm, { abortEarly: false })

      // Ensure username is available before submitting
      if (isUsernameAvailable === false) {
        setError('Please choose a different company username.')
        setSaving(false)
        return
      }

      // Prepare data to submit
      const dataToSubmit = {
        ...companyForm,
        year_founded: companyForm.year_founded,
        address: companyForm.address,
        social_links: companyForm.social_links,
        industries: companyForm.industries, // Replace with ObjectIds as needed
        specialties: companyForm.specialties.map(s => s._id),
        services: companyForm.services.map(s => s._id),
        admins: [session?.user.id] // Assuming the current user is the admin
      }

      const response = await axios.post('/api/company/add', dataToSubmit)

      if (response.data.success) {
        setSuccess('Company created successfully')
        // Optionally, redirect to the company page
        router.push(`/company/${response.data.company._id}`)
      } else {
        setError('Failed to create company')
      }

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        console.error('Error creating company:', err)
        setError('Failed to create company')
      }

      // Auto-dismiss the error message after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Add New Company
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Fill in the details below to add a new company. Ensure all required fields are completed accurately.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {/* Company Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Company Name'
              value={companyForm.company_name}
              onChange={e => handleChange('company_name', e.target.value)}
              required
            />
          </Grid>
          {/* Tagline */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Tagline'
              value={companyForm.tagline}
              onChange={e => handleChange('tagline', e.target.value)}
            />
          </Grid>
          {/* Company Username */}
          <Grid item xs={12} sm={6}>
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
                        disabled={checkingUsername || !companyForm.company_username.trim()}
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
            />
          </Grid>
          {/* Company Logo URL */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Company Logo URL'
              value={companyForm.company_logo}
              onChange={e => handleChange('company_logo', e.target.value)}
              type='url'
            />
          </Grid>
          {/* Company Cover Image URL */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Company Cover Image URL'
              value={companyForm.company_cover_image}
              onChange={e => handleChange('company_cover_image', e.target.value)}
              type='url'
            />
          </Grid>
          {/* Year Founded */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Year Founded'
              value={companyForm.year_founded || ''}
              onChange={e => handleChange('year_founded', e.target.value ? parseInt(e.target.value) : null)}
              type='number'
            />
          </Grid>
          {/* Company Size */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label='Company Size'
              value={companyForm.company_size}
              onChange={e => handleChange('company_size', e.target.value)}
            >
              <MenuItem value=''>Select Size</MenuItem>
              {companySizeOptions.map(size => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Company Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label='Company Type'
              value={companyForm.company_type}
              onChange={e => handleChange('company_type', e.target.value)}
            >
              <MenuItem value=''>Select Type</MenuItem>
              {companyTypeOptions.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Industries */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              options={industryOptions}
              getOptionLabel={(option: Industry) => option.name}
              value={selectedIndustries}
              onChange={(event, newValue) => {
                if (newValue.length > 3) return
                setSelectedIndustries(newValue)
                setCompanyForm(prev => ({
                  ...prev,
                  industries: newValue.map(industry => industry._id)
                }))
              }}
              inputValue={industryInputValue}
              onInputChange={(event, newInputValue) => setIndustryInputValue(newInputValue)}
              filterSelectedOptions
              loading={loadingIndustries}
              limitTags={3}
              disableCloseOnSelect
              renderOption={(props, option, { selected }) => <li {...props}>{option.name}</li>}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Industries'
                  placeholder='Select industries'
                  helperText='You can select up to 3 industries'
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
          </Grid>

          {/* Specialties */}
          <Grid item xs={12} sm={6}>
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
          </Grid>
          {/* Services */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              options={serviceOptions}
              getOptionLabel={(option: string | Service) => (typeof option === 'string' ? option : option.service_name)}
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
          </Grid>
          {/* Short Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Short Description'
              value={companyForm.short_description}
              onChange={e => handleChange('short_description', e.target.value)}
              multiline
              rows={2}
            />
          </Grid>
          {/* Long Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Long Description'
              value={companyForm.long_description}
              onChange={e => handleChange('long_description', e.target.value)}
              multiline
              rows={4}
            />
          </Grid>
          {/* Inquiry Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Inquiry Email'
              value={companyForm.inquiry_email}
              onChange={e => handleChange('inquiry_email', e.target.value)}
              type='email'
            />
          </Grid>
          {/* Support Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Support Email'
              value={companyForm.support_email}
              onChange={e => handleChange('support_email', e.target.value)}
              type='email'
            />
          </Grid>
          {/* General Phone Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='General Phone Number'
              value={companyForm.general_phone_number}
              onChange={e => handleChange('general_phone_number', e.target.value)}
            />
          </Grid>
          {/* Secondary Phone Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Secondary Phone Number'
              value={companyForm.secondary_phone_number}
              onChange={e => handleChange('secondary_phone_number', e.target.value)}
            />
          </Grid>
          {/* Fax */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Fax'
              value={companyForm.fax}
              onChange={e => handleChange('fax', e.target.value)}
            />
          </Grid>
          {/* Address Line 1 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Address Line 1'
              value={companyForm.address.line1}
              onChange={e => handleChange('line1', e.target.value)}
              required
            />
          </Grid>
          {/* Address Line 2 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Address Line 2'
              value={companyForm.address.line2}
              onChange={e => handleChange('line2', e.target.value)}
            />
          </Grid>
          {/* City */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label='City'
              value={companyForm.address.city}
              onChange={e => handleChange('city', e.target.value)}
            />
          </Grid>
          {/* Zip Code */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label='Zip Code'
              value={companyForm.address.zip_code}
              onChange={e => handleChange('zip_code', e.target.value)}
            />
          </Grid>
          {/* Country */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label='Country'
              value={companyForm.address.country}
              onChange={e => handleChange('country', e.target.value)}
            />
          </Grid>
          {/* Social Links */}
          <Grid item xs={12}>
            <Typography variant='subtitle1' gutterBottom>
              Social Links
            </Typography>
          </Grid>
          {/* LinkedIn */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='LinkedIn URL'
              value={companyForm.social_links.linkedin}
              onChange={e => handleChange('linkedin', e.target.value)}
              type='url'
            />
          </Grid>
          {/* Facebook */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Facebook URL'
              value={companyForm.social_links.facebook}
              onChange={e => handleChange('facebook', e.target.value)}
              type='url'
            />
          </Grid>
          {/* Instagram */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Instagram URL'
              value={companyForm.social_links.instagram}
              onChange={e => handleChange('instagram', e.target.value)}
              type='url'
            />
          </Grid>
          {/* Twitter */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Twitter URL'
              value={companyForm.social_links.twitter}
              onChange={e => handleChange('twitter', e.target.value)}
              type='url'
            />
          </Grid>
          {/* YouTube */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='YouTube URL'
              value={companyForm.social_links.youtube}
              onChange={e => handleChange('youtube', e.target.value)}
              type='url'
            />
          </Grid>
          {/* TikTok */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='TikTok URL'
              value={companyForm.social_links.tiktok}
              onChange={e => handleChange('tiktok', e.target.value)}
              type='url'
            />
          </Grid>
          {/* GitHub */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='GitHub URL'
              value={companyForm.social_links.github}
              onChange={e => handleChange('github', e.target.value)}
              type='url'
            />
          </Grid>
          {/* Website */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Website URL'
              value={companyForm.social_links.website}
              onChange={e => handleChange('website', e.target.value)}
              type='url'
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
            {isUsernameAvailable === true && !success && (
              <Alert severity='info' sx={{ mb: 2 }}>
                Username is available!
              </Alert>
            )}
            {isUsernameAvailable === false && !error && (
              <Alert severity='warning' sx={{ mb: 2 }}>
                Username is already taken.
              </Alert>
            )}
          </Grid>
          {/* Action Buttons */}
          <Grid item xs={12}>
            <Tooltip title='Create Company'>
              <Button type='submit' variant='contained' color='primary' disabled={saving}>
                {saving ? 'Saving...' : 'Create Company'}
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default AddCompany
