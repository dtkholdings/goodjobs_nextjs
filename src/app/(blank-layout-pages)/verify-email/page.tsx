// Component Imports
import VerifyEmail from '@views/VerifyEmail'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const VerifyEmailPage = () => {
  // Vars
  const mode = getServerMode()

  return <VerifyEmail mode={mode} />
}

export default VerifyEmailPage
