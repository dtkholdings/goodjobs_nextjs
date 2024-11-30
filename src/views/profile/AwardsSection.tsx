// src/components/AwardsSection.tsx

import React from 'react'
import { Box, Typography, IconButton, Collapse, Card, CardContent, CardMedia } from '@mui/material'
import { StyledPaper, ScrollableCards } from '@/styles/StyledComponents'

interface Award {
  title: string
  organization: string
  description: string
  image: string
}

interface AwardsSectionProps {
  awards: Award[]
  expanded: boolean
  onToggle: () => void
}

const AwardsSection: React.FC<AwardsSectionProps> = ({ awards, expanded, onToggle }) => {
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
          <i className='ri-trophy-fill' style={{ marginRight: '8px' }} />
          Awards
        </Typography>
        <IconButton onClick={onToggle} aria-label='Toggle awards section'>
          {expanded ? <i className='ri-arrow-up-s-line' /> : <i className='ri-arrow-down-s-line' />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <ScrollableCards>
          {awards.map((award, index) => (
            <Card key={index} sx={{ minWidth: 300, maxWidth: 345 }}>
              <CardMedia component='img' height='140' image={award.image} alt={award.title} />
              <CardContent>
                <Typography gutterBottom variant='h6' component='div'>
                  {award.title}
                </Typography>
                <Typography variant='subtitle2' color='text.secondary'>
                  {award.organization}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {award.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </ScrollableCards>
      </Collapse>
    </StyledPaper>
  )
}

export default AwardsSection
