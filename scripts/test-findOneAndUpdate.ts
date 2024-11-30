// scripts/test-findOneAndUpdate.ts

import connectToDatabase from '@/libs/mongodb'
import UserModel from '@/models/User'

async function testFindOneAndUpdate() {
  await connectToDatabase()
  console.log('Connected to the database.')

  const email = 'hr@dtkholdings.com' // Replace with an existing user email
  const token = 'testtoken123456'
  const passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  const user = await UserModel.findOneAndUpdate(
    { email },
    { $set: { passwordResetToken: token, passwordResetExpires } },
    { new: true }
  )

  if (!user) {
    console.log('User not found.')
    return
  }

  console.log('Updated user:', user)
}

testFindOneAndUpdate()
  .then(() => {
    console.log('Test completed.')
    process.exit(0)
  })
  .catch(error => {
    console.error('Error during test:', error)
    process.exit(1)
  })
