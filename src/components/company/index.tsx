// src/components/company/index.tsx

'use client'

import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import CompanyCard from './CompanyCard'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useSession, signIn } from 'next-auth/react'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

interface Company {
  _id: string
  company_name: string
  tagline?: string
  company_username: string
  company_logo?: string
  company_cover_image?: string
  year_founded?: number
  company_size?: string
  company_type?: string
  industries?: string[]
  specialties?: any[] // Replace `any` with actual Specialty type if available
  services?: any[] // Replace `any` with actual Service type if available
  short_description?: string
  long_description?: string
  inquiry_email?: string
  support_email?: string
  general_phone_number?: string
  secondary_phone_number?: string
  fax?: string
  address: {
    line1: string
    line2?: string
    city?: string
    zip_code?: string
    country?: string
  }
  social_links: {
    linkedin?: string
    facebook?: string
    instagram?: string
    tiktok?: string
    twitter?: string
    github?: string
    website?: string
    youtube?: string
  }
  admins: string[] // Array of User ObjectIds
  created_at: string
  updated_at: string
}

const CompanyList: React.FC = () => {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If session is still loading, do nothing
    if (status === 'loading') return

    // If not authenticated, prompt to sign in
    if (!session) {
      signIn()
      return
    }

    const fetchCompanies = async () => {
      try {
        const response = await axios.get<Company[]>('/api/company')
        setCompanies(response.data)
      } catch (err: any) {
        console.error('Error fetching companies:', err)
        setError(err.response?.data?.error || 'Failed to fetch companies.')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [session, status])

  if (status === 'loading' || loading) {
    return (
      <Grid container justifyContent='center' alignItems='center' style={{ height: '100vh' }}>
        <CircularProgress />
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid container justifyContent='center' alignItems='center' style={{ height: '100vh' }}>
        <Alert severity='error'>{error}</Alert>
      </Grid>
    )
  }

  return (
    <Grid container spacing={4}>
      {Array.isArray(companies) && companies.length > 0 ? (
        companies.map(company => (
          <Grid item xs={12} sm={6} md={4} key={company._id}>
            <CompanyCard company={company} />
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Alert severity='info'>You are not managing any companies.</Alert>
        </Grid>
      )}
      {/* Add New Company Card */}
      <Grid item xs={12} sm={6} md={4}>
        <CompanyCard isAddCard />
      </Grid>
    </Grid>
  )
}

export default CompanyList

// // src/components/company/index.tsx

// 'use client'

// import React, { useEffect } from 'react'
// import Grid from '@mui/material/Grid'
// import CompanyCard from './CompanyCard'
// import { companies } from '../../data/companies' // Adjust the path as necessary
// import { useRouter } from 'next/navigation'

// const Company: React.FC = () => {
//   const router = useRouter()

//   useEffect(() => {
//     if (companies.length === 0) {
//       router.push('/company/create')
//     }
//   }, [])

//   return (
//     <Grid container spacing={4}>
//       {companies.map(company => (
//         <Grid item xs={12} sm={6} md={4} key={company.id}>
//           <CompanyCard company={company} />
//         </Grid>
//       ))}
//       {/* Add New Company Card */}
//       <Grid item xs={12} sm={6} md={4}>
//         <CompanyCard isAddCard />
//       </Grid>
//     </Grid>
//   )
// }

// export default Company
