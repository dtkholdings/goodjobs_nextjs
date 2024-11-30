'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Switch,
  FormControlLabel,
  Divider,
  TextareaAutosize
} from '@mui/material'
import { Autocomplete } from '@mui/material'
import { useDebounce } from 'use-debounce'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
import * as Yup from 'yup'
import { JobSchema } from './validation'
import ImageIcon from '@mui/icons-material/Image'

type Skill = {
  _id: string
  name: string
}

type JobForm = {
  company_id: string
  job_title: string
  job_description: string
  job_type: 'Internship' | 'Full-Time' | 'Part-Time' | 'Contract'
  job_location_type: 'On-Site' | 'Remote' | 'Hybrid'
  job_level: 'Junior' | 'Senior' | 'Executive'
  gender: 'Male' | 'Female' | 'Any'
  job_closing_date: string // Using string for date input
  job_post_type: 'Normal' | 'Urgent' | 'Premium'
  skills: string[] // Array of Skill IDs
  video_url?: string
  cv_send_email?: string
  job_location: {
    line1: string
    line2?: string
    city?: string
    province?: string
    zip_code?: string
    country?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  image_path?: string // Field for the uploaded image URL
}

const jobTypeOptions: JobForm['job_type'][] = ['Internship', 'Full-Time', 'Part-Time', 'Contract']
const jobLocationTypeOptions: JobForm['job_location_type'][] = ['On-Site', 'Remote', 'Hybrid']
const jobLevelOptions: JobForm['job_level'][] = ['Junior', 'Senior', 'Executive']
const genderOptions: JobForm['gender'][] = ['Male', 'Female', 'Any']
const jobPostTypeOptions: JobForm['job_post_type'][] = ['Normal', 'Urgent', 'Premium']

const AddJob: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const companyId = (params.companyId as string) || ''

  const [jobForm, setJobForm] = useState<JobForm>({
    company_id: companyId,
    job_title: '',
    job_description: '',
    job_type: 'Full-Time',
    job_location_type: 'On-Site',
    job_level: 'Junior',
    gender: 'Any',
    job_closing_date: '',
    job_post_type: 'Normal',
    skills: [],
    video_url: '',
    cv_send_email: '',
    job_location: {
      line1: '',
      line2: '',
      city: '',
      province: '',
      zip_code: '',
      country: '',
      coordinates: undefined
    },
    image_path: '' // Initialize as empty
  })

  const [companyAddress, setCompanyAddress] = useState<JobForm['job_location'] | null>(null)
  const [useCompanyAddress, setUseCompanyAddress] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // States for Skills Autocomplete
  const [skillOptions, setSkillOptions] = useState<Skill[]>([])
  const [skillInputValue, setSkillInputValue] = useState<string>('')
  const [debouncedSkillInputValue] = useDebounce(skillInputValue, 500)
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false)

  // Image Upload States
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      signIn()
      return
    }

    // Fetch company address
    const fetchCompanyAddress = async () => {
      try {
        const response = await axios.get(`/api/company/${companyId}`)
        const company = response.data

        if (company && company.address) {
          const fetchedAddress: JobForm['job_location'] = {
            line1: company.address.line1 || '',
            line2: company.address.line2 || '',
            city: company.address.city || '',
            province: company.address.province || '',
            zip_code: company.address.zip_code || '',
            country: company.address.country || '',
            coordinates: company.address.coordinates || undefined
          }

          setCompanyAddress(fetchedAddress)

          // If using company address, set job_location to company address
          if (useCompanyAddress) {
            setJobForm(prev => ({
              ...prev,
              job_location: fetchedAddress
            }))
          }
        }
      } catch (err) {
        console.error('Error fetching company address:', err)
        setError('Failed to fetch company address.')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyAddress()
  }, [session, status, companyId, useCompanyAddress])

  // Fetch Skills based on input
  useEffect(() => {
    const fetchSkills = async () => {
      setLoadingSkills(true)
      try {
        const response = await axios.get('/api/skills', {
          params: { q: debouncedSkillInputValue }
        })
        setSkillOptions(response.data)
      } catch (err) {
        console.error('Error fetching skills:', err)
      } finally {
        setLoadingSkills(false)
      }
    }

    if (debouncedSkillInputValue.trim() !== '') {
      fetchSkills()
    } else {
      setSkillOptions([])
    }
  }, [debouncedSkillInputValue])

  // Handle input changes for simple fields
  const handleChange = (field: keyof JobForm | keyof JobForm['job_location'], value: any) => {
    if (field in jobForm.job_location) {
      setJobForm(prev => ({
        ...prev,
        job_location: { ...prev.job_location, [field]: value }
      }))
    } else {
      setJobForm(prev => ({ ...prev, [field]: value }))
    }
  }

  // Handle Job Location Type change
  const handleJobLocationTypeChange = (value: JobForm['job_location_type']) => {
    setJobForm(prev => ({
      ...prev,
      job_location_type: value
    }))
  }

  // Handle Use Company Address toggle
  const handleUseCompanyAddressToggle = (checked: boolean) => {
    setUseCompanyAddress(checked)
    if (checked && companyAddress) {
      setJobForm(prev => ({
        ...prev,
        job_location: companyAddress
      }))
    } else {
      setJobForm(prev => ({
        ...prev,
        job_location: {
          line1: '',
          line2: '',
          city: '',
          province: '',
          zip_code: '',
          country: '',
          coordinates: undefined
        }
      }))
    }
  }

  // Handle coordinates input
  const handleCoordinatesChange = (value: string) => {
    const coords = value.split(',').map(coord => coord.trim())
    if (coords.length === 2) {
      const latitude = parseFloat(coords[0])
      const longitude = parseFloat(coords[1])
      if (!isNaN(latitude) && !isNaN(longitude)) {
        setJobForm(prev => ({
          ...prev,
          job_location: {
            ...prev.job_location,
            coordinates: { latitude, longitude }
          }
        }))
      } else {
        setError('Invalid coordinates format. Please provide valid numbers.')
      }
    } else {
      setError('Invalid coordinates format. Please provide latitude and longitude separated by a comma.')
    }
  }

  // Handle Skills change
  const handleSkillsChange = (event: React.SyntheticEvent, newValue: (Skill | string)[]) => {
    const skills = newValue.map(skill => (typeof skill === 'string' ? skill : skill._id))
    setJobForm(prev => ({ ...prev, skills }))
  }

  // Handle Image Selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const file = files[0]

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, and GIF are allowed.')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('File size exceeds 5MB limit.')
        return
      }

      // Set the selected image and preview
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))

      // Upload the image
      await uploadImage(file)
    }
  }

  // Upload Image to the API
  const uploadImage = async (file: File) => {
    setUploadingImage(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await axios.post('/api/job/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success && response.data.imageUrl) {
        setJobForm(prev => ({
          ...prev,
          image_path: response.data.imageUrl
        }))
        setSuccess('Image uploaded successfully.')
      } else {
        setError(response.data.message || 'Failed to upload image.')
      }
    } catch (err: any) {
      console.error('Error uploading image:', err)
      setError(err.response?.data?.message || 'Failed to upload image.')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle Form Submission with Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Combine jobForm and other data as needed
      const dataToValidate = { ...jobForm }

      // Validate the form data
      const validatedData = await JobSchema.validate(dataToValidate, {
        abortEarly: false
      })

      // Calculate job expiry date: 30 days from now
      const liveDate = new Date()
      const expiryDate = new Date(liveDate)
      expiryDate.setDate(expiryDate.getDate() + 30)

      // Prepare data to submit
      const submissionData = {
        ...validatedData,
        job_post_status: 'Live', // Assuming the job is published immediately
        expired_at: expiryDate
      }

      const response = await axios.post('/api/job/add', submissionData)

      if (response.data.success) {
        setSuccess('Job created successfully')
        // Optionally, redirect to the job page
        router.push(`/company/${companyId}/jobs/${response.data.job._id}`)
      } else {
        setError('Failed to create job')
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
        console.error('Error creating job:', err)
        setError('Failed to create job')
      }

      // Auto-dismiss the error message after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Grid container justifyContent='center' alignItems='center' style={{ minHeight: '50vh' }}>
        <CircularProgress />
      </Grid>
    )
  }

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Add New Job
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Fill in the details below to add a new job for your company. Ensure all required fields are completed
        accurately.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='flex-start'>
          {/* Job Title */}
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label='Job Title'
              value={jobForm.job_title}
              onChange={e => handleChange('job_title', e.target.value)}
              required
            />
          </Grid>
          {/* Job Type */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label='Job Type'
              value={jobForm.job_type}
              onChange={e => handleChange('job_type', e.target.value)}
              required
            >
              {jobTypeOptions.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Job Level */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label='Job Level'
              value={jobForm.job_level}
              onChange={e => handleChange('job_level', e.target.value)}
              required
            >
              {jobLevelOptions.map(level => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Gender Preference */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label='Gender Preference'
              value={jobForm.gender}
              onChange={e => handleChange('gender', e.target.value)}
              required
            >
              {genderOptions.map(gender => (
                <MenuItem key={gender} value={gender}>
                  {gender}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Job Location Type */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label='Job Location Type'
              value={jobForm.job_location_type}
              onChange={e => handleJobLocationTypeChange(e.target.value as JobForm['job_location_type'])}
              required
            >
              {jobLocationTypeOptions.map(job_location_type => (
                <MenuItem key={job_location_type} value={job_location_type}>
                  {job_location_type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Use Company Address Toggle */}
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={useCompanyAddress}
                  onChange={e => handleUseCompanyAddressToggle(e.target.checked)}
                  name='useCompanyAddressToggle'
                  color='primary'
                />
              }
              label='Use Company Address'
            />
          </Grid>
          {/* Job Location Details */}
          {!useCompanyAddress && (
            <>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>Job Location Details</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              {/* Address Line 1 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Address Line 1'
                  value={jobForm.job_location.line1}
                  onChange={e => handleChange('line1', e.target.value)}
                  required
                />
              </Grid>
              {/* Address Line 2 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Address Line 2'
                  value={jobForm.job_location.line2}
                  onChange={e => handleChange('line2', e.target.value)}
                />
              </Grid>
              {/* City */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label='City'
                  value={jobForm.job_location.city}
                  onChange={e => handleChange('city', e.target.value)}
                  required
                />
              </Grid>
              {/* Province */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label='Province'
                  value={jobForm.job_location.province}
                  onChange={e => handleChange('province', e.target.value)}
                  required
                />
              </Grid>
              {/* Zip Code */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label='Zip Code'
                  value={jobForm.job_location.zip_code}
                  onChange={e => handleChange('zip_code', e.target.value)}
                  required
                />
              </Grid>
              {/* Country */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Country'
                  value={jobForm.job_location.country}
                  onChange={e => handleChange('country', e.target.value)}
                  required
                />
              </Grid>
              {/* Coordinates Input */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Coordinates (Latitude, Longitude)'
                  placeholder='e.g., 6.4423440342408345, 80.01947592710006'
                  onBlur={e => handleCoordinatesChange(e.target.value)}
                  helperText='Optional: Provide coordinates for precise location'
                />
              </Grid>
            </>
          )}

          {/* Company Location Details */}
          {useCompanyAddress && companyAddress && (
            <>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>Company Location</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              {/* Address Line 1 */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Address Line 1' value={jobForm.job_location.line1} disabled required />
              </Grid>
              {/* Address Line 2 */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Address Line 2' value={jobForm.job_location.line2} disabled />
              </Grid>
              {/* City */}
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label='City' value={jobForm.job_location.city} disabled />
              </Grid>
              {/* Province */}
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label='Province' value={jobForm.job_location.province} disabled />
              </Grid>
              {/* Zip Code */}
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label='Zip Code' value={jobForm.job_location.zip_code} disabled />
              </Grid>
              {/* Country */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Country' value={jobForm.job_location.country} disabled />
              </Grid>
              {/* Coordinates Display */}
              {jobForm.job_location.coordinates && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Coordinates'
                    value={`${jobForm.job_location.coordinates.latitude}, ${jobForm.job_location.coordinates.longitude}`}
                    disabled
                  />
                </Grid>
              )}
            </>
          )}

          {/* Job Description */}
          <Grid item xs={12}>
            <TextareaAutosize
              aria-label='Job Description'
              placeholder='Job Description'
              value={jobForm.job_description}
              onChange={e => handleChange('job_description', e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                resize: 'vertical', // Allows users to resize both horizontally and vertically
                padding: '8px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </Grid>

          {/* Job Post Image Upload */}
          <Grid item xs={12}>
            <Typography variant='subtitle1' gutterBottom>
              Job Post Image
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} alignItems='center'>
              {/* Image Input */}
              <Grid item xs={12} sm={6}>
                <Button variant='contained' component='label' startIcon={<ImageIcon />} disabled={uploadingImage}>
                  Upload Image
                  <input type='file' accept='image/*' hidden onChange={handleImageChange} />
                </Button>
                {uploadingImage && <CircularProgress size={24} sx={{ ml: 2 }} />}
              </Grid>
              {/* Image Preview */}
              <Grid item xs={12} sm={6}>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt='Job Post Preview'
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                  />
                )}
                {jobForm.image_path && !imagePreview && (
                  <img
                    src={jobForm.image_path}
                    alt='Uploaded Job Post'
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                  />
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Skills */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={skillOptions}
              getOptionLabel={(option: Skill | string) => (typeof option === 'string' ? option : option.name)}
              value={jobForm.skills.map(skillId => {
                const foundSkill = skillOptions.find(skill => skill._id === skillId)
                return foundSkill ? foundSkill : skillId
              })}
              onChange={handleSkillsChange}
              inputValue={skillInputValue}
              onInputChange={(event, newInputValue) => setSkillInputValue(newInputValue)}
              filterSelectedOptions
              loading={loadingSkills}
              freeSolo
              renderInput={params => (
                <TextField
                  {...params}
                  label='Skills'
                  placeholder='Add skills'
                  helperText='You can select up to 10 skills'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingSkills ? <CircularProgress color='inherit' size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>

          {/* Video URL */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Video URL'
              value={jobForm.video_url}
              onChange={e => handleChange('video_url', e.target.value)}
              type='url'
            />
          </Grid>

          {/* CV Send Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='CV Send Email'
              value={jobForm.cv_send_email}
              onChange={e => handleChange('cv_send_email', e.target.value)}
              type='email'
            />
          </Grid>

          {/* Job Closing Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Job Closing Date'
              type='date'
              InputLabelProps={{
                shrink: true
              }}
              value={jobForm.job_closing_date}
              onChange={e => handleChange('job_closing_date', e.target.value)}
              required
            />
          </Grid>

          {/* Job Post Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label='Job Post Type'
              value={jobForm.job_post_type}
              onChange={e => handleChange('job_post_type', e.target.value)}
              required
            >
              {jobPostTypeOptions.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
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
            <Tooltip title='Create Job'>
              <Button type='submit' variant='contained' color='primary' disabled={saving || uploadingImage}>
                {saving ? 'Saving...' : 'Create Job'}
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default AddJob

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { useRouter, useParams } from 'next/navigation'
// import {
//   Grid,
//   TextField,
//   Typography,
//   Button,
//   CircularProgress,
//   MenuItem,
//   Card,
//   Alert,
//   Tooltip,
//   Switch,
//   FormControlLabel,
//   Divider,
//   TextareaAutosize
// } from '@mui/material'
// import { Autocomplete } from '@mui/material'
// import { useDebounce } from 'use-debounce'
// import axios from 'axios'
// import { useSession, signIn } from 'next-auth/react'
// import * as Yup from 'yup'
// import { JobSchema } from './validation'

// // Define types
// type Skill = {
//   _id: string
//   name: string
// }

// type ScreeningQuestion = {
//   question: string
//   question_type: 'SC' | 'MC' | 'ST' | 'LT' // Single Choice, Multiple Choice, Short Text, Long Text
//   correct_answers?: string[] // Applicable for SC and MC
//   options?: string[] // Applicable for SC and MC
//   required: boolean
// }

// type JobForm = {
//   company_id: string
//   job_title: string
//   job_description: string
//   job_type: 'Internship' | 'Full-Time' | 'Part-Time' | 'Contract'
//   job_location_type: 'On-Site' | 'Remote' | 'Hybrid'
//   job_level: 'Junior' | 'Senior' | 'Executive'
//   gender: 'Male' | 'Female' | 'Any'
//   job_closing_date: string // Using string for date input
//   job_post_type: 'Normal' | 'Urgent' | 'Premium'
//   skills: string[] // Array of Skill IDs
//   video_url?: string
//   cv_send_email?: string
//   job_location: {
//     line1: string
//     line2?: string
//     city?: string
//     province?: string
//     zip_code?: string
//     country?: string
//     coordinates?: {
//       latitude: number
//       longitude: number
//     }
//   }
// }

// const jobTypeOptions: JobForm['job_type'][] = ['Internship', 'Full-Time', 'Part-Time', 'Contract']
// const jobLocationTypeOptions: JobForm['job_location_type'][] = ['On-Site', 'Remote', 'Hybrid']
// const jobLevelOptions: JobForm['job_level'][] = ['Junior', 'Senior', 'Executive']
// const genderOptions: JobForm['gender'][] = ['Male', 'Female', 'Any']
// const jobPostTypeOptions: JobForm['job_post_type'][] = ['Normal', 'Urgent', 'Premium']

// const AddJob: React.FC = () => {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const params = useParams()
//   const companyId = (params.companyId as string) || ''

//   const [jobForm, setJobForm] = useState<JobForm>({
//     company_id: companyId,
//     job_title: '',
//     job_description: '',
//     job_type: 'Full-Time',
//     job_location_type: 'On-Site',
//     job_level: 'Junior',
//     gender: 'Any',
//     job_closing_date: '',
//     job_post_type: 'Normal',
//     skills: [],
//     video_url: '',
//     cv_send_email: '',
//     job_location: {
//       line1: '',
//       line2: '',
//       city: '',
//       province: '',
//       zip_code: '',
//       country: '',
//       coordinates: undefined
//     }
//   })

//   const [companyAddress, setCompanyAddress] = useState<JobForm['job_location'] | null>(null) // New state
//   const [useCompanyAddress, setUseCompanyAddress] = useState<boolean>(true) // New state
//   const [loading, setLoading] = useState<boolean>(true) // Initial loading for fetching company address
//   const [saving, setSaving] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)

//   // States for Skills Autocomplete
//   const [skillOptions, setSkillOptions] = useState<Skill[]>([])
//   const [skillInputValue, setSkillInputValue] = useState<string>('')
//   const [debouncedSkillInputValue] = useDebounce(skillInputValue, 500)
//   const [loadingSkills, setLoadingSkills] = useState<boolean>(false)

//   // State for adding screening questions
//   const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([])

//   useEffect(() => {
//     if (status === 'loading') return
//     if (!session) {
//       signIn()
//       return
//     }

//     // Fetch company address
//     const fetchCompanyAddress = async () => {
//       try {
//         const response = await axios.get(`/api/company/${companyId}`)
//         const company = response.data

//         if (company && company.address) {
//           const fetchedAddress: JobForm['job_location'] = {
//             line1: company.address.line1 || '',
//             line2: company.address.line2 || '',
//             city: company.address.city || '',
//             province: company.address.province || '',
//             zip_code: company.address.zip_code || '',
//             country: company.address.country || '',
//             coordinates: company.address.coordinates || undefined
//           }

//           setCompanyAddress(fetchedAddress)

//           // If using company address, set job_location to company address
//           if (useCompanyAddress) {
//             setJobForm(prev => ({
//               ...prev,
//               job_location: fetchedAddress
//             }))
//           }
//         }
//       } catch (err) {
//         console.error('Error fetching company address:', err)
//         setError('Failed to fetch company address.')
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchCompanyAddress()
//   }, [session, status, companyId, useCompanyAddress])

//   // Fetch Skills based on input
//   useEffect(() => {
//     const fetchSkills = async () => {
//       setLoadingSkills(true)
//       try {
//         const response = await axios.get('/api/skills', {
//           params: { q: debouncedSkillInputValue }
//         })
//         setSkillOptions(response.data)
//       } catch (err) {
//         console.error('Error fetching skills:', err)
//       } finally {
//         setLoadingSkills(false)
//       }
//     }

//     if (debouncedSkillInputValue.trim() !== '') {
//       fetchSkills()
//     } else {
//       setSkillOptions([])
//     }
//   }, [debouncedSkillInputValue])

//   // Handle input changes for simple fields
//   const handleChange = (field: keyof JobForm | keyof JobForm['job_location'], value: any) => {
//     if (field in jobForm.job_location) {
//       setJobForm(prev => ({
//         ...prev,
//         job_location: { ...prev.job_location, [field]: value }
//       }))
//     } else {
//       setJobForm(prev => ({ ...prev, [field]: value }))
//     }
//   }

//   // Handle Job Location Type change
//   const handleJobLocationTypeChange = (value: JobForm['job_location_type']) => {
//     setJobForm(prev => ({
//       ...prev,
//       job_location_type: value
//     }))
//   }

//   // Handle Use Company Address toggle
//   const handleUseCompanyAddressToggle = (checked: boolean) => {
//     setUseCompanyAddress(checked)
//     if (checked && companyAddress) {
//       setJobForm(prev => ({
//         ...prev,
//         job_location: companyAddress
//       }))
//     } else {
//       setJobForm(prev => ({
//         ...prev,
//         job_location: {
//           line1: '',
//           line2: '',
//           city: '',
//           province: '',
//           zip_code: '',
//           country: '',
//           coordinates: undefined
//         }
//       }))
//     }
//   }

//   // Handle coordinates input
//   const handleCoordinatesChange = (value: string) => {
//     const coords = value.split(',').map(coord => coord.trim())
//     if (coords.length === 2) {
//       const latitude = parseFloat(coords[0])
//       const longitude = parseFloat(coords[1])
//       if (!isNaN(latitude) && !isNaN(longitude)) {
//         setJobForm(prev => ({
//           ...prev,
//           job_location: {
//             ...prev.job_location,
//             coordinates: { latitude, longitude }
//           }
//         }))
//       } else {
//         setError('Invalid coordinates format. Please provide valid numbers.')
//       }
//     } else {
//       setError('Invalid coordinates format. Please provide latitude and longitude separated by a comma.')
//     }
//   }

//   // Handle Skills change
//   const handleSkillsChange = (event: React.SyntheticEvent, newValue: (Skill | string)[]) => {
//     const skills = newValue.map(skill => (typeof skill === 'string' ? skill : skill._id))
//     setJobForm(prev => ({ ...prev, skills }))
//   }

//   // Handle Form Submission with Validation
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setSaving(true)
//     setError(null)
//     setSuccess(null)

//     try {
//       // Combine jobForm and screeningQuestions
//       const dataToValidate = { ...jobForm, screening_questions: screeningQuestions }

//       // Validate the form data
//       const validatedData = await JobSchema.validate(dataToValidate, { abortEarly: false })

//       // Calculate job expiry date: 30 days from now
//       const liveDate = new Date()
//       const expiryDate = new Date(liveDate)
//       expiryDate.setDate(expiryDate.getDate() + 30)

//       // Prepare data to submit
//       const submissionData = {
//         ...validatedData,
//         job_post_status: 'Live', // Assuming the job is published immediately
//         expired_at: expiryDate
//       }

//       const response = await axios.post('/api/job/add', submissionData)

//       if (response.data.success) {
//         setSuccess('Job created successfully')
//         // Optionally, redirect to the job page
//         router.push(`/company/${companyId}/jobs/${response.data.job._id}`)
//       } else {
//         setError('Failed to create job')
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
//         console.error('Error creating job:', err)
//         setError('Failed to create job')
//       }

//       // Auto-dismiss the error message after 5 seconds
//       setTimeout(() => setError(null), 5000)
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (status === 'loading' || loading) {
//     return (
//       <Grid container justifyContent='center' alignItems='center' style={{ minHeight: '50vh' }}>
//         <CircularProgress />
//       </Grid>
//     )
//   }

//   return (
//     <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
//       <Typography variant='h6' gutterBottom>
//         Add New Job
//       </Typography>
//       {/* Section Description */}
//       <Typography variant='body2' color='textSecondary' gutterBottom>
//         Fill in the details below to add a new job for your company. Ensure all required fields are completed
//         accurately.
//       </Typography>
//       <form onSubmit={handleSubmit}>
//         <Grid container spacing={2} alignItems='flex-start'>
//           {/* Job Title */}
//           <Grid item xs={12} sm={12}>
//             <TextField
//               fullWidth
//               label='Job Title'
//               value={jobForm.job_title}
//               onChange={e => handleChange('job_title', e.target.value)}
//               required
//             />
//           </Grid>
//           {/* Job Type */}
//           <Grid item xs={12} sm={4}>
//             <TextField
//               select
//               fullWidth
//               label='Job Type'
//               value={jobForm.job_type}
//               onChange={e => handleChange('job_type', e.target.value)}
//               required
//             >
//               {jobTypeOptions.map(type => (
//                 <MenuItem key={type} value={type}>
//                   {type}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Grid>
//           {/* Job Level */}
//           <Grid item xs={12} sm={4}>
//             <TextField
//               select
//               fullWidth
//               label='Job Level'
//               value={jobForm.job_level}
//               onChange={e => handleChange('job_level', e.target.value)}
//               required
//             >
//               {jobLevelOptions.map(level => (
//                 <MenuItem key={level} value={level}>
//                   {level}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Grid>
//           {/* Gender Preference */}
//           <Grid item xs={12} sm={4}>
//             <TextField
//               select
//               fullWidth
//               label='Gender Preference'
//               value={jobForm.gender}
//               onChange={e => handleChange('gender', e.target.value)}
//               required
//             >
//               {genderOptions.map(gender => (
//                 <MenuItem key={gender} value={gender}>
//                   {gender}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Grid>
//           {/* Job Location Type */}
//           <Grid item xs={12} sm={4}>
//             <TextField
//               select
//               fullWidth
//               label='Job Location Type'
//               value={jobForm.job_location_type}
//               onChange={e => handleJobLocationTypeChange(e.target.value as JobForm['job_location_type'])}
//               required
//             >
//               {jobLocationTypeOptions.map(job_location_type => (
//                 <MenuItem key={job_location_type} value={job_location_type}>
//                   {job_location_type}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Grid>
//           {/* Use Company Address Toggle */}
//           <Grid item xs={12} sm={4}>
//             <FormControlLabel
//               control={
//                 <Switch
//                   checked={useCompanyAddress}
//                   onChange={e => handleUseCompanyAddressToggle(e.target.checked)}
//                   name='useCompanyAddressToggle'
//                   color='primary'
//                 />
//               }
//               label='Use Company Address'
//             />
//           </Grid>
//           {/* Job Location Details */}
//           {!useCompanyAddress && (
//             <>
//               <Grid item xs={12}>
//                 <Typography variant='subtitle1'>Job Location Details</Typography>
//                 <Divider sx={{ mb: 2 }} />
//               </Grid>
//               {/* Address Line 1 */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label='Address Line 1'
//                   value={jobForm.job_location.line1}
//                   onChange={e => handleChange('line1', e.target.value)}
//                   required
//                 />
//               </Grid>
//               {/* Address Line 2 */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label='Address Line 2'
//                   value={jobForm.job_location.line2}
//                   onChange={e => handleChange('line2', e.target.value)}
//                 />
//               </Grid>
//               {/* City */}
//               <Grid item xs={12} sm={4}>
//                 <TextField
//                   fullWidth
//                   label='City'
//                   value={jobForm.job_location.city}
//                   onChange={e => handleChange('city', e.target.value)}
//                   required
//                 />
//               </Grid>
//               {/* Province */}
//               <Grid item xs={12} sm={4}>
//                 <TextField
//                   fullWidth
//                   label='Province'
//                   value={jobForm.job_location.province}
//                   onChange={e => handleChange('province', e.target.value)}
//                   required
//                 />
//               </Grid>
//               {/* Zip Code */}
//               <Grid item xs={12} sm={4}>
//                 <TextField
//                   fullWidth
//                   label='Zip Code'
//                   value={jobForm.job_location.zip_code}
//                   onChange={e => handleChange('zip_code', e.target.value)}
//                   required
//                 />
//               </Grid>
//               {/* Country */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label='Country'
//                   value={jobForm.job_location.country}
//                   onChange={e => handleChange('country', e.target.value)}
//                   required
//                 />
//               </Grid>
//               {/* Coordinates Input */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label='Coordinates (Latitude, Longitude)'
//                   placeholder='e.g., 6.4423440342408345, 80.01947592710006'
//                   onBlur={e => handleCoordinatesChange(e.target.value)}
//                   helperText='Optional: Provide coordinates for precise location'
//                 />
//               </Grid>
//             </>
//           )}

//           {/* Company Location Details */}
//           {useCompanyAddress && companyAddress && (
//             <>
//               <Grid item xs={12}>
//                 <Typography variant='subtitle1'>Company Location</Typography>
//                 <Divider sx={{ mb: 2 }} />
//               </Grid>
//               {/* Address Line 1 */}
//               <Grid item xs={12} sm={6}>
//                 <TextField fullWidth label='Address Line 1' value={jobForm.job_location.line1} disabled required />
//               </Grid>
//               {/* Address Line 2 */}
//               <Grid item xs={12} sm={6}>
//                 <TextField fullWidth label='Address Line 2' value={jobForm.job_location.line2} disabled />
//               </Grid>
//               {/* City */}
//               <Grid item xs={12} sm={4}>
//                 <TextField fullWidth label='City' value={jobForm.job_location.city} disabled />
//               </Grid>
//               {/* Province */}
//               <Grid item xs={12} sm={4}>
//                 <TextField fullWidth label='Province' value={jobForm.job_location.province} disabled />
//               </Grid>
//               {/* Zip Code */}
//               <Grid item xs={12} sm={4}>
//                 <TextField fullWidth label='Zip Code' value={jobForm.job_location.zip_code} disabled />
//               </Grid>
//               {/* Country */}
//               <Grid item xs={12} sm={6}>
//                 <TextField fullWidth label='Country' value={jobForm.job_location.country} disabled />
//               </Grid>
//               {/* Coordinates Display */}
//               {jobForm.job_location.coordinates && (
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label='Coordinates'
//                     value={`${jobForm.job_location.coordinates.latitude}, ${jobForm.job_location.coordinates.longitude}`}
//                     disabled
//                   />
//                 </Grid>
//               )}
//             </>
//           )}

//           {/* Job Description */}
//           <Grid item xs={12}>
//             <TextareaAutosize
//               aria-label='Job Description'
//               placeholder='Job Description'
//               value={jobForm.job_description}
//               onChange={e => handleChange('job_description', e.target.value)}
//               style={{
//                 width: '100%',
//                 minHeight: '100px',
//                 resize: 'vertical', // Allows users to resize both horizontally and vertically
//                 padding: '8px',
//                 fontSize: '16px',
//                 border: '1px solid #ccc',
//                 borderRadius: '4px'
//               }}
//             />
//           </Grid>
//           {/* Skills */}
//           <Grid item xs={12}>
//             <Autocomplete
//               multiple
//               options={skillOptions}
//               getOptionLabel={(option: Skill | string) => (typeof option === 'string' ? option : option.name)}
//               value={jobForm.skills.map(skillId => {
//                 const foundSkill = skillOptions.find(skill => skill._id === skillId)
//                 return foundSkill ? foundSkill : skillId
//               })}
//               onChange={handleSkillsChange}
//               inputValue={skillInputValue}
//               onInputChange={(event, newInputValue) => setSkillInputValue(newInputValue)}
//               filterSelectedOptions
//               loading={loadingSkills}
//               freeSolo
//               renderInput={params => (
//                 <TextField
//                   {...params}
//                   label='Skills'
//                   placeholder='Add skills'
//                   helperText='You can select up to 10 skills'
//                   InputProps={{
//                     ...params.InputProps,
//                     endAdornment: (
//                       <>
//                         {loadingSkills ? <CircularProgress color='inherit' size={20} /> : null}
//                         {params.InputProps.endAdornment}
//                       </>
//                     )
//                   }}
//                 />
//               )}
//             />
//           </Grid>
//           {/* Video URL */}
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label='Video URL'
//               value={jobForm.video_url}
//               onChange={e => handleChange('video_url', e.target.value)}
//               type='url'
//             />
//           </Grid>
//           {/* CV Send Email */}
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label='CV Send Email'
//               value={jobForm.cv_send_email}
//               onChange={e => handleChange('cv_send_email', e.target.value)}
//               type='email'
//             />
//           </Grid>
//           {/* Job Closing Date */}
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label='Job Closing Date'
//               type='date'
//               InputLabelProps={{
//                 shrink: true
//               }}
//               value={jobForm.job_closing_date}
//               onChange={e => handleChange('job_closing_date', e.target.value)}
//               required
//             />
//           </Grid>
//           {/* Job Post Type */}
//           <Grid item xs={12} sm={6}>
//             <TextField
//               select
//               fullWidth
//               label='Job Post Type'
//               value={jobForm.job_post_type}
//               onChange={e => handleChange('job_post_type', e.target.value)}
//               required
//             >
//               {jobPostTypeOptions.map(type => (
//                 <MenuItem key={type} value={type}>
//                   {type}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Grid>

//           {/* Feedback Messages */}
//           <Grid item xs={12}>
//             {error && (
//               <Alert severity='error' sx={{ mb: 2 }}>
//                 {error}
//               </Alert>
//             )}
//             {success && (
//               <Alert severity='success' sx={{ mb: 2 }}>
//                 {success}
//               </Alert>
//             )}
//           </Grid>
//           {/* Action Buttons */}
//           <Grid item xs={12}>
//             <Tooltip title='Create Job'>
//               <Button type='submit' variant='contained' color='primary' disabled={saving}>
//                 {saving ? 'Saving...' : 'Create Job'}
//               </Button>
//             </Tooltip>
//           </Grid>
//         </Grid>
//       </form>
//     </Card>
//   )
// }

// export default AddJob
