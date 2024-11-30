// models/Order.ts

import mongoose, { Document, Model, Schema } from 'mongoose'
import { ISubscription } from './Subscription'
import { ICompany } from './Company'

/**
 * IOrder Interface
 */
export interface IOrder extends Document {
  company: mongoose.Types.ObjectId | ICompany
  subscription: mongoose.Types.ObjectId | ISubscription
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  payhere_transaction_id?: string
  payhere_order_id?: string
  credits?: number
  ai_credits?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Order Schema
 */
const OrderSchema = new Schema<IOrder>(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'LKR' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    payhere_transaction_id: { type: String },
    payhere_order_id: { type: String },
    credits: { type: Number, default: 0 },
    ai_credits: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
)

/**
 * Indexes for Optimized Queries
 */
OrderSchema.index({ order_id: 1 })

/**
 * Order Model
 */
const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

export default Order
