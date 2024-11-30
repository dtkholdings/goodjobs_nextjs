// src/components/company/index.tsx

'use client'

import React from 'react'
import Grid from '@mui/material/Grid'

// Import Individual Sections
import CompanyOverview from './CompanyOverview'

const Company: React.FC = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CompanyOverview />
      </Grid>
    </Grid>
  )
}

export default Company
