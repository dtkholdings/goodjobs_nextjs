// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import AccountDetails from './AccountDetails'
import AccountDelete from './AccountDelete'
import PersonalInformation from '../PersonalInformation'

const Account = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PersonalInformation />
      </Grid>
      <Grid item xs={12}>
        <AccountDelete />
      </Grid>
    </Grid>
  )
}

export default Account
