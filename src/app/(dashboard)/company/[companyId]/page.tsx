// src/app/(dashboard)/company/[companyId]/page.tsx

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectToDatabase from '@/libs/mongodb'
import Company, { ICompany } from '@/models/Company'
import mongoose from 'mongoose' // Added import
// import Dashboard from '../../../../components/company/Dashboard' // Create this component as needed
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Company Dashboard',
  description: 'Dashboard for managing company settings, jobs, and more.'
}

interface PageProps {
  params: {
    companyId: string
  }
}

const Page = async ({ params }: PageProps) => {
  const { companyId } = params

  // Retrieve the user's session
  const session = await getServerSession(authOptions)

  // If there's no session, redirect to the home page
  if (!session) {
    redirect('/')
  }

  // Connect to the database
  await connectToDatabase()

  // Fetch the company by ID and populate relevant fields
  const company: ICompany | null = await Company.findById(companyId).populate('specialties').populate('services').exec()

  // If the company doesn't exist, redirect to the home page
  if (!company) {
    redirect('/')
  }

  // Check if the user is an admin of the company
  const isAdmin = company.admins.some((adminId: mongoose.Types.ObjectId) => adminId.toString() === session.user.id)

  // If the user is not an admin, redirect to the home page
  if (!isAdmin) {
    redirect('/')
  }

  // Render the Dashboard component, passing the company data
  //   return <Dashboard company={company} />
  redirect(`/company/${companyId}/dashboard`)
}

export default Page
