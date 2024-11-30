// src/models/ReportedJob.ts

import mongoose, { Document, Model, Schema, Types } from 'mongoose'

/**
 * IReportedJob Interface
 */
export interface IReportedJob extends Document {
  job_id: Types.ObjectId // References Jobs collection
  user_id?: Types.ObjectId // References Users collection (optional)
  reason: string
  name: string
  email: string
  message?: string
  reported_at: Date
  created_at?: Date
  updated_at?: Date
}

/**
 * ReportedJob Schema
 */
const ReportedJobSchema = new Schema<IReportedJob>(
  {
    job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: String,
    reported_at: { type: Date, default: Date.now }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
)

/**
 * Indexes for Optimized Queries
 */
ReportedJobSchema.index({ job_id: 1 })
ReportedJobSchema.index({ user_id: 1 })
ReportedJobSchema.index({ reason: 1 })
ReportedJobSchema.index({ reported_at: -1 })

/**
 * ReportedJob Model
 */
const ReportedJob: Model<IReportedJob> =
  mongoose.models.ReportedJob || mongoose.model<IReportedJob>('ReportedJob', ReportedJobSchema)

export default ReportedJob
