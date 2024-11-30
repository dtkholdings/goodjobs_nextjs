// src/components/SkillsSection.tsx

import React from 'react'
import { Box, Typography, IconButton, Collapse, Grid, LinearProgress } from '@mui/material'
import { StyledPaper } from '@/styles/StyledComponents'

interface Skill {
  name: string
  level: number
}

interface SkillsSectionProps {
  skills: Skill[]
  expanded: boolean
  onToggle: () => void
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, expanded, onToggle }) => {
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
          <i className='ri-bar-chart-line' style={{ marginRight: '8px' }} />
          Skills
        </Typography>
        <IconButton onClick={onToggle} aria-label='Toggle skills section'>
          {expanded ? <i className='ri-arrow-up-s-line' /> : <i className='ri-arrow-down-s-line' />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Grid container spacing={2}>
          {skills.map((skill, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1
                  }}
                >
                  <Typography variant='body1'>{skill.name}</Typography>
                  <Typography variant='body2'>{skill.level}%</Typography>
                </Box>
                <LinearProgress variant='determinate' value={skill.level} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </StyledPaper>
  )
}

export default SkillsSection
