// src/views/account-settings/connections/index.tsx

'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'

// Types
type ConnectedAccount = {
  id: string
  name: string
  logo: string
  connected: boolean
  description: string
}

const Connections = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession()
      if (!session) {
        router.push('/login')
      } else {
        try {
          const response = await axios.get('/api/user/connected-accounts')
          setConnectedAccounts(response.data)
        } catch (error) {
          console.error('Error fetching connected accounts:', error)
        }
      }
    }
    fetchData()
  }, [router])

  const handleToggle = async (account: ConnectedAccount) => {
    try {
      if (account.connected) {
        // Disconnect the account
        await axios.post('/api/user/disconnect-account', { accountId: account.id })
      } else {
        // Connect the account
        await axios.post('/api/user/connect-account', { accountId: account.id })
      }
      // Update the state
      setConnectedAccounts(prev =>
        prev.map(acc => (acc.id === account.id ? { ...acc, connected: !acc.connected } : acc))
      )
    } catch (error) {
      console.error('Error updating account connection:', error)
    }
  }

  return (
    <Card>
      <CardHeader title='Connected Accounts' subheader='Manage your connected accounts' />
      <CardContent className='flex flex-col gap-4'>
        {connectedAccounts.map(account => (
          <div key={account.id} className='flex items-center justify-between gap-4'>
            <div className='flex flex-grow items-center gap-4'>
              <img height={32} width={32} src={account.logo} alt={account.name} />
              <div className='flex-grow'>
                <Typography className='font-medium' color='text.primary'>
                  {account.name}
                </Typography>
                <Typography variant='body2'>{account.description}</Typography>
              </div>
            </div>
            <Switch checked={account.connected} onChange={() => handleToggle(account)} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default Connections

// // src\views\account-settings\connections\index.tsx

// // Next Imports
// import Link from 'next/link'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'
// import CardContent from '@mui/material/CardContent'
// import Grid from '@mui/material/Grid'
// import Typography from '@mui/material/Typography'
// import Switch from '@mui/material/Switch'

// // Component Imports
// import CustomIconButton from '@core/components/mui/IconButton'

// type ConnectedAccountsType = {
//   title: string
//   logo: string
//   checked: boolean
//   subtitle: string
// }

// type SocialAccountsType = {
//   title: string
//   logo: string
//   username?: string
//   isConnected: boolean
//   href?: string
// }

// // Vars
// const connectedAccountsArr: ConnectedAccountsType[] = [
//   {
//     checked: true,
//     title: 'Google',
//     logo: '/images/logos/google.png',
//     subtitle: 'Calendar and Contacts'
//   },
//   {
//     checked: false,
//     title: 'Slack',
//     logo: '/images/logos/slack.png',
//     subtitle: 'Communications'
//   },
//   {
//     checked: true,
//     title: 'Github',
//     logo: '/images/logos/github.png',
//     subtitle: 'Manage your Git repositories'
//   },
//   {
//     checked: true,
//     title: 'Mailchimp',
//     subtitle: 'Email marketing service',
//     logo: '/images/logos/mailchimp.png'
//   },
//   {
//     title: 'Asana',
//     checked: false,
//     subtitle: 'Task Communication',
//     logo: '/images/logos/asana.png'
//   }
// ]

// const socialAccountsArr: SocialAccountsType[] = [
//   {
//     title: 'Facebook',
//     isConnected: false,
//     logo: '/images/logos/facebook.png'
//   },
//   {
//     title: 'Twitter',
//     isConnected: true,
//     username: '@Theme_Selection',
//     logo: '/images/logos/twitter.png',
//     href: 'https://twitter.com/Theme_Selection'
//   },
//   {
//     title: 'Linkedin',
//     isConnected: true,
//     username: '@ThemeSelection',
//     logo: '/images/logos/linkedin.png',
//     href: 'https://in.linkedin.com/company/themeselection'
//   },
//   {
//     title: 'Dribbble',
//     isConnected: false,
//     logo: '/images/logos/dribbble.png'
//   },
//   {
//     title: 'Behance',
//     isConnected: false,
//     logo: '/images/logos/behance.png'
//   }
// ]

// const Connections = () => {
//   return (
//     <Card>
//       <Grid container>
//         <Grid item xs={12} md={6}>
//           <CardHeader
//             title='Connected Accounts'
//             subheader='Display content from your connected accounts on your site'
//           />
//           <CardContent className='flex flex-col gap-4'>
//             {connectedAccountsArr.map((item, index) => (
//               <div key={index} className='flex items-center justify-between gap-4'>
//                 <div className='flex flex-grow items-center gap-4'>
//                   <img height={32} width={32} src={item.logo} alt={item.title} />
//                   <div className='flex-grow'>
//                     <Typography className='font-medium' color='text.primary'>
//                       {item.title}
//                     </Typography>
//                     <Typography variant='body2'>{item.subtitle}</Typography>
//                   </div>
//                 </div>
//                 <Switch defaultChecked={item.checked} />
//               </div>
//             ))}
//           </CardContent>
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <CardHeader title='Social Accounts' subheader='Display content from social accounts on your site' />
//           <CardContent className='flex flex-col gap-4'>
//             {socialAccountsArr.map((item, index) => (
//               <div key={index} className='flex items-center justify-between gap-4'>
//                 <div className='flex flex-grow items-center gap-4'>
//                   <img height={32} width={32} src={item.logo} alt={item.title} />
//                   <div className='flex-grow'>
//                     <Typography className='font-medium' color='text.primary'>
//                       {item.title}
//                     </Typography>
//                     {item.isConnected ? (
//                       <Typography color='primary' component={Link} href={item.href || '/'} target='_blank'>
//                         {item.username}
//                       </Typography>
//                     ) : (
//                       <Typography variant='body2'>Not Connected</Typography>
//                     )}
//                   </div>
//                 </div>
//                 <CustomIconButton variant='outlined' color={item.isConnected ? 'error' : 'secondary'}>
//                   <i className={item.isConnected ? 'ri-delete-bin-7-line' : 'ri-links-line'} />
//                 </CustomIconButton>
//               </div>
//             ))}
//           </CardContent>
//         </Grid>
//       </Grid>
//     </Card>
//   )
// }

// export default Connections
