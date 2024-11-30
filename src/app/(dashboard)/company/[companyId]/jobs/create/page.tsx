'use client'

import React, { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AddJob from '@/components/job/AddJob'
import { useSession } from 'next-auth/react'
import { CircularProgress, Typography, Container } from '@mui/material'

const AddJobPage: React.FC = () => {
  const router = useRouter()
  const params = useParams<{ companyId: string }>()
  const companyId = params?.companyId || ''

  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      // Redirect to sign-in if not authenticated
      router.push('/api/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!session) {
    // Optionally, you can show a placeholder while redirecting
    return (
      <Container>
        <Typography variant='h6' color='error'>
          Redirecting to sign-in...
        </Typography>
      </Container>
    )
  }

  if (!companyId) {
    return (
      <Container>
        <Typography variant='h6' color='error'>
          Company ID is missing.
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth='md' sx={{ mt: 4 }}>
      <AddJob />
    </Container>
  )
}

export default AddJobPage
