// Component Imports
import PasswordReset from '@views/PasswordReset'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const PasswordResetPage = () => {
  // Vars
  const mode = getServerMode()

  return <PasswordReset mode={mode} />
}

export default PasswordResetPage
