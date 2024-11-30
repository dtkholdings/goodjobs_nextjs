// src/components/ProfessionalSummary.tsx

import React from 'react'
import { Typography } from '@mui/material'
import { StyledPaper } from '@/styles/StyledComponents'

interface ProfessionalSummaryProps {
  summary: string
}

const ProfessionalSummary: React.FC<ProfessionalSummaryProps> = ({ summary }) => {
  return (
    <StyledPaper elevation={3}>
      <Typography variant='h6' gutterBottom>
        <i className='ri-information-fill' style={{ marginRight: '8px' }} />
        Professional Summary
      </Typography>
      <Typography variant='body1'>{summary}</Typography>
    </StyledPaper>
  )
}

export default ProfessionalSummary
