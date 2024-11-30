// src/app/(dashboard)/company/[companyId]/subscription/cancel/page.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Typography, Alert, Button } from '@mui/material'

const PayHereCancel = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleRetry = () => {
    // Optionally, you can redirect the user back to the subscription page or payment initiation page
    router.push('/company/[companyId]/subscription') // Update with actual path
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <Container sx={{ mt: 10 }}>
      <Alert severity='warning'>
        <Typography variant='h5'>Payment Canceled</Typography>
        <Typography>Your payment was canceled. If this was a mistake, please try again.</Typography>
      </Alert>
      <Button variant='contained' color='primary' sx={{ mt: 4, mr: 2 }} onClick={handleRetry}>
        Retry Payment
      </Button>
      <Button variant='outlined' color='secondary' sx={{ mt: 4 }} onClick={handleGoHome}>
        Go to Home
      </Button>
    </Container>
  )
}

export default PayHereCancel
