// src/components/company/CompanyCard.tsx

'use client'

import React from 'react'
import { Card, CardContent, Typography, CardActionArea, Box } from '@mui/material'
import { useRouter } from 'next/navigation'

// Define the interface for a Company (ensure it matches your Mongoose schema)
interface Company {
  _id: string
  company_name: string
  tagline?: string
  // Add other fields as necessary
}

interface CompanyCardProps {
  company?: Company
  isAddCard?: boolean
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, isAddCard }) => {
  const router = useRouter()

  const handleClick = () => {
    if (isAddCard) {
      router.push('/company/create')
    } else if (company) {
      router.push(`/company/${company._id}/dashboard`)
    }
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200 // Fixed height for uniformity
            }}
          >
            {isAddCard ? (
              <>
                <Box
                  sx={{
                    fontSize: 50,
                    color: 'primary.main',
                    mb: 2
                  }}
                >
                  <i className='ri-add-line'></i>
                </Box>
                <Typography variant='h6' component='div'>
                  Add New Company
                </Typography>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    fontSize: 50,
                    color: 'secondary.main',
                    mb: 2
                  }}
                >
                  <i className='ri-building-line'></i>
                </Box>
                <Typography variant='h6' component='div' gutterBottom>
                  {company?.company_name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {company?.tagline || 'No tagline provided.'}
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default CompanyCard

// // src/components/company/CompanyCard.tsx

// 'use client'

// import React from 'react'
// import { Card, CardContent, Typography, CardActionArea } from '@mui/material'
// import { useRouter } from 'next/navigation'

// interface CompanyCardProps {
//   company?: {
//     id: string
//     name: string
//     description: string
//   }
//   isAddCard?: boolean
// }

// const CompanyCard: React.FC<CompanyCardProps> = ({ company, isAddCard }) => {
//   const router = useRouter()

//   const handleClick = () => {
//     if (isAddCard) {
//       router.push('/company/create')
//     } else if (company) {
//       router.push(`/company/${company.id}`)
//     }
//   }

//   return (
//     <Card>
//       <CardActionArea onClick={handleClick}>
//         <CardContent style={{ textAlign: 'center' }}>
//           {isAddCard ? (
//             <>
//               <i className='ri-money-dollar-circle-line' />
//               <Typography variant='h6' component='div'>
//                 Add New Company
//               </Typography>
//             </>
//           ) : (
//             <>
//               <i className='ri-money-dollar-circle-line' />
//               <Typography variant='h6' component='div'>
//                 {company?.name}
//               </Typography>
//               <Typography variant='body2' color='text.secondary'>
//                 {company?.description}
//               </Typography>
//             </>
//           )}
//         </CardContent>
//       </CardActionArea>
//     </Card>
//   )
// }

// export default CompanyCard
