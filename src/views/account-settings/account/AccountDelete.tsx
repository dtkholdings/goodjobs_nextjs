// src/views/account-settings/account/AccountDelete.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import axios from 'axios'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const AccountDelete = () => {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const router = useRouter()

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsConfirmed(event.target.checked)
  }

  const handleDeleteAccount = async () => {
    if (isConfirmed) {
      try {
        // Call the API to delete the account
        await axios.delete('/api/user/delete')
        // Redirect to the homepage or login page after deletion
        router.push('/login')
      } catch (error) {
        console.error('Error deleting account:', error)
        // Handle error (e.g., show a notification)
      }
    }
  }

  return (
    <Card>
      <CardHeader title='Delete Account' />
      <CardContent className='flex flex-col items-start gap-6'>
        <FormControlLabel
          control={<Checkbox checked={isConfirmed} onChange={handleCheckboxChange} />}
          label='I confirm my account deletion'
        />
        <Button variant='contained' color='error' onClick={handleDeleteAccount} disabled={!isConfirmed}>
          Delete Account
        </Button>
        {!isConfirmed && <Typography color='error'>Please confirm account deletion before proceeding.</Typography>}
      </CardContent>
    </Card>
  )
}

export default AccountDelete
