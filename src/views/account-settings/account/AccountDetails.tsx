// src/views/account-settings/account/AccountDetails.tsx

'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'

// Next.js and Authentication Imports
import { useSession, signIn } from 'next-auth/react'

// Axios for API calls
import axios from 'axios'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import type { SelectChangeEvent } from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Autocomplete from '@mui/material/Autocomplete'
import dayjs, { Dayjs } from 'dayjs'

import { useDebounce } from 'use-debounce'
import { Types } from 'mongoose'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

type Address = {
  line1?: string
  line2?: string
  city?: string
  province?: string
  zip_code?: string
  country?: string
}

type Education = {
  degree_title: string
  institute_name: string
  field_of_study: string
  start_date: Dayjs | null
  end_date: Dayjs | null
  skills: string[] // Skill names
  description: string
}

type Certification = {
  certification_name: string
  certification_authority: string
  obtained_date: Dayjs | null
  expiry_date: Dayjs | null
  credential_url: string
  description: string
}

type Course = {
  course_name: string
  institution: string
  start_date: Dayjs | null
  end_date: Dayjs | null
  description: string
}

type Project = {
  project_name: string
  client: string
  start_date: Dayjs | null
  end_date: Dayjs | null
  description: string
  skills_used: string[] // Skill names
}

type Award = {
  award_name: string
  awarding_authority: string
  award_received_date: Dayjs | null
  description: string
}

type ReferenceContact = {
  name: string
  company: string
  designation: string
  email: string
  phone: string
}

type Data = {
  username: string
  email: string
  work_email: string
  display_name: string
  role: string
  birthday: Dayjs | null
  first_name: string
  middle_name: string
  last_name: string
  profile_picture: string
  cover_image: string
  resume: string
  cover_letter: string
  gender: string
  skills: (string | { _id: string; skill_name: string })[]
  languages: string[]
  address: Address
  mobile_no: string
  work_mobile_no: string
  notification_method: string
  education: Education[]
  certifications: Certification[]
  courses: Course[]
  projects: Project[]
  awards: Award[]
  reference_contacts: ReferenceContact[]
  profile_status: string
  two_factor_auth: {
    enabled: boolean
    method: string
  }
  // Add other fields if necessary
}

