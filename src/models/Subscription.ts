// models/Subscription.ts

import mongoose, { Document, Model, Schema } from 'mongoose'

/**
 * ISubscription Interface
 */
export interface ISubscription extends Document {
  subscription_plan_name: string
  subtitle?: string
  currency: string
  price: number
  included_features: string[]
  not_included_features: string[]
  package_color?: string
  icon?: string
  credits?: number
  ai_credits?: number
}

/**
 * Subscription Schema
 */
const SubscriptionSchema = new Schema<ISubscription>(
  {
    subscription_plan_name: { type: String, required: true, unique: true },
    subtitle: String,
    currency: { type: String, required: true },
    price: { type: Number, required: true },
    included_features: { type: [String], default: [] },
    not_included_features: { type: [String], default: [] },
    package_color: String,
    icon: String,
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
SubscriptionSchema.index({ subscription_plan_name: 1 })

/**
 * Subscription Model
 */
const Subscription: Model<ISubscription> =
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema)

export default Subscription
