'use client'

import React from 'react'
import { useRouter, usePathname, useParams } from 'next/navigation'
import { AppBar, Toolbar, Typography, Button, Tabs, Tab, Box } from '@mui/material'
import Link from 'next/link'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const companyId = params.companyId

  // Determine the current active tab based on the path
  const getCurrentTab = () => {
    if (pathname.includes('/dashboard')) return 0
    if (pathname.includes('/settings')) return 1
    if (pathname.includes('/jobs')) return 2
    if (pathname.includes('/edit')) return 3
    if (pathname.includes('/subscription')) return 4
    if (pathname.includes('/orders')) return 5
    return false
  }

  const currentTab = getCurrentTab()

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Tabs value={currentTab}>
          <Tab label='Dashboard' component={Link} href={`/company/${companyId}/dashboard`} />
          <Tab label='Settings' component={Link} href={`/company/${companyId}/settings`} />
          <Tab label='Jobs' component={Link} href={`/company/${companyId}/jobs`} />
          <Tab label='Edit' component={Link} href={`/company/${companyId}/edit`} />
          <Tab label='Subscription' component={Link} href={`/company/${companyId}/subscription`} />
          <Tab label='Orders' component={Link} href={`/company/${companyId}/orders`} />
        </Tabs>
      </AppBar>
      <Box sx={{ padding: 3 }}>{children}</Box>
    </Box>
  )
}

export default Layout
