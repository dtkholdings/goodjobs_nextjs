// src/components/ProfileHeader.tsx

import React from 'react'
import { Box, Grid, Avatar, Typography, IconButton, Button, Tooltip } from '@mui/material'
import { StyledPaper } from '@/styles/StyledComponents'

interface ContactInfo {
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
}

interface ProfileHeaderProps {
  name: string
  title: string
  image: string
  contact: ContactInfo
  onDownload: () => void
  onPrint: () => void
  onEdit: () => void
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, title, image, contact, onDownload, onPrint, onEdit }) => {
  return (
    <StyledPaper elevation={3}>
      <Grid container spacing={3} alignItems='center'>
        <Grid item xs={12} md={3}>
          <Avatar src={image} alt={name} sx={{ width: 200, height: 200, mx: 'auto' }} />
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant='h4' component='h1' gutterBottom>
            {name}
          </Typography>
          <Typography variant='h6' color='primary' gutterBottom>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Tooltip title='Email'>
              <IconButton aria-label='email' size='small' href={`mailto:${contact.email}`}>
                <i className='ri-mail-fill' />
              </IconButton>
            </Tooltip>
            <Typography variant='body2' sx={{ mt: 2 }}>
              {contact.email}
            </Typography>

            <Tooltip title='Phone'>
              <IconButton aria-label='phone' size='small' href={`tel:${contact.phone}`}>
                <i className='ri-phone-fill' />
              </IconButton>
            </Tooltip>
            <Typography variant='body2' sx={{ mt: 2 }}>
              {contact.phone}
            </Typography>

            <Tooltip title='Location'>
              <IconButton aria-label='location' size='small'>
                <i className='ri-map-pin-fill' />
              </IconButton>
            </Tooltip>
            <Typography variant='body2' sx={{ mt: 2 }}>
              {contact.location}
            </Typography>

            <Tooltip title='LinkedIn'>
              <IconButton
                aria-label='linkedin'
                size='small'
                href={`https://${contact.linkedin}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <i className='ri-linkedin-fill' />
              </IconButton>
            </Tooltip>

            <Tooltip title='GitHub'>
              <IconButton
                aria-label='github'
                size='small'
                href={`https://${contact.github}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <i className='ri-github-fill' />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant='contained'
              startIcon={<i className='ri-edit-box-fill' />}
              aria-label='Edit Profile'
              onClick={onEdit}
            >
              Edit Profile
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='ri-phone-fill' />}
              aria-label='Edit Profile'
              onClick={onEdit}
            >
              Contact
            </Button>
            <Button
              variant='outlined'
              startIcon={<i className='ri-download-2-fill' />}
              onClick={onDownload}
              aria-label='Download PDF'
            >
              Download PDF
            </Button>
            <Button
              variant='outlined'
              startIcon={<i className='ri-printer-fill' />}
              onClick={onPrint}
              aria-label='Print Profile'
            >
              Print
            </Button>
          </Box>
        </Grid>
      </Grid>
    </StyledPaper>
  )
}

export default ProfileHeader
