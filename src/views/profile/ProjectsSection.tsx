// src/components/ProjectsSection.tsx

import React from 'react'
import { Box, Typography, IconButton, Collapse, Card, CardContent, CardMedia } from '@mui/material'
import { ScrollableCards, StyledPaper } from '@/styles/StyledComponents'

interface Project {
  title: string
  description: string
  image: string
}

interface ProjectsSectionProps {
  projects: Project[]
  expanded: boolean
  onToggle: () => void
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, expanded, onToggle }) => {
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
          <i className='ri-folder-3-fill' style={{ marginRight: '8px' }} />
          Projects
        </Typography>
        <IconButton onClick={onToggle} aria-label='Toggle projects section'>
          {expanded ? <i className='ri-arrow-up-s-line' /> : <i className='ri-arrow-down-s-line' />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <ScrollableCards>
          {projects.map((project, index) => (
            <Card key={index} sx={{ minWidth: 300, maxWidth: 345 }}>
              <CardMedia component='img' height='140' image={project.image} alt={project.title} />
              <CardContent>
                <Typography gutterBottom variant='h6' component='div'>
                  {project.title}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {project.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </ScrollableCards>
      </Collapse>
    </StyledPaper>
  )
}

export default ProjectsSection
