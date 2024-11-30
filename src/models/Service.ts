// src/models/Service.ts

import mongoose, { Document, Model, Schema } from 'mongoose'

/**
 * IService Interface
 */
export interface IService extends Document {
  service_name: string
  description?: string
  created_at?: Date
  updated_at?: Date
}

/**
 * Service Schema
 */
const ServiceSchema = new Schema<IService>(
  {
    service_name: { type: String, required: true, unique: true },
    description: String
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

/**
 * Indexes for Optimized Queries
 */
ServiceSchema.index({ service_name: 1 })

/**
 * Service Model
 */
const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema)

export default Service
