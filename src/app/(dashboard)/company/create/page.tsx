// src/app/(dashboard)/company/create/page.tsx

'use client'

import React from 'react'
import { Container, Box } from '@mui/material'
import AddCompany from '@components/company/AddCompany'

const AddNewCompanyPage: React.FC = () => {
  return (
    <Container maxWidth='md'>
      <Box mt={4}>
        <AddCompany />
      </Box>
    </Container>
  )
}

export default AddNewCompanyPage
