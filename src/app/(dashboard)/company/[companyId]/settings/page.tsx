'use client'

import React from 'react'
import { Typography, Grid, Card } from '@mui/material'

const Settings: React.FC = () => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant='h4'>Settings</Typography>
      </Grid>
      {/* Add settings components/forms here */}
    </Grid>
  )
}

export default Settings
