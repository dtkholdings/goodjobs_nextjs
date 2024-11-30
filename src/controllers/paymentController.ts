// // src/controllers/paymentController.ts

// import type { NextApiRequest, NextApiResponse } from 'next'
// import Subscription from '../models/Subscription'
// import Order from '../models/Order'
// import Company from '../models/Company'
// import { PAYHERE } from '@/configs/payhere'

// /**
//  * Fetch all available subscriptions
//  */
// export const getSubscriptions = async (req: NextApiRequest, res: NextApiResponse) => {
//   try {
//     const subscriptions = await Subscription.find()
//     res.status(200).json(subscriptions)
//   } catch (error: any) {
//     res.status(500).json({ message: 'Error fetching subscriptions', error: error.message })
//   }
// }

// /**
//  * Create an order and initiate PayHere.lk checkout
//  */
// export const createOrder = async (req: NextApiRequest, res: NextApiResponse) => {
//   try {
//     const { subscriptionId, companyId } = req.body

//     // Validate inputs
//     if (!subscriptionId || !companyId) {
//       return res.status(400).json({ message: 'subscriptionId and companyId are required' })
//     }

//     const subscription = await Subscription.findById(subscriptionId)
//     const company = await Company.findById(companyId)

//     if (!subscription || !company) {
//       return res.status(404).json({ message: 'Subscription or Company not found' })
//     }

//     // Create Order
//     const order = new Order({
//       company: company._id,
//       subscription: subscription._id,
//       amount: subscription.price,
//       currency: subscription.currency
//     })

//     await order.save()

//     // Prepare PayHere.lk payment data
//     const payhereData = {
//       merchant_id: PAYHERE.merchant_id,
//       return_url: PAYHERE.return_url,
//       cancel_url: PAYHERE.cancel_url,
//       notify_url: PAYHERE.notify_url,
//       order_id: order.id.toString(),
//       items: subscription.subscription_plan_name,
//       amount: subscription.price,
//       currency: PAYHERE.currency,
//       customer_name: company.company_name,
//       customer_email: company.inquiry_email || '',
//       customer_phone: company.general_phone_number || ''
//       // Additional fields as required by PayHere.lk
//     }

//     // Redirect to PayHere.lk checkout
//     res.status(200).json({ payhereData })
//   } catch (error: any) {
//     res.status(500).json({ message: 'Error creating order', error: error.message })
//   }
// }

// /**
//  * Handle PayHere.lk notification
//  */
// export const handleNotify = async (req: NextApiRequest, res: NextApiResponse) => {
//   try {
//     const {
//       order_id,
//       status_code,
//       merchant_id,
//       payhere_order_id,
//       payhere_transaction_id
//       // Other fields as per PayHere.lk documentation
//     } = req.body

//     // Verify the merchant_id
//     if (merchant_id !== PAYHERE.merchant_id) {
//       return res.status(400).send('Invalid Merchant ID')
//     }

//     const order = await Order.findById(order_id)

//     if (!order) {
//       return res.status(404).send('Order not found')
//     }

//     if (status_code === 2) {
//       // 2 indicates payment successful
//       order.status = 'completed'
//       order.payhere_order_id = payhere_order_id
//       order.payhere_transaction_id = payhere_transaction_id

//       // Update company subscription
//       await order.save()

//       const company = await Company.findById(order.company)
//       if (company) {
//         company.subscription = order.subscription
//         await company.save()
//       }
//     } else {
//       order.status = 'failed'
//       await order.save()
//     }

//     res.status(200).send('OK')
//   } catch (error: any) {
//     res.status(500).send('Error processing notification')
//   }
// }

// /**
//  * Handle PayHere.lk return URL
//  */
// export const handleReturn = async (req: NextApiRequest, res: NextApiResponse) => {
//   // You can fetch order details and show confirmation to the user
//   res.status(200).send('Payment Successful')
// }

// /**
//  * Handle PayHere.lk cancel URL
//  */
// export const handleCancel = async (req: NextApiRequest, res: NextApiResponse) => {
//   res.status(200).send('Payment Cancelled')
// }

// // // src/controllers/paymentController.ts

