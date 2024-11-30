// src/components/account-settings/ProjectsSection.tsx

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
  IconButton,
  Autocomplete
} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
import { useDebounce } from 'use-debounce'
import * as Yup from 'yup'

// Define the Skill type
type Skill = {
  _id: string
  skill_name: string
}

// Define the Project type
type Project = {
  project_name: string
  client: string
  start_date: Dayjs | null
  end_date: Dayjs | null
  description: string
  skills_used: (Skill | string)[]
}

// Define the validation schema using Yup
const ProjectSchema = Yup.object().shape({
  projects: Yup.array()
    .of(
      Yup.object().shape({
        project_name: Yup.string().required('Project Name is required'),
        client: Yup.string().required('Client is required'),
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
    .min(1, 'At least one project is required')
})

const ProjectsSection: React.FC = () => {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [skillOptions, setSkillOptions] = useState<Skill[]>([])
  const [skillInputValue, setSkillInputValue] = useState<string>('')
  const [debouncedSkillInputValue] = useDebounce(skillInputValue, 500)
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false)
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

    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property

        setProjects(
          data.projects
            ? data.projects.map((prj: any) => ({
                project_name: prj.project_name || '',
                client: prj.client || '',
                start_date: prj.start_date ? dayjs(prj.start_date) : null,
                end_date: prj.end_date ? dayjs(prj.end_date) : null,
                description: prj.description || '',
                skills_used: prj.skills_used || []
              }))
            : []
        )
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects')
        setLoading(false)
      }
    }

    fetchProjects()
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

  // Handle input changes
  const handleChange = (index: number, field: keyof Project, value: any) => {
    const updatedProjects = [...projects]
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    }
    setProjects(updatedProjects)
  }

  // Handle changes in Skills Used with dynamic skill creation
  const handleSkillsChange = async (index: number, newValue: (Skill | string)[]) => {
    const lastValue = newValue[newValue.length - 1]

    if (typeof lastValue === 'string') {
      try {
        // Create new skill
        const response = await axios.post('/api/skills', { skill_name: lastValue })
        const newSkill: Skill = response.data
        // Replace the string with the new skill object
        const updatedSkills = [...newValue.slice(0, -1), newSkill]
        handleChange(index, 'skills_used', updatedSkills)
      } catch (err) {
        console.error('Error creating new skill:', err)
        setError('Failed to add new skill')
        // Optionally, remove the invalid skill entry
        const updatedSkills = [...newValue.slice(0, -1)]
        handleChange(index, 'skills_used', updatedSkills)
      }
    } else {
      handleChange(index, 'skills_used', newValue)
    }
  }

  // Handle adding a new project entry
  const handleAdd = () => {
    setProjects([
      ...projects,
      {
        project_name: '',
        client: '',
        start_date: null,
        end_date: null,
        description: '',
        skills_used: []
      }
    ])
    setIsEditing(true)
  }

  // Handle removing a project entry
  const handleRemove = (index: number) => {
    const updatedProjects = [...projects]
    updatedProjects.splice(index, 1)
    setProjects(updatedProjects)
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // Validate the form data
      await ProjectSchema.validate({ projects }, { abortEarly: false })

      const dataToSubmit = {
        projects: projects.map(prj => ({
          project_name: prj.project_name,
          client: prj.client,
          start_date: prj.start_date ? prj.start_date.toISOString() : null,
          end_date: prj.end_date ? prj.end_date.toISOString() : null,
          description: prj.description || null,
          skills_used: prj.skills_used.map(skill => (typeof skill === 'string' ? skill : skill._id))
        }))
      }

      await axios.put('/api/user/update', dataToSubmit)
      setSuccess('Projects updated successfully')
      setIsEditing(false)

      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Collect all validation errors
        const validationErrors = err.inner.map((error: any) => error.message).join(', ')
        setError(validationErrors)
      } else {
        console.error('Error updating projects:', err)
        setError('Failed to update projects')
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
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user

        setProjects(
          data.projects
            ? data.projects.map((prj: any) => ({
                project_name: prj.project_name || '',
                client: prj.client || '',
                start_date: prj.start_date ? dayjs(prj.start_date) : null,
                end_date: prj.end_date ? dayjs(prj.end_date) : null,
                description: prj.description || '',
                skills_used: prj.skills_used || []
              }))
            : []
        )
      } catch (err: any) {
        console.error('Error refetching projects:', err)
        setError('Failed to refetch projects')
      }
    }

    fetchProjects()
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Projects
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Providing your project details helps employers understand your practical experience and expertise. Ensure your
        project information is accurate to receive relevant job opportunities.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems='center'>
          {projects.map((prj, index) => (
            <Card
              key={index}
              variant='outlined'
              sx={{ padding: 2, marginBottom: 2, width: '100%', position: 'relative' }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  {/* Project Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Project Name'
                      value={prj.project_name}
                      onChange={e => handleChange(index, 'project_name', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Project Name') && isEditing)}
                      helperText={
                        isEditing && error && error.includes('Project Name') ? 'Project Name is required' : ''
                      }
                    />
                  </Grid>
                  {/* Client */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Client'
                      value={prj.client}
                      onChange={e => handleChange(index, 'client', e.target.value)}
                      required
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      error={Boolean(error && error.includes('Client') && isEditing)}
                      helperText={isEditing && error && error.includes('Client') ? 'Client is required' : ''}
                    />
                  </Grid>
                  {/* Start Date */}
                  <Grid item xs={12} sm={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Start Date'
                        value={prj.start_date}
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
                        value={prj.end_date}
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
                  {/* Skills Used */}
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={skillOptions}
                      getOptionLabel={option => (typeof option === 'string' ? option : option.skill_name)}
                      value={prj.skills_used}
                      onChange={(event, newValue) => handleSkillsChange(index, newValue)}
                      inputValue={skillInputValue}
                      onInputChange={(event, newInputValue) => setSkillInputValue(newInputValue)}
                      filterSelectedOptions
                      loading={loadingSkills}
                      freeSolo
                      renderInput={params => (
                        <TextField
                          {...params}
                          label='Skills Used'
                          placeholder='Add skill'
                          InputProps={{
                            ...params.InputProps,
                            readOnly: !isEditing,
                            endAdornment: (
                              <>
                                {loadingSkills ? <CircularProgress color='inherit' size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                          error={Boolean(error && error.includes('Skills Used') && isEditing)}
                          helperText={
                            isEditing && error && error.includes('Skills Used')
                              ? 'Please select at least one skill'
                              : ''
                          }
                        />
                      )}
                    />
                  </Grid>
                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Description'
                      multiline
                      rows={3}
                      value={prj.description}
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
                      <Tooltip title='Remove Project Entry'>
                        <IconButton color='error' onClick={() => handleRemove(index)} aria-label='Remove Project Entry'>
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
              <Tooltip title='Add Project Entry'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleAdd}
                  startIcon={<i className='ri-add-line' />}
                >
                  Add Project
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
              <Tooltip title='Edit Projects'>
                <Button
                  variant='outlined'
                  color='secondary'
                  startIcon={<i className='ri-edit-2-line' />}
                  onClick={() => setIsEditing(true)}
                  disabled={saving}
                  aria-label='Edit Projects'
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
                    aria-label='Save Projects'
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
                    aria-label='Cancel Editing Projects'
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

export default ProjectsSection

// // src/components/account-settings/ProjectsSection.tsx

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Grid, TextField, Typography, Button, Card, CardContent, CircularProgress, Autocomplete } from '@mui/material'
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
// import dayjs, { Dayjs } from 'dayjs'
// import axios from 'axios'
// import { useSession, signIn } from 'next-auth/react'
// import { useDebounce } from 'use-debounce'

// type Skill = {
//   _id: string
//   skill_name: string
// }

// type Project = {
//   project_name: string
//   client: string
//   start_date: Dayjs | null
//   end_date: Dayjs | null
//   description: string
//   skills_used: (Skill | string)[]
// }

// const ProjectsSection: React.FC = () => {
//   const { data: session, status } = useSession()
//   const [projects, setProjects] = useState<Project[]>([])
//   const [skillOptions, setSkillOptions] = useState<Skill[]>([])
//   const [skillInputValue, setSkillInputValue] = useState<string>('')
//   const [debouncedSkillInputValue] = useDebounce(skillInputValue, 500)
//   const [loadingSkills, setLoadingSkills] = useState<boolean>(false)
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

//     const fetchProjects = async () => {
//       try {
//         const response = await axios.get('/api/user/me')
//         const data = response.data
//         setProjects(
//           data.projects
//             ? data.projects.map((prj: any) => ({
//                 project_name: prj.project_name || '',
//                 client: prj.client || '',
//                 start_date: prj.start_date ? dayjs(prj.start_date) : null,
//                 end_date: prj.end_date ? dayjs(prj.end_date) : null,
//                 description: prj.description || '',
//                 skills_used: prj.skills_used || []
//               }))
//             : []
//         )
//         setLoading(false)
//       } catch (err) {
//         console.error('Error fetching projects:', err)
//         setError('Failed to load projects')
//         setLoading(false)
//       }
//     }

//     fetchProjects()
//   }, [session, status])

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

//     if (debouncedSkillInputValue !== '') {
//       fetchSkills()
//     } else {
//       setSkillOptions([])
//     }
//   }, [debouncedSkillInputValue])

//   const handleChange = (index: number, field: keyof Project, value: any) => {
//     const updatedProjects = [...projects]
//     updatedProjects[index] = {
//       ...updatedProjects[index],
//       [field]: value
//     }
//     setProjects(updatedProjects)
//   }

//   const handleSkillsChange = async (index: number, newValue: (Skill | string)[]) => {
//     const lastValue = newValue[newValue.length - 1]

//     if (typeof lastValue === 'string') {
//       try {
//         // Create new skill
//         const response = await axios.post('/api/skills', { skill_name: lastValue })
//         const newSkill: Skill = response.data
//         // Replace the string with the new skill object
//         const updatedSkills = [...newValue.slice(0, -1), newSkill]
//         handleChange(index, 'skills_used', updatedSkills)
//       } catch (err) {
//         console.error('Error creating new skill:', err)
//         setError('Failed to add new skill')
//       }
//     } else {
//       handleChange(index, 'skills_used', newValue)
//     }
//   }

//   const handleAdd = () => {
//     setProjects([
//       ...projects,
//       {
//         project_name: '',
//         client: '',
//         start_date: null,
//         end_date: null,
//         description: '',
//         skills_used: []
//       }
//     ])
//   }

//   const handleRemove = (index: number) => {
//     const updatedProjects = [...projects]
//     updatedProjects.splice(index, 1)
//     setProjects(updatedProjects)
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setSaving(true)
//     setError(null)
//     setSuccess(null)
//     try {
//       const dataToSubmit = {
//         projects: projects.map(prj => ({
//           project_name: prj.project_name,
//           client: prj.client,
//           start_date: prj.start_date ? prj.start_date.toISOString() : null,
//           end_date: prj.end_date ? prj.end_date.toISOString() : null,
//           description: prj.description,
//           skills_used: prj.skills_used.map(skill => (typeof skill === 'string' ? skill : skill._id))
//         }))
//       }
//       await axios.put('/api/user/update', dataToSubmit)
//       setSuccess('Projects updated successfully')
//     } catch (err) {
//       console.error('Error updating projects:', err)
//       setError('Failed to update projects')
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (loading) return <CircularProgress />

//   return (
//     <Card variant='outlined' sx={{ padding: 2, marginBottom: 4 }}>
//       <Typography variant='h6' gutterBottom>
//         Projects
//       </Typography>
//       <form onSubmit={handleSubmit}>
//         <Grid container spacing={2}>
//           {projects.map((prj, index) => (
//             <Card key={index} variant='outlined' sx={{ padding: 2, marginBottom: 2, width: '100%' }}>
//               <CardContent>
//                 <Grid container spacing={2}>
//                   {/* Project Name */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Project Name'
//                       value={prj.project_name}
//                       onChange={e => handleChange(index, 'project_name', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Client */}
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       label='Client'
//                       value={prj.client}
//                       onChange={e => handleChange(index, 'client', e.target.value)}
//                       required
//                     />
//                   </Grid>
//                   {/* Start Date */}
//                   <Grid item xs={12} sm={3}>
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DatePicker
//                         label='Start Date'
//                         value={prj.start_date}
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
//                         value={prj.end_date}
//                         onChange={(date: Dayjs | null) => handleChange(index, 'end_date', date)}
//                         slotProps={{
//                           textField: {
//                             fullWidth: true
//                           }
//                         }}
//                       />
//                     </LocalizationProvider>
//                   </Grid>
//                   {/* Skills Used */}
//                   <Grid item xs={12}>
//                     <Autocomplete
//                       multiple
//                       options={skillOptions}
//                       getOptionLabel={option => (typeof option === 'string' ? option : option.skill_name)}
//                       value={prj.skills_used}
//                       onChange={(event, newValue) => handleSkillsChange(index, newValue)}
//                       inputValue={skillInputValue}
//                       onInputChange={(event, newInputValue) => setSkillInputValue(newInputValue)}
//                       filterSelectedOptions
//                       loading={loadingSkills}
//                       freeSolo
//                       renderInput={params => (
//                         <TextField
//                           {...params}
//                           label='Skills Used'
//                           placeholder='Add skill'
//                           InputProps={{
//                             ...params.InputProps,
//                             endAdornment: (
//                               <>
//                                 {loadingSkills ? <CircularProgress color='inherit' size={20} /> : null}
//                                 {params.InputProps.endAdornment}
//                               </>
//                             )
//                           }}
//                         />
//                       )}
//                     />
//                   </Grid>
//                   {/* Description */}
//                   <Grid item xs={12}>
//                     <TextField
//                       fullWidth
//                       label='Description'
//                       multiline
//                       rows={3}
//                       value={prj.description}
//                       onChange={e => handleChange(index, 'description', e.target.value)}
//                     />
//                   </Grid>
//                   {/* Remove Button */}
//                   <Grid item xs={12}>
//                     <Button variant='outlined' color='error' onClick={() => handleRemove(index)}>
//                       Remove Project
//                     </Button>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           ))}
//           {/* Add Button */}
//           <Grid item xs={12}>
//             <Button variant='contained' onClick={handleAdd}>
//               Add Project
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

// export default ProjectsSection
