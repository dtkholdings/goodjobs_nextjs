// src/models/Application.ts

import mongoose, { Document, Model, Schema, Types } from 'mongoose'

/**
 * Answer Interface
 */
interface Answer {
  question_id: Types.ObjectId // References question in Job's screening_questions
  answer: string
}

/**
 * IApplication Interface
 */
export interface IApplication extends Document {
  job_id: Types.ObjectId // References Jobs collection
  user_id: Types.ObjectId // References Users collection
  application_status: string // e.g., 'Applied', 'Under Review', 'Rejected', 'Accepted'
  answers: Answer[]
  applied_at: Date
  created_at?: Date
  updated_at?: Date
}

/**
 * Answer Schema
 */
const AnswerSchema = new Schema<Answer>(
  {
    question_id: { type: Schema.Types.ObjectId, ref: 'Job.screening_questions', required: true },
    answer: { type: String, required: true }
  },
  { _id: true }
)

/**
 * Application Schema
 */
const ApplicationSchema = new Schema<IApplication>(
  {
    job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    application_status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Rejected', 'Accepted'],
      default: 'Applied'
    },
    answers: [AnswerSchema],
    applied_at: { type: Date, default: Date.now }
    // createdAt and updatedAt will be handled by timestamps option
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
)

/**
 * Indexes for Optimized Queries
 */
ApplicationSchema.index({ job_id: 1 })
ApplicationSchema.index({ user_id: 1 })
ApplicationSchema.index({ application_status: 1 })

/**
 * Application Model
 */
const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)

export default Application
