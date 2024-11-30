// // src/components/ClientProvider.tsx

// 'use client' // Marking as a Client Component

// import { ReactNode, useEffect, useState } from 'react'
// import Script from 'next/script'

// interface ClientProviderProps {
//   children: ReactNode
// }

// const ClientProvider = ({ children }: ClientProviderProps) => {
//   const [payhereLoaded, setPayhereLoaded] = useState<boolean>(false)

//   useEffect(() => {
//     if (payhereLoaded && typeof payhere !== 'undefined') {
//       // Payment completed. It can be a successful or failed payment.
//       payhere.onCompleted = function onCompleted(orderId: string) {
//         console.log('Payment completed. OrderID:', orderId)
//         // Optionally, fetch order status from the backend to confirm
//         window.location.href = '/subscription-success'
//       }

//       // Payment window closed
//       payhere.onDismissed = function onDismissed() {
//         console.log('Payment dismissed')
//         // Optionally, show a message to the user
//       }

//       // Error occurred
//       payhere.onError = function onError(error: string) {
//         console.log('Error:', error)
//         // Handle the error, e.g., show an alert or notification
//         alert('Payment error occurred. Please try again.')
//       }
//     }
//   }, [payhereLoaded])

//   return (
//     <>
//       {/* Include PayHere.js SDK */}
//       <Script
//         src='https://www.payhere.lk/lib/payhere.js'
//         strategy='afterInteractive' // Suitable for Client Components
//         onLoad={() => {
//           console.log('PayHere.js has loaded successfully.')
//           alert('PayHere.js has loaded successfully.')
//           setPayhereLoaded(true)
//         }}
//         onError={e => {
//           console.error('Error loading PayHere.js:', e)
//           alert('PayHere.js has not loaded successfully.')
//         }}
//       />
//       {children}
//     </>
//   )
// }

// export default ClientProvider
