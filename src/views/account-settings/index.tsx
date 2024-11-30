// src/components/account-settings/index.tsx

'use client'

import React from 'react'
import Grid from '@mui/material/Grid'

// Import Individual Sections
import PersonalInformation from './PersonalInformation'
import ContactInformation from './ContactInformation'
import AddressSection from './AddressSection'
import ProfessionalDetails from './ProfessionalDetails'
import EducationSection from './EducationSection'
import CertificationsSection from './CertificationsSection'
import CoursesSection from './CoursesSection'
import ProjectsSection from './ProjectsSection'
import AwardsSection from './AwardsSection'
import SecuritySection from './SecuritySection'
import AccountDelete from './AccountDelete'

const Account: React.FC = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PersonalInformation />
      </Grid>
      <Grid item xs={12}>
        <ContactInformation />
      </Grid>
      <Grid item xs={12}>
        <AddressSection />
      </Grid>
      <Grid item xs={12}>
        <ProfessionalDetails />
      </Grid>
      <Grid item xs={12}>
        <EducationSection />
      </Grid>
      <Grid item xs={12}>
        <CertificationsSection />
      </Grid>
      <Grid item xs={12}>
        <CoursesSection />
      </Grid>
      <Grid item xs={12}>
        <ProjectsSection />
      </Grid>
      <Grid item xs={12}>
        <AwardsSection />
      </Grid>
      <Grid item xs={12}>
        <SecuritySection />
      </Grid>

      <Grid item xs={12}>
        <AccountDelete />
      </Grid>
    </Grid>
  )
}

export default Account

// 'use client'

// // React Imports
// import { useState } from 'react'
// import type { SyntheticEvent, ReactElement } from 'react'

// // MUI Imports
// import Grid from '@mui/material/Grid'
// import Tab from '@mui/material/Tab'
// import TabContext from '@mui/lab/TabContext'
// import TabList from '@mui/lab/TabList'
// import TabPanel from '@mui/lab/TabPanel'

// const AccountSettings = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
//   // States
//   const [activeTab, setActiveTab] = useState('account')

//   const handleChange = (event: SyntheticEvent, value: string) => {
//     setActiveTab(value)
//   }

//   return (
//     <TabContext value={activeTab}>
//       <Grid container spacing={6}>
//         <Grid item xs={12}>
//           <TabList onChange={handleChange} variant='scrollable'>
//             <Tab label='Account' icon={<i className='ri-user-3-line' />} iconPosition='start' value='account' />
//             <Tab
//               label='Notifications'
//               icon={<i className='ri-notification-3-line' />}
//               iconPosition='start'
//               value='notifications'
//             />
//             <Tab label='Connections' icon={<i className='ri-link' />} iconPosition='start' value='connections' />
//           </TabList>
//         </Grid>
//         <Grid item xs={12}>
//           <TabPanel value={activeTab} className='p-0'>
//             {tabContentList[activeTab]}
//           </TabPanel>
//         </Grid>
//       </Grid>
//     </TabContext>
//   )
// }

// export default AccountSettings
