'use client'

import React from 'react'
import { Typography, Grid, Card } from '@mui/material'

const Dashboard: React.FC = () => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant='h4'>Dashboard</Typography>
      </Grid>
      {/* Add dashboard components/cards here */}
    </Grid>
  )
}

export default Dashboard
