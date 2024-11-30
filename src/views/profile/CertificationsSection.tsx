// src/components/CertificationsSection.tsx

import React from 'react'
import { Box, Typography, IconButton, Collapse, Card, CardContent, CardMedia } from '@mui/material'
import { StyledPaper, ScrollableCards } from '@/styles/StyledComponents'

interface Certification {
  title: string
  issuer: string
  date: string
  image: string
}

interface CertificationsSectionProps {
  certifications: Certification[]
  expanded: boolean
  onToggle: () => void
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications, expanded, onToggle }) => {
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
          <i className='ri-medal-fill' style={{ marginRight: '8px' }} />
          Certifications
        </Typography>
        <IconButton onClick={onToggle} aria-label='Toggle certifications section'>
          {expanded ? <i className='ri-arrow-up-s-line' /> : <i className='ri-arrow-down-s-line' />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <ScrollableCards>
          {certifications.map((cert, index) => (
            <Card key={index} sx={{ minWidth: 300, maxWidth: 345 }}>
              <CardMedia component='img' height='140' image={cert.image} alt={cert.title} />
              <CardContent>
                <Typography gutterBottom variant='h6' component='div'>
                  {cert.title}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {cert.issuer} - {cert.date}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </ScrollableCards>
      </Collapse>
    </StyledPaper>
  )
}

export default CertificationsSection
