// src/models/ContactForm.ts

import mongoose, { Document, Model, Schema } from 'mongoose'

/**
 * IContactForm Interface
 */
export interface IContactForm extends Document {
  name: string
  email: string
  phone: string
  preferred_communication_method: string // 'Phone', 'Email'
  message: string
  created_at?: Date
  updated_at?: Date
}

/**
 * ContactForm Schema
 */
const ContactFormSchema = new Schema<IContactForm>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    preferred_communication_method: { type: String, enum: ['Phone', 'Email'], required: true },
    message: { type: String, required: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

/**
 * Indexes for Optimized Queries
 */
ContactFormSchema.index({ email: 1 })
ContactFormSchema.index({ phone: 1 })
ContactFormSchema.index({ created_at: 1 })

/**
 * ContactForm Model
 */
const ContactForm: Model<IContactForm> =
  mongoose.models.ContactForm || mongoose.model<IContactForm>('ContactForm', ContactFormSchema)

export default ContactForm
