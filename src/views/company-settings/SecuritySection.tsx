// src/views/account-settings/SecuritySection.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Card,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'

type TwoFactorAuth = {
  enabled: boolean
  method: 'email' | 'authenticator' | ''
}

const twoFactorMethods: Array<TwoFactorAuth['method']> = ['email', 'authenticator']

const SecuritySection: React.FC = () => {
  const { data: session, status } = useSession()
  const [twoFactorAuth, setTwoFactorAuth] = useState<TwoFactorAuth>({
    enabled: false,
    method: ''
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // Modal States
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false)
  const [authenticatorModalOpen, setAuthenticatorModalOpen] = useState<boolean>(false)
  const [authenticatorSetup, setAuthenticatorSetup] = useState<{ qrCode: string; secret: string } | null>(null)
  const [otpInput, setOtpInput] = useState<string>('')
  const [authenticatorToken, setAuthenticatorToken] = useState<string>('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      signIn()
      return
    }

    const fetchSecuritySettings = async () => {
      try {
        const response = await axios.get('/api/user/me')
        const data = response.data.user // Access the 'user' property
        setTwoFactorAuth({
          enabled: data.twoFactorEnabled,
          method: data.twoFactorMethod
        })
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching security settings:', err)
        setError('Failed to load security settings')
        setLoading(false)
      }
    }

    fetchSecuritySettings()
  }, [session, status])

  const handleToggle = async (checked: boolean) => {
    setTwoFactorAuth(prev => ({ ...prev, enabled: checked }))

    if (checked) {
      // If enabling 2FA, prompt to select method
      setIsEditing(true)
    } else {
      // If disabling 2FA, confirm the action
      setIsEditing(false)
      try {
        setSaving(true)
        await axios.put('/api/user/update', { twoFactorAuth: { enabled: false, method: '' } })
        setSuccess('Two-Factor Authentication has been disabled.')
      } catch (err: any) {
        console.error('Error disabling 2FA:', err)
        setError('Failed to disable Two-Factor Authentication.')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleMethodChange = (value: 'email' | 'authenticator') => {
    setTwoFactorAuth(prev => ({ ...prev, method: value }))
  }

  const handleSaveSettings = async () => {
    if (!twoFactorAuth.enabled || !twoFactorAuth.method) {
      setError('Please select a Two-Factor Authentication method.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (twoFactorAuth.method === 'email') {
        // Send OTP to email
        await axios.post('/api/auth/2fa/email/send-otp')
        setOtpModalOpen(true)
      } else if (twoFactorAuth.method === 'authenticator') {
        // Fetch Authenticator setup data
        const response = await axios.get('/api/auth/2fa/authenticator/setup')
        setAuthenticatorSetup({
          qrCode: response.data.qr_code,
          secret: response.data.secret
        })
        setAuthenticatorModalOpen(true)
      }
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error saving 2FA settings:', err)
      setError('Failed to save Two-Factor Authentication settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpInput) {
      setError('Please enter the OTP sent to your email.')
      return
    }

    if (otpInput.length !== 6 || !/^\d{6}$/.test(otpInput)) {
      setError('OTP must be a 6-digit number.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await axios.post('/api/auth/2fa/email/verify-otp', { otp: otpInput })
      setSuccess('Two-Factor Authentication via Email has been enabled.')
      setOtpModalOpen(false)
    } catch (err: any) {
      console.error('Error verifying OTP:', err)
      setError(err.response?.data?.error || 'Failed to verify OTP.')
    } finally {
      setSaving(false)
      setOtpInput('')
    }
  }

  const handleVerifyAuthenticator = async () => {
    if (!authenticatorToken) {
      setError('Please enter the token from your Authenticator App.')
      return
    }

    if (authenticatorToken.length !== 6 || !/^\d{6}$/.test(authenticatorToken)) {
      setError('Authenticator token must be a 6-digit number.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await axios.post('/api/auth/2fa/authenticator/verify', { token: authenticatorToken })
      setSuccess('Two-Factor Authentication via Authenticator App has been enabled.')
      setAuthenticatorModalOpen(false)
      setAuthenticatorSetup(null)
    } catch (err: any) {
      console.error('Error verifying Authenticator token:', err)
      setError(err.response?.data?.error || 'Failed to verify Authenticator token.')
    } finally {
      setSaving(false)
      setAuthenticatorToken('')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setTwoFactorAuth(prev => ({ ...prev, enabled: false, method: '' }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (twoFactorAuth.enabled) {
        if (twoFactorAuth.method === 'email') {
          // Trigger sending OTP
          await axios.post('/api/auth/2fa/email/send-otp') // Corrected endpoint
          setOtpModalOpen(true)
        } else if (twoFactorAuth.method === 'authenticator') {
          // Trigger Authenticator setup
          const response = await axios.get('/api/auth/2fa/authenticator/setup') // Corrected endpoint
          setAuthenticatorSetup({
            qrCode: response.data.qr_code,
            secret: response.data.secret
          })
          setAuthenticatorModalOpen(true)
        }
        setIsEditing(false)
      } else {
        // Disable 2FA
        await axios.put('/api/user/update', { twoFactorAuth: { enabled: false, method: '' } })
        setSuccess('Two-Factor Authentication has been disabled.')
      }
    } catch (err: any) {
      console.error('Error saving 2FA settings:', err)
      setError('Failed to save Two-Factor Authentication settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Card variant='outlined' sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant='h6' gutterBottom>
        Security
      </Typography>
      {/* Section Description */}
      <Typography variant='body2' color='textSecondary' gutterBottom>
        Enhance the security of your account by enabling Two-Factor Authentication (2FA). You can choose to receive a
        One-Time Password (OTP) via Email or use an Authenticator App for added security.
      </Typography>
      <Grid container spacing={2} alignItems='center'>
        {/* Two-Factor Authentication Toggle */}
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch checked={twoFactorAuth.enabled} onChange={e => handleToggle(e.target.checked)} color='primary' />
            }
            label='Enable Two-Factor Authentication'
          />
        </Grid>
        {/* Two-Factor Authentication Method Selection */}
        {isEditing && twoFactorAuth.enabled && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Method</InputLabel>
              <Select
                label='Method'
                value={twoFactorAuth.method}
                onChange={e => handleMethodChange(e.target.value as 'email' | 'authenticator')}
              >
                <MenuItem value='email'>Email</MenuItem>
                {/* <MenuItem value='authenticator'>Authenticator App</MenuItem> */}
              </Select>
            </FormControl>
          </Grid>
        )}
        {/* Action Buttons */}
        {isEditing && twoFactorAuth.enabled && (
          <Grid item xs={12}>
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity='success' sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            <Grid container spacing={1}>
              <Grid item>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSaveSettings}
                  disabled={saving || !twoFactorAuth.method}
                >
                  {saving ? 'Processing...' : 'Proceed'}
                </Button>
              </Grid>
              <Grid item>
                <Button variant='outlined' color='secondary' onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
        {/* Save Button (when not editing) */}
        {!isEditing && (
          <Grid item xs={12}>
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity='success' sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            {twoFactorAuth.enabled && (
              <Button
                variant='contained'
                color='primary'
                onClick={handleSubmit}
                disabled={saving || (twoFactorAuth.enabled && !twoFactorAuth.method)}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </Grid>
        )}
      </Grid>

      {/* Email OTP Verification Modal */}
      <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)}>
        <DialogTitle>Verify OTP</DialogTitle>
        <DialogContent>
          <Typography>
            An OTP has been sent to your email. Please enter it below to enable Two-Factor Authentication via Email.
          </Typography>
          <TextField
            autoFocus
            margin='dense'
            label='One-Time Password (OTP)'
            type='text'
            fullWidth
            variant='standard'
            value={otpInput}
            onChange={e => setOtpInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleVerifyOtp} disabled={saving}>
            {saving ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Authenticator App Setup Modal */}
      {/* <Dialog open={authenticatorModalOpen} onClose={() => setAuthenticatorModalOpen(false)}>
        <DialogTitle>Setup Authenticator App</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Scan the QR code below with your preferred Authenticator App (e.g., Google Authenticator, Microsoft
            Authenticator, Apple Authenticator).
          </Typography>
          {authenticatorSetup?.qrCode && (
            <img
              src={authenticatorSetup.qrCode}
              alt='Authenticator QR Code'
              style={{ width: '100%', maxWidth: '300px' }}
            />
          )}
          <Typography variant='body2' gutterBottom>
            Alternatively, you can enter this secret key manually: <strong>{authenticatorSetup?.secret}</strong>
          </Typography>
          <TextField
            margin='dense'
            label='Authenticator Code'
            type='text'
            fullWidth
            variant='standard'
            value={authenticatorToken}
            onChange={e => setAuthenticatorToken(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthenticatorModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleVerifyAuthenticator} disabled={saving}>
            {saving ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog> */}
    </Card>
  )
}

export default SecuritySection
