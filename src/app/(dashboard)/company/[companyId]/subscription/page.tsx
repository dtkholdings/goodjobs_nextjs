// app/(dashboard)/company/[companyId]/subscription/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Box
} from '@mui/material'

interface Subscription {
  _id: string
  subscription_plan_name: string
  subtitle?: string
  currency: string
  price: number
  included_features: string[]
  not_included_features: string[]
  package_color?: string
  icon?: string
  credits?: number
  ai_credits?: number
}

interface ActiveSubscription {
  subscription: {
    id: string
    planName: string
    subtitle: string
    currency: string
    price: number
    includedFeatures: string[]
    notIncludedFeatures: string[]
    packageColor: string
    icon: string
    credits: number
    aiCredits: number
    subscriptionStatus: string
  }
  remainingCredits: number
  remainingAICredits: number
}

const SubscriptionPage = () => {
  const router = useRouter()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingActive, setLoadingActive] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [payhereLoaded, setPayhereLoaded] = useState<boolean>(false)
  const [errorActive, setErrorActive] = useState<string | null>(null)

  useEffect(() => {
    // Extract companyId from the URL using window.location
    const path = window.location.pathname
    const pathSegments = path.split('/')
    const companyIndex = pathSegments.indexOf('company')
    const companyIdSegment =
      companyIndex !== -1 && pathSegments.length > companyIndex + 1 ? pathSegments[companyIndex + 1] : null
    setCompanyId(companyIdSegment)
  }, [])

  useEffect(() => {
    if (companyId) {
      const fetchSubscriptions = async () => {
        try {
          const response = await axios.get('/api/subscriptions')

          // Debugging: Log the response data
          console.log('Subscriptions API Response:', response.data)

          // Check if the response data is an array
          if (Array.isArray(response.data)) {
            setSubscriptions(response.data)
          } else {
            console.error('API response is not an array:', response.data)
            setError('Unexpected response format from server.')
          }

          setLoading(false)
        } catch (err: any) {
          console.error('Error fetching subscriptions:', err)
          setError(err.response?.data?.message || 'Failed to load subscriptions.')
          setLoading(false)
        }
      }

      // Fetch active subscription
      const fetchActiveSubscription = async () => {
        try {
          const response = await axios.get(`/api/company/${companyId}/subscription`)

          // Debugging: Log the response data
          console.log('Active Subscription API Response:', response.data)

          if (response.data.subscription) {
            setActiveSubscription(response.data)
          } else {
            setActiveSubscription(null)
          }

          setLoadingActive(false)
        } catch (err: any) {
          console.error('Error fetching active subscription:', err)
          setErrorActive(err.response?.data?.message || 'Failed to load active subscription.')
          setLoadingActive(false)
        }
      }

      fetchSubscriptions()
      fetchActiveSubscription()
    }
  }, [companyId])

  const handlePurchase = async (subscriptionId: string) => {
    try {
      const response = await axios.post('/api/orders', {
        subscriptionId,
        companyId
      })

      const { payhereData } = response.data

      // Debugging: Log the payhereData
      console.log('PayHere Data:', payhereData)

      // Prepare the payment object as per PayHere.js documentation
      const payment = {
        sandbox: true, // Set to false in production
        merchant_id: payhereData.merchant_id,
        return_url: payhereData.return_url,
        cancel_url: payhereData.cancel_url,
        notify_url: payhereData.notify_url,

        order_id: payhereData.order_id,
        items: payhereData.items,
        amount: payhereData.amount,
        currency: payhereData.currency,
        hash: payhereData.hash,
        first_name: payhereData.first_name || 'First',
        last_name: payhereData.last_name || 'Last',
        email: payhereData.email || 'email@email.com',
        phone: payhereData.phone || '0778866720',
        address: payhereData.address || '166/B',
        city: payhereData.city || 'Bentota',
        country: payhereData.country || 'Sri Lanka'

        // Add more fields if necessary
      }

      // Initialize PayHere.js with the payment object
      if (typeof window !== 'undefined' && typeof window.payhere !== 'undefined') {
        payhere.startPayment(payment)
      } else {
        console.error('PayHere.js not loaded')
        setError('Payment gateway not available. Please try again later.')
      }
    } catch (err: any) {
      console.error('Error initiating payment:', err)
      setError(err.response?.data?.message || 'Failed to initiate payment.')
    }
  }

  // Event Handlers for PayHere.js
  useEffect(() => {
    if (payhereLoaded && typeof payhere !== 'undefined') {
      // Payment completed. It can be a successful or failed payment.
      payhere.onCompleted = function onCompleted(orderId: string) {
        console.log('Payment completed. OrderID:', orderId)
        // Optionally, fetch order status from the backend to confirm
        router.push('/subscription/return')
      }

      // Payment window closed
      payhere.onDismissed = function onDismissed() {
        console.log('Payment dismissed')
        // Optionally, show a message to the user
      }

      // Error occurred
      payhere.onError = function onError(error: string) {
        console.log('Error:', error)
        setError('Payment error occurred. Please try again.')
      }
    }
  }, [payhereLoaded, router])

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity='error'>{error}</Alert>
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 5 }}>
      {/* Display Active Subscription Details */}
      {activeSubscription ? (
        <Box sx={{ mb: 5 }}>
          <Typography variant='h5' gutterBottom>
            Active Subscription
          </Typography>
          <Card /* sx={{ backgroundColor: activeSubscription.subscription.packageColor || '#f5f5f5' }} */>
            <CardContent>
              <Grid container spacing={2}>
                {activeSubscription.subscription.icon && (
                  <Grid item xs={12} sm={3}>
                    <img src={activeSubscription.subscription.icon} alt='Subscription Icon' style={{ width: '100%' }} />
                  </Grid>
                )}
                <Grid item xs={12} sm={activeSubscription.subscription.icon ? 9 : 12}>
                  <Typography variant='h6'>{activeSubscription.subscription.planName}</Typography>
                  {activeSubscription.subscription.subtitle && (
                    <Typography variant='subtitle1' color='text.secondary'>
                      {activeSubscription.subscription.subtitle}
                    </Typography>
                  )}
                  <Typography variant='h6' color='primary' sx={{ mt: 2 }}>
                    {activeSubscription.subscription.currency} {activeSubscription.subscription.price}
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 2 }}>
                    <strong>Included Features:</strong>
                    <ul>
                      {activeSubscription.subscription.includedFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </Typography>
                  {activeSubscription.subscription.notIncludedFeatures.length > 0 && (
                    <Typography variant='body2' sx={{ mt: 2 }}>
                      <strong>Not Included:</strong>
                      <ul>
                        {activeSubscription.subscription.notIncludedFeatures.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </Typography>
                  )}
                  <Typography variant='body1' sx={{ mt: 2 }}>
                    <strong>Credits:</strong> {activeSubscription.subscription.credits} (
                    {activeSubscription.remainingCredits} Credits Remaining)
                  </Typography>
                  <Typography variant='body1' sx={{ mt: 1 }}>
                    <strong>AI Credits:</strong> {activeSubscription.subscription.aiCredits} (
                    {activeSubscription.remainingAICredits} Credits Remaining)
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box sx={{ mb: 5 }}>
          <Alert severity='info'>You do not have an active subscription.</Alert>
        </Box>
      )}

      {/* Display Available Subscriptions */}

      <Typography variant='h4' gutterBottom>
        Choose Your Subscription Plan
      </Typography>
      <Grid container spacing={4}>
        {subscriptions.map(subscription => (
          <Grid item xs={12} sm={6} md={4} key={subscription._id}>
            <Card>
              <CardContent>
                <Typography variant='h5' component='div'>
                  {subscription.subscription_plan_name}
                </Typography>
                {subscription.subtitle && (
                  <Typography variant='subtitle1' color='text.secondary'>
                    {subscription.subtitle}
                  </Typography>
                )}
                <Typography variant='h6' color='primary' sx={{ mt: 2 }}>
                  {subscription.currency} {subscription.price}
                </Typography>
                <Typography variant='body2' sx={{ mt: 2 }}>
                  <strong>Included Features:</strong>
                  <ul>
                    {subscription.included_features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </Typography>
                {subscription.not_included_features.length > 0 && (
                  <Typography variant='body2' sx={{ mt: 2 }}>
                    <strong>Not Included:</strong>
                    <ul>
                      {subscription.not_included_features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button variant='contained' color='primary' fullWidth onClick={() => handlePurchase(subscription._id)}>
                  Purchase
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default SubscriptionPage
