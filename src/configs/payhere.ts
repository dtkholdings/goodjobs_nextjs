// configs/payhere.ts

export const PAYHERE = {
  merchant_id: process.env.PAYHERE_MERCHANT_ID || '1223226',
  secret: process.env.PAYHERE_SECRET || 'MTY0NzkyNzA1ODE2OTAxMTY0NDM0ODQ1Nzc0NDgzMTE0ODUwNDU3',
  return_url: process.env.PAYHERE_RETURN_URL || 'http://dtkh.ddns.net/api/payhere/return',
  cancel_url: process.env.PAYHERE_CANCEL_URL || 'http://dtkh.ddns.net/api/payhere/cancel',
  notify_url: process.env.PAYHERE_NOTIFY_URL || 'http://dtkh.ddns.net/api/payhere/notify',
  currency: 'LKR'
}
