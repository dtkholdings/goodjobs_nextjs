// src/components/WorkExperience.tsx

import React from 'react'
import { Box, Typography, IconButton, Collapse, Grid, Avatar, Chip } from '@mui/material'
import { StyledPaper } from '@/styles/StyledComponents'

interface Role {
  jobTitle: string
  duration: string
  description: string
  skills: string[]
}

interface Experience {
  company: string
  companyLogo: string
  jobType: string
  duration: string
  roles: Role[]
}

interface WorkExperienceProps {
  experience: Experience[]
  expanded: boolean
  onToggle: () => void
}

const WorkExperience: React.FC<WorkExperienceProps> = ({ experience, expanded, onToggle }) => {
  return (
    <StyledPaper elevation={3}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center' }}>
          <i className='ri-briefcase-fill' style={{ marginRight: '8px', fontSize: '1.5rem' }} />
          Work Experience
        </Typography>
        <IconButton onClick={onToggle} aria-label='Toggle experience section'>
          {expanded ? <i className='ri-arrow-up-s-line' /> : <i className='ri-arrow-down-s-line' />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box>
          {experience.map((exp, index) => (
            <Box key={index} sx={{ mb: 6 }}>
              {/* Company Details */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={exp.companyLogo} alt={exp.company} sx={{ width: 50, height: 50, mr: 2 }} />
                <Box>
                  <Typography variant='h6'>{exp.company}</Typography>
                  <Typography variant='subtitle2' color='text.secondary'>
                    {exp.jobType} &bull; {exp.duration}
                  </Typography>
                </Box>
              </Box>

              {/* Roles Timeline */}
              <Box sx={{ borderLeft: '2px solid #e0e0e0', paddingLeft: '25px', marginLeft: '25px' }}>
                {exp.roles.map((role, roleIndex) => (
                  <Box key={roleIndex} sx={{ position: 'relative', mb: 5, ml: 2 }}>
                    {/* Connector Dot */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '-42px',
                        top: '2px',
                        width: '16px',
                        height: '16px',
                        bgcolor: 'primary.main',
                        borderRadius: '50%'
                      }}
                    ></Box>

                    {/* Role Details */}
                    <Typography variant='subtitle1' fontWeight='bold'>
                      {role.jobTitle}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      {role.duration}
                    </Typography>
                    <Typography variant='body1' sx={{ mb: 1 }}>
                      {role.description}
                    </Typography>
                    {/* Skills */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {role.skills.map((skill, skillIndex) => (
                        <Chip key={skillIndex} label={skill} size='small' />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </StyledPaper>
  )
}

export default WorkExperience
