// src/app/(dashboard)/company/[companyId]/subscription/return/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Container, Typography, CircularProgress, Alert, Button } from '@mui/material'

const PayHereReturn = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  useEffect(() => {
    const handlePayment = async () => {
      try {
        const orderId = searchParams.get('order_id')

        if (!orderId) {
          setError('No order ID provided.')
          setLoading(false)
          return
        }

        // Optionally, fetch order status from your backend to confirm payment
        const response = await axios.get(`/api/orders/${orderId}`)

        if (response.data.status === 'completed') {
          setSuccess(true)
        } else {
          setError('Payment not completed.')
        }

        setLoading(false)
      } catch (err: any) {
        console.error('Error verifying payment:', err)
        setError('Failed to verify payment.')
        setLoading(false)
      }
    }

    handlePayment()
  }, [searchParams])

  const handleGoHome = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography variant='h6' sx={{ mt: 2 }}>
          Verifying your payment...
        </Typography>
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 10 }}>
      {success ? (
        <Alert severity='success'>
          <Typography variant='h5'>Payment Successful!</Typography>
          <Typography>Your subscription has been activated.</Typography>
        </Alert>
      ) : (
        <Alert severity='error'>
          <Typography variant='h5'>Payment Failed</Typography>
          <Typography>There was an issue processing your payment. Please try again.</Typography>
        </Alert>
      )}
      <Button variant='contained' color='primary' sx={{ mt: 4 }} onClick={handleGoHome}>
        Go to Home
      </Button>
    </Container>
  )
}

export default PayHereReturn
