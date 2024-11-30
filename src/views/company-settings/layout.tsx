// src/app/account-settings/layout.tsx

'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

const AccountSettingsLayout = ({ children }: { children: ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>
}

export default AccountSettingsLayout
