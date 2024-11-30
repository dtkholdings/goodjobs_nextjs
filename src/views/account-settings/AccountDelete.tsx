// src/views/account-settings/account/AccountDelete.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { getSession } from 'next-auth/react'
import axios from 'axios'
import { useSession, signOut } from 'next-auth/react'

// MUI Imports
import CardHeader from '@mui/material/CardHeader'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
const AccountDelete = () => {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const router = useRouter()

  const { data: session, status } = useSession()
  const [open, setOpen] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsConfirmed(event.target.checked)
  }

  const handleClickOpen = () => {
    if (isConfirmed) {
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    setSuccess(null)
    try {
      await axios.delete('/api/user/delete')
      setSuccess('Your account has been deleted successfully.')
      // Sign out the user and redirect to login
      await signOut({ redirect: false })
      router.push('/login')
      // Optionally, redirect the user or sign them out
    } catch (err) {
      console.error('Error deleting account:', err)
      setError('Failed to delete account.')
    } finally {
      setDeleting(false)
      setOpen(false)
    }
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
        <Button variant='contained' color='error' onClick={handleClickOpen}>
          Delete Account{' '}
        </Button>{' '}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Confirm Account Deletion</DialogTitle>{' '}
          <DialogContent>
            {' '}
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot be undone.{' '}
            </DialogContentText>{' '}
          </DialogContent>{' '}
          <DialogActions>
            {' '}
            <Button onClick={handleClose} disabled={deleting}>
              Cancel{' '}
            </Button>{' '}
            <Button onClick={handleDelete} color='error' disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}{' '}
            </Button>{' '}
          </DialogActions>{' '}
        </Dialog>
        {!isConfirmed && <Typography color='error'>Please confirm account deletion before proceeding.</Typography>}
      </CardContent>
    </Card>
  )
}

export default AccountDelete

// // src/components/account-settings/AccountDelete.tsx

// 'use client'

// import React, { useState } from 'react'
// import {
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   CircularProgress
// } from '@mui/material'
// import axios from 'axios'
// import { useSession, signIn } from 'next-auth/react'

// const AccountDelete: React.FC = () => {
//   const { data: session, status } = useSession()
//   const [open, setOpen] = useState<boolean>(false)
//   const [deleting, setDeleting] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)

//   const handleClickOpen = () => {
//     setOpen(true)
//   }

//   const handleClose = () => {
//     setOpen(false)
//   }

//   const handleDelete = async () => {
//     setDeleting(true)
//     setError(null)
//     setSuccess(null)
//     try {
//       await axios.delete('/api/user/delete')
//       setSuccess('Your account has been deleted successfully.')
//       // Optionally, redirect the user or sign them out
//     } catch (err) {
//       console.error('Error deleting account:', err)
//       setError('Failed to delete account.')
//     } finally {
//       setDeleting(false)
//       setOpen(false)
//     }
//   }

//   if (status === 'loading') return <CircularProgress />

//   if (!session) return null

//   return (
//     <Card variant='outlined' sx={{ padding: 2, marginBottom: 4 }}>
//       <CardContent>
//         <Typography variant='h6' gutterBottom color='error'>
//           Delete Account
//         </Typography>
//         <Typography variant='body2' gutterBottom>
//           Once you delete your account, you will lose access to all your data. This action cannot be undone.
//         </Typography>
//         {error && (
//           <Typography color='error' gutterBottom>
//             {error}
//           </Typography>
//         )}
//         {success && (
//           <Typography color='primary' gutterBottom>
//             {success}
//           </Typography>
//         )}
//         <Button variant='contained' color='error' onClick={handleClickOpen}>
//           Delete Account
//         </Button>
//         <Dialog open={open} onClose={handleClose}>
//           <DialogTitle>Confirm Account Deletion</DialogTitle>
//           <DialogContent>
//             <DialogContentText>
//               Are you sure you want to delete your account? This action cannot be undone.
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleClose} disabled={deleting}>
//               Cancel
//             </Button>
//             <Button onClick={handleDelete} color='error' disabled={deleting}>
//               {deleting ? 'Deleting...' : 'Delete'}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </CardContent>
//     </Card>
//   )
// }

// export default AccountDelete
