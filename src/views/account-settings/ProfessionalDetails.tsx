// src/components/account-settings/ProfessionalDetails.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Grid, TextField, Typography, Button, CircularProgress, Card, Alert, Tooltip } from '@mui/material'
import { Autocomplete } from '@mui/material'
import { useDebounce } from 'use-debounce'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
import * as Yup from 'yup'

// Define the validation schema using Yup
const ProfessionalDetailsSchema = Yup.object().shape({
  skills: Yup.array()
    .of(
      Yup.object().shape({
        _id: Yup.string().required(),
        skill_name: Yup.string().required('Skill name is required')
      })
    )
    .min(1, 'At least one skill is required'),
  languages: Yup.array().of(Yup.string()).min(1, 'At least one language is required')
})

// Define the Skill type
type Skill = {
  _id: string
  skill_name: string
}

const languageOptions = ['English', 'Arabic', 'French', 'German', 'Portuguese']

const ProfessionalDetails: React.FC = () => {
  const { data: session, status } = useSession()
  const [skills, setSkills] = useState<(Skill | string)[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [skillOptions, setSkillOptions] = useState<Skill[]>([])
  const [skillInputValue, setSkillInputValue] = useState<string>('')
  const [debouncedSkillInputValue] = useDebounce(skillInputValue, 500)
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false)
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

    const fetchProfessionalDetails = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property
        setSkills(data.skills || [])
        setLanguages(data.languages || [])
        setLoadingSkills(false)
      } catch (err: any) {
        console.error('Error fetching professional details:', err)
        setError('Failed to load professional details')
        setLoadingSkills(false)
      }
    }

    fetchProfessionalDetails()
  }, [session, status])

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

    if (debouncedSkillInputValue !== '') {
      fetchSkills()
    } else {
      setSkillOptions([])
    }
  }, [debouncedSkillInputValue])

  // Handle skills change
  const handleSkillsChange = async (event: any, newValue: (Skill | string)[]) => {
    // Check if the last entered value is a new skill (string)
    const lastValue = newValue[newValue.length - 1]
    if (typeof lastValue === 'string') {
      try {
        // Create new skill via API
        const response = await axios.post('/api/skills', { skill_name: lastValue })
        const newSkill: Skill = response.data
        setSkills([...newValue.slice(0, -1), newSkill])
      } catch (err: any) {
        console.error('Error creating new skill:', err)
        setError('Failed to add new skill')
        // Optionally, remove the last invalid entry
        setSkills(newValue.slice(0, -1))
      }
    } else {
      setSkills(newValue)
    }
  }

  // Handle languages change
  const handleLanguagesChange = (event: any, newValue: string[]) => {
    setLanguages(newValue)
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate the form data
      await ProfessionalDetailsSchema.validate({ skills, languages }, { abortEarly: false })

      const dataToSubmit = {
        skills: skills.map(skill => (typeof skill === 'string' ? skill : skill._id)),
        languages: languages
      }

      await axios.put('/api/user/update', dataToSubmit)
      setSuccess('Professional details updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else {
        console.error('Error updating professional details:', err)
        setError('Failed to update professional details')
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
    const fetchProfessionalDetails = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user

        setSkills(data.skills || [])
        setLanguages(data.languages || [])
      } catch (err: any) {
        console.error('Error refetching professional details:', err)
        setError('Failed to refetch professional details')
      }
    }

    fetchProfessionalDetails()
  }

  if (status === 'loading') return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Professional Details
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Providing your professional details helps employers understand your expertise and qualifications. Ensure your
        skills and languages are up-to-date to receive relevant job opportunities.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {/* Skills */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              options={skillOptions}
              getOptionLabel={option => (typeof option === 'string' ? option : option.skill_name)}
              value={skills}
              onChange={handleSkillsChange}
              inputValue={skillInputValue}
              onInputChange={(event, newInputValue) => setSkillInputValue(newInputValue)}
              filterSelectedOptions
              loading={loadingSkills}
              freeSolo
              readOnly={!isEditing}
              renderInput={params => (
                <TextField
                  {...params}
                  label='Skills'
                  placeholder='Add skill'
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
          {/* Languages */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              options={languageOptions}
              getOptionLabel={option => option}
              value={languages}
              onChange={handleLanguagesChange}
              filterSelectedOptions
              readOnly={!isEditing}
              renderInput={params => <TextField {...params} label='Languages' placeholder='Add language' />}
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
              <Tooltip title='Edit Professional Details'>
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

export default ProfessionalDetails