// // import type { NextApiRequest, NextApiResponse } from 'next'
// // import Subscription from '../models/Subscription'
// // import Order from '../models/Order'
// // import Company from '../models/Company'
// // import { PAYHERE } from '@/configs/payhere'

// // /**
// //  * Fetch all available subscriptions
// //  */
// // export const getSubscriptions = async (req: NextApiRequest, res: NextApiResponse) => {
// //   try {
// //     const subscriptions = await Subscription.find()
// //     res.status(200).json(subscriptions)
// //   } catch (error: any) {
// //     res.status(500).json({ message: 'Error fetching subscriptions', error: error.message })
// //   }
// // }

// // /**
// //  * Create an order and initiate PayHere.lk checkout
// //  */
// // export const createOrder = async (req: NextApiRequest, res: NextApiResponse) => {
// //   try {
// //     const { subscriptionId, companyId } = req.body

// //     // Validate inputs
// //     if (!subscriptionId || !companyId) {
// //       return res.status(400).json({ message: 'subscriptionId and companyId are required' })
// //     }

// //     const subscription = await Subscription.findById(subscriptionId)
// //     const company = await Company.findById(companyId)

// //     if (!subscription || !company) {
// //       return res.status(404).json({ message: 'Subscription or Company not found' })
// //     }

// //     // Create Order
// //     const order = new Order({
// //       company: company._id,
// //       subscription: subscription._id,
// //       amount: subscription.price,
// //       currency: subscription.currency
// //     })

// //     await order.save()

// //     // Prepare PayHere.lk payment data
// //     const payhereData = {
// //       merchant_id: PAYHERE.merchant_id,
// //       return_url: PAYHERE.return_url,
// //       cancel_url: PAYHERE.cancel_url,
// //       notify_url: PAYHERE.notify_url,
// //       order_id: order.id.toString(),
// //       items: subscription.subscription_plan_name,
// //       amount: subscription.price,
// //       currency: PAYHERE.currency,
// //       customer_name: company.company_name,
// //       customer_email: company.inquiry_email || '',
// //       customer_phone: company.general_phone_number || ''
// //       // Additional fields as required by PayHere.lk
// //     }

// //     // Redirect to PayHere.lk checkout
// //     res.status(200).json({ payhereData })
// //   } catch (error: any) {
// //     res.status(500).json({ message: 'Error creating order', error: error.message })
// //   }
// // }

// // /**
// //  * Handle PayHere.lk notification
// //  */
// // export const handleNotify = async (req: NextApiRequest, res: NextApiResponse) => {
// //   try {
// //     const {
// //       order_id,
// //       status_code,
// //       merchant_id,
// //       payhere_order_id,
// //       payhere_transaction_id
// //       // Other fields as per PayHere.lk documentation
// //     } = req.body

// //     // Verify the merchant_id
// //     if (merchant_id !== PAYHERE.merchant_id) {
// //       return res.status(400).send('Invalid Merchant ID')
// //     }

// //     const order = await Order.findById(order_id)

// //     if (!order) {
// //       return res.status(404).send('Order not found')
// //     }

// //     if (status_code === 2) {
// //       // 2 indicates payment successful
// //       order.status = 'completed'
// //       order.payhere_order_id = payhere_order_id
// //       order.payhere_transaction_id = payhere_transaction_id

// //       // Update company subscription
// //       await order.save()

// //       const company = await Company.findById(order.company)
// //       if (company) {
// //         company.subscription = order.subscription
// //         await company.save()
// //       }
// //     } else {
// //       order.status = 'failed'
// //       await order.save()
// //     }

// //     res.status(200).send('OK')
// //   } catch (error: any) {
// //     res.status(500).send('Error processing notification')
// //   }
// // }

// // /**
// //  * Handle PayHere.lk return URL
// //  */
// // export const handleReturn = async (req: NextApiRequest, res: NextApiResponse) => {
// //   // You can fetch order details and show confirmation to the user
// //   res.status(200).send('Payment Successful')
// // }

// // /**
// //  * Handle PayHere.lk cancel URL
// //  */
// // export const handleCancel = async (req: NextApiRequest, res: NextApiResponse) => {
// //   res.status(200).send('Payment Cancelled')
// // }
