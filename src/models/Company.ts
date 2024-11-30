// src/models/Company.ts

import mongoose, { Schema, Document } from 'mongoose'
import './Specialty' // Import Specialty model
import './Service' // Import Service model
import { ISubscription } from './Subscription'
import './Order' // Import Order model

export interface ICompany extends Document {
  company_name: string
  tagline?: string
  company_username: string
  company_logo?: string
  company_cover_image?: string
  year_founded?: number
  company_size?: string
  company_type?: string
  industries?: string[]
  specialties?: string[] // Array of Specialty ObjectIds
  services?: string[] // Array of Service ObjectIds
  short_description?: string
  long_description?: string
  inquiry_email?: string
  support_email?: string
  general_phone_number?: string
  secondary_phone_number?: string
  fax?: string
  address: {
    line1: string
    line2?: string
    city?: string
    zip_code?: string
    country?: string
  }
  social_links: {
    linkedin?: string
    facebook?: string
    instagram?: string
    tiktok?: string
    twitter?: string
    github?: string
    website?: string
    youtube?: string
  }
  admins: mongoose.Types.ObjectId[] // Array of User ObjectIds
  subscription?: mongoose.Types.ObjectId | ISubscription
  subscription_status?: string
  orders: mongoose.Types.ObjectId[] // Array of Order ObjectIds
  credits: number
  ai_credits: number
  created_at: Date
  updated_at: Date
}

const AddressSchema: Schema = new Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String },
  zip_code: { type: String },
  country: { type: String }
})

const SocialLinksSchema: Schema = new Schema({
  linkedin: { type: String },
  facebook: { type: String },
  instagram: { type: String },
  tiktok: { type: String },
  twitter: { type: String },
  github: { type: String },
  website: { type: String },
  youtube: { type: String }
})

const CompanySchema: Schema = new Schema(
  {
    company_name: { type: String, required: true },
    tagline: { type: String },
    company_username: { type: String, required: true, unique: true },
    company_logo: { type: String },
    company_cover_image: { type: String },
    year_founded: { type: Number },
    company_size: { type: String },
    company_type: { type: String },
    industries: [{ type: String }],
    specialties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' }],
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    short_description: { type: String },
    long_description: { type: String },
    inquiry_email: { type: String },
    support_email: { type: String },
    general_phone_number: { type: String },
    secondary_phone_number: { type: String },
    fax: { type: String },
    address: { type: AddressSchema, required: true },
    social_links: { type: SocialLinksSchema, required: true },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    subscription_status: { type: String, required: true, default: 'inactive' },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    credits: { type: Number, default: 0 },
    ai_credits: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
)

// Prevent model recompilation in development
export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema)
