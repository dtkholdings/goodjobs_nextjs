// Path: src/views/company/CompanyDetailPage.tsx

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ICompany } from '@/models/Company'
import { IJob } from '@/models/Job'
import JobForm from '@/components/company/JobForm'
import JobList from '@/components/company/JobList'
import CompanyEditForm from '@/components/company/CompanyEditForm'

const CompanyDetailPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const [company, setCompany] = useState<ICompany | null>(null)
  const [jobs, setJobs] = useState<IJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchCompany()
      fetchJobs()
    }
  }, [id])

  const fetchCompany = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/company/${id}`)
      setCompany(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching company')
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`/api/company/${id}/jobs`)
      setJobs(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching jobs')
    }
  }

  const handleJobCreated = (newJob: IJob) => {
    setJobs(prev => [...prev, newJob])
  }

  const handleCompanyUpdate = (updatedCompany: ICompany) => {
    setCompany(updatedCompany)
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!company) return <p>No company data</p>

  return (
    <div>
      <h1>{company.company_name}</h1>
      <p>{company.tagline}</p>
      {/* Display other company details */}
      <section>
        <CompanyEditForm company={company} onUpdate={handleCompanyUpdate} />
      </section>
      <section>
        <JobForm companyId={id as string} onSuccess={handleJobCreated} />
      </section>
      <section>
        <JobList jobs={jobs} />
      </section>
    </div>
  )
}

export default CompanyDetailPage
