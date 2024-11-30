// global.d.ts
interface PayHere {
  startPayment: (payment: any) => void
  // Add other PayHere methods if needed
}

interface Window {
  payhere: PayHere
}
