// src/models/Notification.ts

import mongoose, { Document, Model, Schema, Types } from 'mongoose'

/**
 * Metadata Interface
 */
interface Metadata {
  link?: string // URL to redirect
  action_required?: boolean
  related_event?: string // e.g., 'Registration'
}

/**
 * INotification Interface
 */
export interface INotification extends Document {
  user_id: Types.ObjectId // References Users collection
  type: string // 'Email', 'In-App', 'Push'
  category: string // 'Account Action', 'Subscription', etc.
  title: string
  message: string
  status: string // 'Unread', 'Read', 'Sent', 'Failed'
  delivery_methods: string[] // ['Email', 'In-App', 'Push']
  is_scheduled: boolean
  schedule_time?: Date
  summary_frequency: string // 'Daily', 'Weekly', 'None'
  metadata: Metadata
  created_at?: Date
  delivered_at?: Date
  updated_at?: Date
}

/**
 * Metadata Schema
 */
const MetadataSchema = new Schema<Metadata>(
  {
    link: String,
    action_required: Boolean,
    related_event: String
  },
  { _id: false }
)

/**
 * Notification Schema
 */
const NotificationSchema = new Schema<INotification>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Email', 'In-App', 'Push'], required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Unread', 'Read', 'Sent', 'Failed'], required: true },
    delivery_methods: [{ type: String, enum: ['Email', 'In-App', 'Push'] }],
    is_scheduled: { type: Boolean, default: false },
    schedule_time: Date,
    summary_frequency: { type: String, enum: ['Daily', 'Weekly', 'None'], default: 'None' },
    metadata: { type: MetadataSchema },
    delivered_at: Date
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

/**
 * Indexes for Optimized Queries
 */
NotificationSchema.index({ user_id: 1 })
NotificationSchema.index({ status: 1 })
NotificationSchema.index({ type: 1 })
NotificationSchema.index({ is_scheduled: 1 })

/**
 * Notification Model
 */
const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)

export default Notification
