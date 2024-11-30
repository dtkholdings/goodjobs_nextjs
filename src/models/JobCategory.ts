// src/models/JobCategory.ts

import mongoose, { Document, Model, Schema, Types } from 'mongoose'

/**
 * IJobCategory Interface
 */
export interface IJobCategory extends Document {
  category_name: string
  icon?: string // URL or path
  jobs: Types.ObjectId[] // References Jobs collection
  created_at?: Date
  updated_at?: Date
}

/**
 * JobCategory Schema
 */
const JobCategorySchema = new Schema<IJobCategory>(
  {
    category_name: { type: String, required: true, unique: true },
    icon: String,
    jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }]
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
)

/**
 * Indexes for Optimized Queries
 */
JobCategorySchema.index({ category_name: 1 })

/**
 * JobCategory Model
 */
const JobCategory: Model<IJobCategory> =
  mongoose.models.JobCategory || mongoose.model<IJobCategory>('JobCategory', JobCategorySchema)

export default JobCategory
