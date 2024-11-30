// src/models/Specialty.ts

import mongoose, { Document, Model, Schema } from 'mongoose'

/**
 * ISpecialty Interface
 */
export interface ISpecialty extends Document {
  specialty_name: string
  created_at?: Date
  updated_at?: Date
}

/**
 * Specialty Schema
 */
const SpecialtySchema = new Schema<ISpecialty>(
  {
    specialty_name: { type: String, required: true, unique: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

/**
 * Indexes for Optimized Queries
 */
SpecialtySchema.index({ specialty_name: 1 })

/**
 * Specialty Model
 */
const Specialty: Model<ISpecialty> =
  mongoose.models.Specialty || mongoose.model<ISpecialty>('Specialty', SpecialtySchema)

export default Specialty
