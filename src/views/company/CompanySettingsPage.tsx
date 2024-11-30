// Path: src/views/company/CompanySettingsPage.tsx
'use client'
import React, { useState } from 'react'
import useCompanies from '@/hooks/useCompanies'
import CompanyForm from '@/components/company/CompanyForm'
import CompanyRolesManager from '@/components/company/CompanyRolesManager'
import { ICompany } from '@/models/Company'

const CompanySettingsPage: React.FC = () => {
  const { companies, loading, error, fetchCompanies } = useCompanies()
  const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null)

  const handleCompanyCreated = (newCompany: ICompany) => {
    fetchCompanies()
  }

  const handleCompanyUpdate = (updatedCompany: ICompany) => {
    setSelectedCompany(updatedCompany)
    fetchCompanies()
  }

  return (
    <div>
      <h1>Company Settings</h1>
      <section>
        <h2>Your Companies</h2>
        {loading && <p>Loading companies...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && companies.length === 0 && <p>No companies found.</p>}
        {!loading && !error && companies.length > 0 && (
          <ul>
            {companies.map(company => (
              <li key={company.id.toString()}>
                <button onClick={() => setSelectedCompany(company)}>{company.company_name}</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2>Create New Company</h2>
        <CompanyForm onSuccess={handleCompanyCreated} />
      </section>
      {selectedCompany && (
        <section>
          <h2>Manage Roles for {selectedCompany.company_name}</h2>
          <CompanyRolesManager company={selectedCompany} onUpdate={handleCompanyUpdate} />
        </section>
      )}
    </div>
  )
}

export default CompanySettingsPage
