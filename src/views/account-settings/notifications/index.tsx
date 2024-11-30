'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// Types
type NotificationSetting = {
  type: string
  email: boolean
  browser: boolean
  app: boolean
}

const Notifications = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([])
  const [sendTime, setSendTime] = useState('online')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession()
      if (!session) {
        router.push('/login')
      } else {
        try {
          const response = await axios.get('/api/user/notification-settings')
          console.log('Notification settings response:', response.data)
          setNotificationSettings(response.data.settings || [])
          setSendTime(response.data.sendTime || 'online')
        } catch (error) {
          console.error('Error fetching notification settings:', error)
          // Reset to default values on error
          setNotificationSettings([])
          setSendTime('online')
        }
      }
    }
    fetchData()
  }, [router])

  const handleCheckboxChange = (index: number, field: 'email' | 'browser' | 'app') => {
    setNotificationSettings(prev => {
      const newSettings = [...prev]
      newSettings[index][field] = !newSettings[index][field]
      return newSettings
    })
  }

  const handleSaveChanges = async () => {
    try {
      await axios.put('/api/user/notification-settings', {
        settings: notificationSettings,
        sendTime
      })
      // Show success notification
    } catch (error) {
      console.error('Error updating notification settings:', error)
      // Show error notification
    }
  }

  return (
    <Card>
      <CardHeader title='Notification Settings' subheader='Manage your notification preferences' />
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr>
                <th className='p-2 border-b'>Type</th>
                <th className='p-2 border-b'>Email</th>
                <th className='p-2 border-b'>Browser</th>
                <th className='p-2 border-b'>App</th>
              </tr>
            </thead>
            <tbody>
              {notificationSettings.map((setting, index) => (
                <tr key={index}>
                  <td className='p-2 border-b'>
                    <Typography color='text.primary'>{setting.type}</Typography>
                  </td>
                  <td className='p-2 border-b'>
                    <Checkbox checked={setting.email} onChange={() => handleCheckboxChange(index, 'email')} />
                  </td>
                  <td className='p-2 border-b'>
                    <Checkbox checked={setting.browser} onChange={() => handleCheckboxChange(index, 'browser')} />
                  </td>
                  <td className='p-2 border-b'>
                    <Checkbox checked={setting.app} onChange={() => handleCheckboxChange(index, 'app')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Typography className='mt-6 mb-2 font-medium'>When should we send you notifications?</Typography>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6} md={4}>
            <Select fullWidth value={sendTime} onChange={e => setSendTime(e.target.value)}>
              <MenuItem value='online'>Only when I'm online</MenuItem>
              <MenuItem value='anytime'>Anytime</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} className='flex gap-4 flex-wrap'>
            <Button variant='contained' onClick={handleSaveChanges}>
              Save Changes
            </Button>
            <Button variant='outlined' color='secondary' onClick={() => router.refresh()}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Notifications

// // src\views\account-settings\notifications\index.tsx

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import Checkbox from '@mui/material/Checkbox'
// import Select from '@mui/material/Select'
// import MenuItem from '@mui/material/MenuItem'
// import Grid from '@mui/material/Grid'
// import Button from '@mui/material/Button'

// // Component Imports
// import Link from '@components/Link'
// import Form from '@components/Form'

// // Style Imports
// import tableStyles from '@core/styles/table.module.css'

// type TableDataType = {
//   type: string
//   app: boolean
//   email: boolean
//   browser: boolean
// }

// // Vars
// const tableData: TableDataType[] = [
//   {
//     app: true,
//     email: true,
//     browser: true,
//     type: 'New for you'
//   },
//   {
//     app: true,
//     email: true,
//     browser: true,
//     type: 'Account activity'
//   },
//   {
//     app: false,
//     email: true,
//     browser: true,
//     type: 'A new browser used to sign in'
//   },
//   {
//     app: false,
//     email: true,
//     browser: false,
//     type: 'A new device is linked'
//   }
// ]

// const Notifications = () => {
//   return (
//     <Card>
//       <CardHeader
//         title='Recent Devices'
//         subheader={
//           <>
//             We need permission from your browser to show notifications.
//             <Link className='text-primary'> Request Permission</Link>
//           </>
//         }
//       />
//       <Form>
//         <div className='overflow-x-auto'>
//           <table className={tableStyles.table}>
//             <thead>
//               <tr>
//                 <th>Type</th>
//                 <th>Email</th>
//                 <th>Browser</th>
//                 <th>App</th>
//               </tr>
//             </thead>
//             <tbody className='border-be'>
//               {tableData.map((data, index) => (
//                 <tr key={index}>
//                   <td>
//                     <Typography color='text.primary'>{data.type}</Typography>
//                   </td>
//                   <td>
//                     <Checkbox defaultChecked={data.email} />
//                   </td>
//                   <td>
//                     <Checkbox defaultChecked={data.browser} />
//                   </td>
//                   <td>
//                     <Checkbox defaultChecked={data.app} />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <CardContent>
//           <Typography className='mbe-6 font-medium'>When should we send you notifications?</Typography>
//           <Grid container spacing={6}>
//             <Grid item xs={12} sm={6} md={4}>
//               <Select fullWidth defaultValue='online'>
//                 <MenuItem value='online'>Only when I&#39;m online</MenuItem>
//                 <MenuItem value='anytime'>Anytime</MenuItem>
//               </Select>
//             </Grid>
//             <Grid item xs={12} className='flex gap-4 flex-wrap'>
//               <Button variant='contained' type='submit'>
//                 Save Changes
//               </Button>
//               <Button variant='outlined' color='secondary' type='reset'>
//                 Reset
//               </Button>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Form>
//     </Card>
//   )
// }

// export default Notifications