const AccountDetails = () => {
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState<Data | null>(null)
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const [fileInput, setFileInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Options for select fields
  const genderOptions = ['Male', 'Female', 'Other']
  const notificationMethods = ['None', 'SMS', 'Email']
  const profileStatuses = ['Active', 'Inactive']
  const twoFactorMethods = ['Email', 'AuthenticatorApp']
  const languageOptions = ['English', 'Arabic', 'French', 'German', 'Portuguese']
  const countryOptions = ['USA', 'UK', 'Australia', 'Germany', 'Sri Lanka']
  // const skillOptions = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'] // Fetch from Skills collection in a real app

  const [skillOptions, setSkillOptions] = useState<{ _id: string; skill_name: string }[]>([])
  const [skillInputValue, setSkillInputValue] = useState<string>('')
  const [debouncedSkillInputValue] = useDebounce(skillInputValue, 500)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      signIn()
      return
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const userData = response.data

        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          work_email: userData.work_email || '',
          display_name: userData.display_name || '',
          role: userData.role || '',
          birthday: userData.birthday ? dayjs(userData.birthday) : null,
          first_name: userData.first_name || '',
          middle_name: userData.middle_name || '',
          last_name: userData.last_name || '',
          profile_picture: userData.profile_picture || '/images/avatars/1.png',
          cover_image: userData.cover_image || '',
          resume: userData.resume || '',
          cover_letter: userData.cover_letter || '',
          gender: userData.gender || '',
          skills: userData.skills || [],
          languages: userData.languages || [],
          address: userData.address || {},
          mobile_no: userData.mobile_no || '',
          work_mobile_no: userData.work_mobile_no || '',
          notification_method: userData.notification_method || '',
          education: userData.education
            ? userData.education.map((edu: any) => ({
                ...edu,
                start_date: edu.start_date ? dayjs(edu.start_date) : null,
                end_date: edu.end_date ? dayjs(edu.end_date) : null
              }))
            : [],
          certifications: userData.certifications
            ? userData.certifications.map((cert: any) => ({
                ...cert,
                obtained_date: cert.obtained_date ? dayjs(cert.obtained_date) : null,
                expiry_date: cert.expiry_date ? dayjs(cert.expiry_date) : null
              }))
            : [],
          courses: userData.courses
            ? userData.courses.map((course: any) => ({
                ...course,
                start_date: course.start_date ? dayjs(course.start_date) : null,
                end_date: course.end_date ? dayjs(course.end_date) : null
              }))
            : [],
          projects: userData.projects
            ? userData.projects.map((prj: any) => ({
                ...prj,
                start_date: prj.start_date ? dayjs(prj.start_date) : null,
                end_date: prj.end_date ? dayjs(prj.end_date) : null
              }))
            : [],
          awards: userData.awards
            ? userData.awards.map((awrd: any) => ({
                ...awrd,
                award_received_date: awrd.award_received_date ? dayjs(awrd.award_received_date) : null
              }))
            : [],
          reference_contacts: userData.reference_contacts || [],
          profile_status: userData.profile_status || '',
          two_factor_auth: userData.two_factor_auth || { enabled: false, method: '' }
          // Add other fields if necessary
        })

        setImgSrc(userData.profile_picture || '/images/avatars/1.png')
        setLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load user data')
        setLoading(false)
      }
    }

    fetchUserData()
  }, [session, status])

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get('/api/skills', {
          params: { q: debouncedSkillInputValue }
        })
        setSkillOptions(response.data)
      } catch (error) {
        console.error('Error fetching skills:', error)
      }
    }

    if (debouncedSkillInputValue !== '') {
      fetchSkills()
    } else {
      // Optionally fetch default skills when input is empty
      setSkillOptions([])
    }
  }, [debouncedSkillInputValue])

  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography color='error'>{error}</Typography>
  if (!formData) return null

  const handleFormChange = (field: keyof Data, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleNestedChange = (section: keyof Data, index: number, field: string, value: any) => {
    if (!Array.isArray(formData[section])) return
    const updatedArray = [...(formData[section] as any[])]
    updatedArray[index] = { ...updatedArray[index], [field]: value }
    setFormData({ ...formData, [section]: updatedArray })
  }

  const handleAddItem = (section: keyof Data, newItem: any) => {
    if (!Array.isArray(formData[section])) return
    const updatedArray = [...(formData[section] as any[]), newItem]
    setFormData({ ...formData, [section]: updatedArray })
  }

  const handleRemoveItem = (section: keyof Data, index: number) => {
    if (!Array.isArray(formData[section])) return
    const updatedArray = [...(formData[section] as any[])]
    updatedArray.splice(index, 1)
    setFormData({ ...formData, [section]: updatedArray })
  }

  const handleSkillChange = async (newValue: any[]) => {
    const lastValue = newValue[newValue.length - 1]

    if (typeof lastValue === 'string') {
      // User typed a new skill
      try {
        // Create new skill
        const response = await axios.post('/api/skills', { skill_name: lastValue })
        const newSkill = response.data

        // Replace the string with the new skill object
        const updatedSkills = [...newValue.slice(0, -1), newSkill]

        handleFormChange('skills', updatedSkills)
      } catch (error) {
        console.error('Error creating new skill:', error)
      }
    } else {
      handleFormChange('skills', newValue)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { email, ...formDataWithoutEmail } = formData

      const dataToSubmit = {
        ...formDataWithoutEmail,
        birthday: formData.birthday ? formData.birthday.toISOString() : null,
        education: formData.education.map(edu => ({
          ...edu,
          start_date: edu.start_date ? edu.start_date.toISOString() : null,
          end_date: edu.end_date ? edu.end_date.toISOString() : null
        })),
        certifications: formData.certifications.map(cert => ({
          ...cert,
          obtained_date: cert.obtained_date ? cert.obtained_date.toISOString() : null,
          expiry_date: cert.expiry_date ? cert.expiry_date.toISOString() : null
        })),
        courses: formData.courses.map(course => ({
          ...course,
          start_date: course.start_date ? course.start_date.toISOString() : null,
          end_date: course.end_date ? course.end_date.toISOString() : null
        })),
        projects: formData.projects.map(prj => ({
          ...prj,
          start_date: prj.start_date ? prj.start_date.toISOString() : null,
          end_date: prj.end_date ? prj.end_date.toISOString() : null
        })),
        awards: formData.awards.map(awrd => ({
          ...awrd,
          award_received_date: awrd.award_received_date ? awrd.award_received_date.toISOString() : null
        })),
        skills: formData.skills.map(skill => {
          if (typeof skill === 'string') {
            // If it's a string, this means the new skill was not replaced with the skill object
            // You may need to handle this case appropriately
            return skill // This will cause the validation error
          } else {
            return skill._id // Extract the skill ID
          }
        })

        // ... repeat for other date fields
      }
      await axios.put('/api/user/update', dataToSubmit)
      alert('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)

      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response:', error.response.data)
        alert(`Failed to update profile: ${error.response.data.error}`)
      } else {
        alert('Failed to update profile')
      }
    }
  }

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target

    if (files && files.length > 0) {
      const file = files[0]

      // Preview the image
      const reader = new FileReader()
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(file)

      // Upload the file
      const imageData = new FormData()
      imageData.append('profile_picture', file) // Changed key to 'profile_picture'

      try {
        const response = await axios.post('/api/user/upload-profile-picture', imageData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        // Update the profile picture URL in formData
        setFormData(prev => (prev ? { ...prev, profile_picture: response.data.profile_picture_url } : prev))
        alert('Profile picture updated successfully')
      } catch (error) {
        console.error('Error uploading profile picture:', error)

        if (axios.isAxiosError(error) && error.response) {
          console.error('Server response:', error.response.data)
          alert(`Failed to upload profile picture: ${error.response.data.error}`)
        } else {
          alert('Failed to upload profile picture')
        }
      }
    }
  }

  return (
    <Card>
      <CardContent className='mbe-5'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button component='label' size='small' variant='contained' htmlFor='account-settings-upload-image'>
                Upload New Photo
                <input
                  hidden
                  type='file'
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />
              </Button>
              <Button
                size='small'
                variant='outlined'
                color='error'
                onClick={() => {
                  setImgSrc('/images/avatars/1.png')
                  setFormData({ ...formData, profile_picture: '/images/avatars/1.png' })
                }}
              >
                Reset
              </Button>
            </div>
            <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant='h6'>Personal Information</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='First Name'
                value={formData.first_name}
                onChange={e => handleFormChange('first_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='Middle Name'
                value={formData.middle_name}
                onChange={e => handleFormChange('middle_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='Last Name'
                value={formData.last_name}
                onChange={e => handleFormChange('last_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='Display Name'
                value={formData.display_name}
                onChange={e => handleFormChange('display_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='Birthday'
                  value={formData.birthday}
                  onChange={(date: Dayjs | null) => handleFormChange('birthday', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  label='Gender'
                  value={formData.gender}
                  onChange={e => handleFormChange('gender', e.target.value)}
                >
                  {genderOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant='h6'>Contact Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                disabled
                label='Email'
                value={formData.email}
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Work Email'
                value={formData.work_email}
                onChange={e => handleFormChange('work_email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Mobile Number'
                value={formData.mobile_no}
                onChange={e => handleFormChange('mobile_no', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Work Mobile Number'
                value={formData.work_mobile_no}
                onChange={e => handleFormChange('work_mobile_no', e.target.value)}
              />
            </Grid>
            {/* Address */}
            <Grid item xs={12}>
              <Typography variant='h6'>Address</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Address Line 1'
                value={formData.address.line1 || ''}
                onChange={e => handleFormChange('address', { ...formData.address, line1: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Address Line 2'
                value={formData.address.line2 || ''}
                onChange={e => handleFormChange('address', { ...formData.address, line2: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='City'
                value={formData.address.city || ''}
                onChange={e => handleFormChange('address', { ...formData.address, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='Province/State'
                value={formData.address.province || ''}
                onChange={e => handleFormChange('address', { ...formData.address, province: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='Zip Code'
                value={formData.address.zip_code || ''}
                onChange={e => handleFormChange('address', { ...formData.address, zip_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  label='Country'
                  value={formData.address.country || ''}
                  onChange={e => handleFormChange('address', { ...formData.address, country: e.target.value })}
                >
                  {countryOptions.map(country => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Skills and Languages */}
            <Grid item xs={12}>
              <Typography variant='h6'>Professional Details</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={skillOptions}
                getOptionLabel={option => (typeof option === 'string' ? option : option.skill_name)}
                value={formData.skills}
                onChange={(event, newValue) => handleSkillChange(newValue)}
                inputValue={skillInputValue}
                onInputChange={(event, newInputValue) => setSkillInputValue(newInputValue)}
                filterSelectedOptions
                isOptionEqualToValue={(option, value) => {
                  if (typeof option === 'string' || typeof value === 'string') {
                    return option === value
                  } else {
                    return option._id === value._id
                  }
                }}
                freeSolo
                renderInput={params => <TextField {...params} label='Skills' placeholder='Add skill' />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={languageOptions}
                getOptionLabel={option => option}
                value={formData.languages}
                onChange={(event, newValue) => handleFormChange('languages', newValue)}
                renderInput={params => <TextField {...params} label='Languages' placeholder='Add language' />}
              />
            </Grid>
            {/* Education */}
            <Grid item xs={12}>
              <Typography variant='h6'>Education</Typography>
              {formData.education.map((edu, index) => (
                <Card key={index} variant='outlined' className='mb-4'>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Degree Title'
                          value={edu.degree_title}
                          onChange={e => handleNestedChange('education', index, 'degree_title', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Institute Name'
                          value={edu.institute_name}
                          onChange={e => handleNestedChange('education', index, 'institute_name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='Start Date'
                            value={edu.start_date}
                            onChange={(date: Dayjs | null) =>
                              handleNestedChange('education', index, 'start_date', date)
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {' '}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='End Date'
                            value={edu.end_date}
                            onChange={(date: Dayjs | null) => handleNestedChange('education', index, 'end_date', date)}
                            slotProps={{
                              textField: {
                                fullWidth: true
                              }
                            }}
                          />{' '}
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Description'
                          multiline
                          rows={3}
                          value={edu.description}
                          onChange={e => handleNestedChange('education', index, 'description', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button variant='outlined' color='error' onClick={() => handleRemoveItem('education', index)}>
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant='contained'
                onClick={() =>
                  handleAddItem('education', {
                    degree_title: '',
                    institute_name: '',
                    field_of_study: '',
                    start_date: null,
                    end_date: null,
                    skills: [],
                    description: ''
                  })
                }
              >
                Add Education
              </Button>
            </Grid>
            {/* Certifications */}
            <Grid item xs={12}>
              <Typography variant='h6'>Certifications</Typography>
              {formData.certifications.map((cert, index) => (
                <Card key={index} variant='outlined' className='mb-4'>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Certification Name'
                          value={cert.certification_name}
                          onChange={e =>
                            handleNestedChange('certifications', index, 'certification_name', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Certification Authority'
                          value={cert.certification_authority}
                          onChange={e =>
                            handleNestedChange('certifications', index, 'certification_authority', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='Obtained Date'
                            value={cert.obtained_date}
                            onChange={(date: Dayjs | null) =>
                              handleNestedChange('certifications', index, 'obtained_date', date)
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='Expiry Date'
                            value={cert.expiry_date}
                            onChange={(date: Dayjs | null) =>
                              handleNestedChange('certifications', index, 'expiry_date', date)
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>

                      <Grid item xs={12} sm={12}>
                        <TextField
                          fullWidth
                          label='Credential URL'
                          value={cert.credential_url}
                          onChange={e => handleNestedChange('certifications', index, 'credential_url', e.target.value)}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Description'
                          multiline
                          rows={3}
                          value={cert.description}
                          onChange={e => handleNestedChange('certifications', index, 'description', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant='outlined'
                          color='error'
                          onClick={() => handleRemoveItem('certifications', index)}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant='contained'
                onClick={() =>
                  handleAddItem('certifications', {
                    certification_name: '',
                    certification_authority: '',
                    obtained_date: null,
                    expiry_date: null,
                    credential_url: '',
                    description: ''
                  })
                }
              >
                Add Certification
              </Button>
            </Grid>
            {/* Courses */}
            <Grid item xs={12}>
              <Typography variant='h6'>Courses</Typography>
              {formData.courses.map((course, index) => (
                <Card key={index} variant='outlined' className='mb-4'>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Course Name'
                          value={course.course_name}
                          onChange={e => handleNestedChange('courses', index, 'course_name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Institution'
                          value={course.institution}
                          onChange={e => handleNestedChange('courses', index, 'institution', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='Start Date'
                            value={course.start_date}
                            onChange={(date: Dayjs | null) => handleNestedChange('courses', index, 'start_date', date)}
                            slotProps={{
                              textField: {
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='End Date'
                            value={course.end_date}
                            onChange={(date: Dayjs | null) => handleNestedChange('courses', index, 'end_date', date)}
                            slotProps={{
                              textField: {
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Description'
                          multiline
                          rows={3}
                          value={course.description}
                          onChange={e => handleNestedChange('courses', index, 'description', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button variant='outlined' color='error' onClick={() => handleRemoveItem('courses', index)}>
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant='contained'
                onClick={() =>
                  handleAddItem('courses', {
                    course_name: '',
                    institution: '',
                    start_date: null,
                    end_date: null,
                    description: ''
                  })
                }
              >
                Add Course
              </Button>
            </Grid>
            {/* Projects */}
            <Grid item xs={12}>
              <Typography variant='h6'>Projects</Typography>
              {formData.projects.map((prj, index) => (
                <Card key={index} variant='outlined' className='mb-4'>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Project Name'
                          value={prj.project_name}
                          onChange={e => handleNestedChange('projects', index, 'project_name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Client'
                          value={prj.client}
                          onChange={e => handleNestedChange('projects', index, 'client', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='Start Date'
                            value={prj.start_date}
                            onChange={(date: Dayjs | null) => handleNestedChange('projects', index, 'start_date', date)}
                            slotProps={{
                              textField: {
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='End Date'
                            value={prj.end_date}
                            onChange={(date: Dayjs | null) => handleNestedChange('projects', index, 'end_date', date)}
                            slotProps={{
                              textField: {
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <Autocomplete
                          multiple
                          options={skillOptions}
                          getOptionLabel={option => (typeof option === 'string' ? option : option.skill_name)}
                          value={formData.skills}
                          onChange={(event, newValue) => handleSkillChange(newValue)}
                          inputValue={skillInputValue}
                          onInputChange={(event, newInputValue) => setSkillInputValue(newInputValue)}
                          filterSelectedOptions
                          isOptionEqualToValue={(option, value) => {
                            if (typeof option === 'string' || typeof value === 'string') {
                              return option === value
                            } else {
                              return option._id === value._id
                            }
                          }}
                          freeSolo
                          renderInput={params => <TextField {...params} label='Skills' placeholder='Add skill' />}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Description'
                          multiline
                          rows={3}
                          value={prj.description}
                          onChange={e => handleNestedChange('projects', index, 'description', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button variant='outlined' color='error' onClick={() => handleRemoveItem('projects', index)}>
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant='contained'
                onClick={() =>
                  handleAddItem('projects', {
                    project_name: '',
                    client: '',
                    start_date: null,
                    end_date: null,
                    description: '',
                    skills_used: []
                  })
                }
              >
                Add Project
              </Button>
            </Grid>
            {/* Awards */}
            <Grid item xs={12}>
              <Typography variant='h6'>Awards</Typography>
              {formData.awards.map((awrd, index) => (
                <Card key={index} variant='outlined' className='mb-4'>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Award Name'
                          value={awrd.award_name}
                          onChange={e => handleNestedChange('awards', index, 'award_name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Awarding Authority'
                          value={awrd.awarding_authority}
                          onChange={e => handleNestedChange('awards', index, 'awarding_authority', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='Award Received Date'
                            value={awrd.award_received_date}
                            onChange={(date: Dayjs | null) =>
                              handleNestedChange('awards', index, 'award_received_date', date)
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Description'
                          multiline
                          rows={3}
                          value={awrd.description}
                          onChange={e => handleNestedChange('awards', index, 'description', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button variant='outlined' color='error' onClick={() => handleRemoveItem('awards', index)}>
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant='contained'
                onClick={() =>
                  handleAddItem('awards', {
                    award_name: '',
                    awarding_authority: '',
                    award_received_date: null,
                    description: ''
                  })
                }
              >
                Add Award
              </Button>
            </Grid>
            {/* Repeat similar blocks for Certifications, Courses, Projects, Awards, Reference Contacts */}
            {/* Two-Factor Authentication */}
            <Grid item xs={12}>
              <Typography variant='h6'>Security</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.two_factor_auth.enabled}
                    onChange={e =>
                      handleFormChange('two_factor_auth', {
                        ...formData.two_factor_auth,
                        enabled: e.target.checked
                      })
                    }
                  />
                }
                label='Enable Two-Factor Authentication'
              />
            </Grid>
            {formData.two_factor_auth.enabled && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Method</InputLabel>
                  <Select
                    label='Method'
                    value={formData.two_factor_auth.method}
                    onChange={e =>
                      handleFormChange('two_factor_auth', {
                        ...formData.two_factor_auth,
                        method: e.target.value
                      })
                    }
                  >
                    {twoFactorMethods.map(method => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {/* Notification Method */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Notification Method</InputLabel>
                <Select
                  label='Preferred Notification Method'
                  value={formData.notification_method}
                  onChange={e => handleFormChange('notification_method', e.target.value)}
                >
                  {notificationMethods.map(method => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Profile Status */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Profile Status</InputLabel>
                <Select
                  label='Profile Status'
                  value={formData.profile_status}
                  onChange={e => handleFormChange('profile_status', e.target.value)}
                >
                  {profileStatuses.map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Save Button */}
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>
                Save Changes
              </Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={() => setFormData(formData)}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails

// // src/views/account-settings/account/AccountDetails.tsx

// 'use client'

// import { useState, useEffect } from 'react'
// import axios from 'axios'
// import { useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react' // Use useSession
// import { Formik, Form, FormikHelpers, FieldArray } from 'formik'
// import * as Yup from 'yup'

// // MUI Imports
// import Grid from '@mui/material/Grid'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Button from '@mui/material/Button'
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import FormControl from '@mui/material/FormControl'
// import InputLabel from '@mui/material/InputLabel'
// import Select from '@mui/material/Select'
// import MenuItem from '@mui/material/MenuItem'
// import Chip from '@mui/material/Chip'

// interface Education {
//   degree_title: string
//   institute_name: string
//   field_of_study: string
//   start_date: string
//   end_date: string
//   skills: string[]
//   description: string
// }

// // Define Address Interface
// interface Address {
//   line1: string
//   line2?: string
//   city: string
//   province: string
//   zip_code: string
//   country: string
// }

// // Define UserData Interface
// interface UserData {
//   _id: string
//   first_name: string
//   last_name: string
//   email: string
//   mobile_no: string
//   address: Address
//   languages: string[]
//   profile_picture?: string
//   // Add other fields as needed
//   education: Education[]
// }

// // Validation Schema
// const validationSchema = Yup.object().shape({
//   first_name: Yup.string().required('First Name is required'),
//   last_name: Yup.string().required('Last Name is required'),
//   email: Yup.string().email('Invalid email').required('Email is required'),
//   mobile_no: Yup.string().required('Mobile Number is required'),
//   address: Yup.object().shape({
//     line1: Yup.string().required('Address Line 1 is required'),
//     city: Yup.string().required('City is required'),
//     province: Yup.string().required('State/Province is required'),
//     country: Yup.string().required('Country is required'),
//     zip_code: Yup.string().required('Zip Code is required')
//   }),
//   languages: Yup.array().of(Yup.string()).min(1, 'Select at least one language')
// })

// const languageOptions = ['English', 'Arabic', 'French', 'German', 'Portuguese']

// const AccountDetails = () => {
//   const [userData, setUserData] = useState<UserData | null>(null)
//   const [imgSrc, setImgSrc] = useState<string>('/images/avatars/default-avatar.png')
//   const router = useRouter()
//   const [openEducationModal, setOpenEducationModal] = useState(false)
//   const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null)

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await axios.get('/api/user/me')
//         const data = response.data as UserData

//         // Ensure address and other fields are defined
//         if (!data.address) {
//           data.address = {
//             line1: '',
//             line2: '',
//             city: '',
//             province: '',
//             zip_code: '',
//             country: ''
//           }
//         }

//         // Ensure arrays are defined
//         data.languages = data.languages || []
//         data.education = data.education || []

//         setUserData(data)
//         if (data.profile_picture) {
//           setImgSrc(data.profile_picture)
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error)
//         router.push('/login')
//       }
//     }
//     fetchUserData()
//   }, [router])

//   const handleFormSubmit = async (values: UserData, actions: FormikHelpers<UserData>) => {
//     try {
//       await axios.put('/api/user/update', values)
//       // Show success notification
//       // Optionally reset form dirty state
//       actions.setSubmitting(false)
//     } catch (error) {
//       console.error('Error updating user data:', error)
//       // Show error notification
//       actions.setSubmitting(false)
//     }
//   }

//   const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { files } = event.target
//     if (files && files.length > 0) {
//       const formData = new FormData()
//       formData.append('profile_picture', files[0])

//       try {
//         const response = await axios.post('/api/user/upload-profile-picture', formData)
//         setImgSrc(response.data.profile_picture_url)
//         // Update user data with new profile picture URL
//         setUserData(prev => (prev ? { ...prev, profile_picture: response.data.profile_picture_url } : prev))
//       } catch (error) {
//         console.error('Error uploading profile picture:', error)
//         // Show error notification
//       }
//     }
//   }

//   if (!userData) {
//     return <Typography>Loading...</Typography>
//   }

//   return (
//     <Card>
//       <CardContent className='mbe-5'>
//         <div className='flex flex-col sm:flex-row items-center gap-6'>
//           <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
//           <div className='flex flex-grow flex-col gap-4'>
//             <div className='flex flex-col sm:flex-row gap-4'>
//               <Button component='label' size='small' variant='contained'>
//                 Upload New Photo
//                 <input hidden type='file' accept='image/png, image/jpeg' onChange={handleFileInputChange} />
//               </Button>
//               {/* Optionally add a remove photo button */}
//             </div>
//             <Typography>Allowed JPG or PNG. Max size of 800KB</Typography>
//           </div>
//         </div>
//       </CardContent>
//       <CardContent>
//         <Formik<UserData>
//           initialValues={{
//             ...userData,
//             languages: userData.languages || [],

//             address: userData.address || {
//               line1: '',
//               line2: '',
//               city: '',
//               province: '',
//               zip_code: '',
//               country: ''
//             }
//           }}
//           validationSchema={validationSchema}
//           onSubmit={handleFormSubmit}
//           enableReinitialize // Add this if initialValues may change
//         >
//           {({ values, errors, touched, handleChange, setFieldValue, resetForm }) => (
//             <Form>
//               <Grid container spacing={5}>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label='First Name'
//                     name='first_name'
//                     value={values.first_name}
//                     onChange={handleChange}
//                     error={touched.first_name && Boolean(errors.first_name)}
//                     helperText={touched.first_name && errors.first_name}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label='Last Name'
//                     name='last_name'
//                     value={values.last_name}
//                     onChange={handleChange}
//                     error={touched.last_name && Boolean(errors.last_name)}
//                     helperText={touched.last_name && errors.last_name}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label='Email'
//                     name='email'
//                     value={values.email}
//                     onChange={handleChange}
//                     error={touched.email && Boolean(errors.email)}
//                     helperText={touched.email && errors.email}
//                     disabled // Email should typically be read-only
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label='Mobile Number'
//                     name='mobile_no'
//                     value={values.mobile_no}
//                     onChange={handleChange}
//                     error={touched.mobile_no && Boolean(errors.mobile_no)}
//                     helperText={touched.mobile_no && errors.mobile_no}
//                   />
//                 </Grid>
//                 <Grid item xs={12}>
//                   <TextField
//                     fullWidth
//                     label='Address Line 1'
//                     name='address.line1'
//                     value={values.address.line1}
//                     onChange={handleChange}
//                     error={touched.address?.line1 && Boolean(errors.address?.line1)}
//                     helperText={touched.address?.line1 && errors.address?.line1}
//                   />
//                 </Grid>

//                 {/* Add other address fields similarly */}
//                 <Grid item xs={12} sm={6}>
//                   <FormControl fullWidth error={touched.languages && Boolean(errors.languages)}>
//                     <InputLabel>Languages</InputLabel>
//                     <Select
//                       multiple
//                       name='languages'
//                       value={values.languages}
//                       onChange={event => {
//                         const { value } = event.target
//                         setFieldValue('languages', typeof value === 'string' ? value.split(',') : value)
//                       }}
//                       renderValue={selected => (
//                         <div className='flex flex-wrap gap-2'>
//                           {(selected as string[]).map(value => (
//                             <Chip
//                               key={value}
//                               label={value}
//                               onDelete={() => {
//                                 const newLanguages = values.languages.filter(lang => lang !== value)
//                                 setFieldValue('languages', newLanguages)
//                               }}
//                             />
//                           ))}
//                         </div>
//                       )}
//                     >
//                       {languageOptions.map(name => (
//                         <MenuItem key={name} value={name}>
//                           {name}
//                         </MenuItem>
//                       ))}
//                     </Select>

//                     {touched.languages && errors.languages && <Typography color='error'>{errors.languages}</Typography>}
//                   </FormControl>
//                 </Grid>
//                 {/* Add more fields as per your UserData interface */}
//                 <Grid item xs={12} className='flex gap-4 flex-wrap'>
//                   <Button variant='contained' type='submit'>
//                     Save Changes
//                   </Button>
//                   <Button variant='outlined' type='button' color='secondary' onClick={() => resetForm()}>
//                     Reset
//                   </Button>
//                 </Grid>
//               </Grid>
//             </Form>
//           )}
//         </Formik>
//       </CardContent>
//     </Card>
//   )
// }

// export default AccountDetails

// // src\views\account-settings\account\AccountDetails.tsx

// 'use client'

// // React Imports
// import { useState } from 'react'
// import type { ChangeEvent } from 'react'

// // MUI Imports
// import Grid from '@mui/material/Grid'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Button from '@mui/material/Button'
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import FormControl from '@mui/material/FormControl'
// import InputLabel from '@mui/material/InputLabel'
// import Select from '@mui/material/Select'
// import MenuItem from '@mui/material/MenuItem'
// import Chip from '@mui/material/Chip'
// import type { SelectChangeEvent } from '@mui/material/Select'

// type Data = {
//   firstName: string
//   lastName: string
//   email: string
//   organization: string
//   phoneNumber: number | string
//   address: string
//   state: string
//   zipCode: string
//   country: string
//   language: string
//   timezone: string
//   currency: string
// }

// // Vars
// const initialData: Data = {
//   firstName: 'John',
//   lastName: 'Doe',
//   email: 'john.doe@example.com',
//   organization: 'ThemeSelection',
//   phoneNumber: '+1 (917) 543-9876',
//   address: '123 Main St, New York, NY 10001',
//   state: 'New York',
//   zipCode: '634880',
//   country: 'usa',
//   language: 'arabic',
//   timezone: 'gmt-12',
//   currency: 'usd'
// }

// const languageData = ['English', 'Arabic', 'French', 'German', 'Portuguese']

// const AccountDetails = () => {
//   // States
//   const [formData, setFormData] = useState<Data>(initialData)
//   const [fileInput, setFileInput] = useState<string>('')
//   const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
//   const [language, setLanguage] = useState<string[]>(['English'])

//   const handleDelete = (value: string) => {
//     setLanguage(current => current.filter(item => item !== value))
//   }

//   const handleChange = (event: SelectChangeEvent<string[]>) => {
//     setLanguage(event.target.value as string[])
//   }

//   const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
//     setFormData({ ...formData, [field]: value })
//   }

//   const handleFileInputChange = (file: ChangeEvent) => {
//     const reader = new FileReader()
//     const { files } = file.target as HTMLInputElement

//     if (files && files.length !== 0) {
//       reader.onload = () => setImgSrc(reader.result as string)
//       reader.readAsDataURL(files[0])

//       if (reader.result !== null) {
//         setFileInput(reader.result as string)
//       }
//     }
//   }

//   const handleFileInputReset = () => {
//     setFileInput('')
//     setImgSrc('/images/avatars/1.png')
//   }

//   return (
//     <Card>
//       <CardContent className='mbe-5'>
//         <div className='flex max-sm:flex-col items-center gap-6'>
//           <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
//           <div className='flex flex-grow flex-col gap-4'>
//             <div className='flex flex-col sm:flex-row gap-4'>
//               <Button component='label' size='small' variant='contained' htmlFor='account-settings-upload-image'>
//                 Upload New Photo
//                 <input
//                   hidden
//                   type='file'
//                   value={fileInput}
//                   accept='image/png, image/jpeg'
//                   onChange={handleFileInputChange}
//                   id='account-settings-upload-image'
//                 />
//               </Button>
//               <Button size='small' variant='outlined' color='error' onClick={handleFileInputReset}>
//                 Reset
//               </Button>
//             </div>
//             <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
//           </div>
//         </div>
//       </CardContent>
//       <CardContent>
//         <form onSubmit={e => e.preventDefault()}>
//           <Grid container spacing={5}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label='First Name'
//                 value={formData.firstName}
//                 placeholder='John'
//                 onChange={e => handleFormChange('firstName', e.target.value)}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label='Last Name'
//                 value={formData.lastName}
//                 placeholder='Doe'
//                 onChange={e => handleFormChange('lastName', e.target.value)}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label='Email'
//                 value={formData.email}
//                 placeholder='john.doe@gmail.com'
//                 onChange={e => handleFormChange('email', e.target.value)}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label='Organization'
//                 value={formData.organization}
//                 placeholder='ThemeSelection'
//                 onChange={e => handleFormChange('organization', e.target.value)}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label='Phone Number'
//                 value={formData.phoneNumber}
//                 placeholder='+1 (234) 567-8901'
//                 onChange={e => handleFormChange('phoneNumber', e.target.value)}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label='Address'
//                 value={formData.address}
//                 placeholder='Address'
//                 onChange={e => handleFormChange('address', e.target.value)}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label='State'
//                 value={formData.state}
//                 placeholder='New York'
//                 onChange={e => handleFormChange('state', e.target.value)}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 type='number'
//                 label='Zip Code'
//                 value={formData.zipCode}
//                 placeholder='123456'
//                 onChange={e => handleFormChange('zipCode', e.target.value)}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Country</InputLabel>
//                 <Select
//                   label='Country'
//                   value={formData.country}
//                   onChange={e => handleFormChange('country', e.target.value)}
//                 >
//                   <MenuItem value='usa'>USA</MenuItem>
//                   <MenuItem value='uk'>UK</MenuItem>
//                   <MenuItem value='australia'>Australia</MenuItem>
//                   <MenuItem value='germany'>Germany</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Language</InputLabel>
//                 <Select
//                   multiple
//                   label='Language'
//                   value={language}
//                   onChange={handleChange}
//                   renderValue={selected => (
//                     <div className='flex flex-wrap gap-2'>
//                       {(selected as string[]).map(value => (
//                         <Chip
//                           key={value}
//                           clickable
//                           deleteIcon={
//                             <i className='ri-close-circle-fill' onMouseDown={event => event.stopPropagation()} />
//                           }
//                           size='small'
//                           label={value}
//                           onDelete={() => handleDelete(value)}
//                         />
//                       ))}
//                     </div>
//                   )}
//                 >
//                   {languageData.map(name => (
//                     <MenuItem key={name} value={name}>
//                       {name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>TimeZone</InputLabel>
//                 <Select
//                   label='TimeZone'
//                   value={formData.timezone}
//                   onChange={e => handleFormChange('timezone', e.target.value)}
//                   MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
//                 >
//                   <MenuItem value='gmt-12'>(GMT-12:00) International Date Line West</MenuItem>
//                   <MenuItem value='gmt-11'>(GMT-11:00) Midway Island, Samoa</MenuItem>
//                   <MenuItem value='gmt-10'>(GMT-10:00) Hawaii</MenuItem>
//                   <MenuItem value='gmt-09'>(GMT-09:00) Alaska</MenuItem>
//                   <MenuItem value='gmt-08'>(GMT-08:00) Pacific Time (US & Canada)</MenuItem>
//                   <MenuItem value='gmt-08-baja'>(GMT-08:00) Tijuana, Baja California</MenuItem>
//                   <MenuItem value='gmt-07'>(GMT-07:00) Chihuahua, La Paz, Mazatlan</MenuItem>
//                   <MenuItem value='gmt-07-mt'>(GMT-07:00) Mountain Time (US & Canada)</MenuItem>
//                   <MenuItem value='gmt-06'>(GMT-06:00) Central America</MenuItem>
//                   <MenuItem value='gmt-06-ct'>(GMT-06:00) Central Time (US & Canada)</MenuItem>
//                   <MenuItem value='gmt-06-mc'>(GMT-06:00) Guadalajara, Mexico City, Monterrey</MenuItem>
//                   <MenuItem value='gmt-06-sk'>(GMT-06:00) Saskatchewan</MenuItem>
//                   <MenuItem value='gmt-05'>(GMT-05:00) Bogota, Lima, Quito, Rio Branco</MenuItem>
//                   <MenuItem value='gmt-05-et'>(GMT-05:00) Eastern Time (US & Canada)</MenuItem>
//                   <MenuItem value='gmt-05-ind'>(GMT-05:00) Indiana (East)</MenuItem>
//                   <MenuItem value='gmt-04'>(GMT-04:00) Atlantic Time (Canada)</MenuItem>
//                   <MenuItem value='gmt-04-clp'>(GMT-04:00) Caracas, La Paz</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Currency</InputLabel>
//                 <Select
//                   label='Currency'
//                   value={formData.currency}
//                   onChange={e => handleFormChange('currency', e.target.value)}
//                 >
//                   <MenuItem value='usd'>USD</MenuItem>
//                   <MenuItem value='euro'>EUR</MenuItem>
//                   <MenuItem value='pound'>Pound</MenuItem>
//                   <MenuItem value='bitcoin'>Bitcoin</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} className='flex gap-4 flex-wrap'>
//               <Button variant='contained' type='submit'>
//                 Save Changes
//               </Button>
//               <Button variant='outlined' type='reset' color='secondary' onClick={() => setFormData(initialData)}>
//                 Reset
//               </Button>
//             </Grid>
//           </Grid>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }

// export default AccountDetails
