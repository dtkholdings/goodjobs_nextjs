// src/models/Industry.ts

import mongoose, { Schema, Document } from 'mongoose'

export interface IIndustry extends Document {
  name: string
  description?: string
  created_at: Date
  updated_at: Date
}

const IndustrySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

// Prevent model recompilation in development
export default mongoose.models.Industry || mongoose.model<IIndustry>('Industry', IndustrySchema)
