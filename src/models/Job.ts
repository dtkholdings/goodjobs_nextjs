// src/models/Job.ts

import mongoose, { Document, Model, Schema, Types } from 'mongoose'
import '@/models' // Central models import to register all schemas

/**
 * Address Interface
 */
interface Address {
  line1?: string
  line2?: string
  city?: string
  province?: string
  zip_code?: string
  country?: string
}

/**
 * Coordinates Interface
 */
interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * JobLocation Interface
 */
interface JobLocation {
  address: Address
  coordinates?: Coordinates
}

/**
 * ScreeningQuestion Interface
 */
interface ScreeningQuestion {
  question: string
  question_type: 'SC' | 'MC' | 'ST' | 'LT' // Single Choice, Multiple Choice, Short Text, Long Text
  correct_answers?: string[] // Applicable for SC and MC
  options?: string[] // Applicable for SC and MC
  required: boolean
}

/**
 * IJob Interface
 */
export interface IJob extends Document {
  company_id: Types.ObjectId
  job_title: string
  job_description: string
  job_type: 'Internship' | 'Full-Time' | 'Part-Time' | 'Contract'
  job_location_type: 'On-Site' | 'Remote' | 'Hybrid'
  job_level: 'Junior' | 'Senior' | 'Executive'
  gender: 'Male' | 'Female' | 'Any'
  job_closing_date: Date
  job_post_type: 'Normal' | 'Urgent' | 'Premium'
  skills: Types.ObjectId[]
  job_location: JobLocation
  video_url?: string
  cv_send_email?: string
  applied_users: Types.ObjectId[]
  saved_users: Types.ObjectId[]
  screening_questions: ScreeningQuestion[]
  expired_at?: Date
  job_post_status: 'Draft' | 'Live' | 'Expired'
  created_at?: Date
  updated_at?: Date
}

/**
 * Address Schema
 */
const AddressSchema = new Schema<Address>(
  {
    line1: { type: String, required: false },
    line2: { type: String, required: false },
    city: { type: String, required: false },
    province: { type: String, required: false },
    zip_code: { type: String, required: false },
    country: { type: String, required: false }
  },
  { _id: false }
)

/**
 * Coordinates Schema
 */
const CoordinatesSchema = new Schema<Coordinates>(
  {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
  },
  { _id: false }
)

/**
 * JobLocation Schema
 */
const JobLocationSchema = new Schema<JobLocation>(
  {
    address: { type: AddressSchema, required: false },
    coordinates: { type: CoordinatesSchema, required: false }
  },
  { _id: false }
)

/**
 * ScreeningQuestion Schema
 */
const ScreeningQuestionSchema = new Schema<ScreeningQuestion>(
  {
    question: { type: String, required: true },
    question_type: { type: String, enum: ['SC', 'MC', 'ST', 'LT'], required: true },
    correct_answers: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          if (this.question_type === 'ST' || this.question_type === 'LT') {
            return v === undefined || v.length === 0
          }
          return v && v.length > 0
        },
        message: 'Correct answers are required for SC and MC question types and should be empty for ST and LT'
      }
    },
    options: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          if (this.question_type === 'SC' || this.question_type === 'MC') {
            return v && v.length >= 2
          }
          return v === undefined || v.length === 0
        },
        message: 'Options are required for SC and MC question types and should have at least two options'
      }
    },
    required: { type: Boolean, default: false }
  },
  { _id: true }
)

/**
 * Job Schema
 */
const JobSchema = new Schema<IJob>(
  {
    company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    job_title: { type: String, required: true },
    job_description: { type: String, required: false },
    job_type: { type: String, enum: ['Internship', 'Full-Time', 'Part-Time', 'Contract'], required: false },
    job_location_type: { type: String, enum: ['On-Site', 'Remote', 'Hybrid'], required: false },
    job_level: { type: String, enum: ['Junior', 'Senior', 'Executive'], required: false },
    gender: { type: String, enum: ['Male', 'Female', 'Any'], required: false },
    job_closing_date: {
      type: Date,
      required: false,
      validate: {
        validator: function (v: Date) {
          return !v || v > new Date()
        },
        message: 'Job closing date must be in the future'
      }
    },
    job_post_type: { type: String, enum: ['Normal', 'Urgent', 'Premium'], required: false, default: 'Normal' },
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    job_location: { type: JobLocationSchema, required: false },
    video_url: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^(ftp|http|https):\/\/[^ "]+$/.test(v)
        },
        message: props => `${props.value} is not a valid URL`
      }
    },
    cv_send_email: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: props => `${props.value} is not a valid email`
      }
    },
    applied_users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    saved_users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    screening_questions: { type: [ScreeningQuestionSchema], default: [] },
    expired_at: { type: Date },
    job_post_status: { type: String, enum: ['Draft', 'Live', 'Expired'], required: false, default: 'Draft' }
  },
  {
    timestamps: true
  }
)

/**
 * Indexes for Optimized Queries
 */
// Text index for job_title and job_description
JobSchema.index({ job_title: 'text', job_description: 'text' })

// Index for company_id
JobSchema.index({ company_id: 1 })

// Index for job_post_status
JobSchema.index({ job_post_status: 1 })

// Index for job_closing_date
JobSchema.index({ job_closing_date: 1 })

/**
 * Pre-save Hook to Validate Screening Questions
 */
JobSchema.pre<IJob>('save', function (next) {
  // Additional validations can be placed here
  // For example, ensuring no duplicate options in multiple-choice questions
  for (const question of this.screening_questions) {
    if ((question.question_type === 'SC' || question.question_type === 'MC') && question.options) {
      const uniqueOptions = new Set(question.options)
      if (uniqueOptions.size !== question.options.length) {
        return next(new Error(`Duplicate options found in question: "${question.question}"`))
      }
    }
  }
  next()
})

/**
 * Job Model
 */
const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema)

export default Job

// // src/models/Job.ts

// import mongoose, { Document, Model, Schema, Types } from 'mongoose'
// import '@/models'

// /**
//  * Address Interface
//  */
// interface Address {
//   line1?: string
//   line2?: string
//   city?: string
//   province?: string
//   zip_code?: string
//   country?: string
// }

// /**
//  * Coordinates Interface
//  */
// interface Coordinates {
//   latitude: number
//   longitude: number
// }

// /**
//  * JobLocation Interface
//  */
// interface JobLocation {
//   address: Address
//   coordinates?: Coordinates
// }

// /**
//  * ScreeningQuestion Interface
//  */
// interface ScreeningQuestion {
//   question: string
//   correct_answer?: string
//   answers?: string[]
//   answer_type: 'Multiple Choice' | 'Text' | 'Range'
//   required: boolean
// }

// /**
//  * IJob Interface
//  */
// export interface IJob extends Document {
//   company_id: Types.ObjectId
//   job_title: string
//   job_description: string
//   job_type: 'Internship' | 'Full-Time' | 'Part-Time' | 'Contract'
//   job_location_type: 'On-Site' | 'Remote' | 'Hybrid'
//   job_level: 'Junior' | 'Senior' | 'Executive'
//   gender: 'Male' | 'Female' | 'Any'
//   job_closing_date: Date
//   job_post_type: 'Normal' | 'Urgent' | 'Premium'
//   skills: Types.ObjectId[]
//   job_location: JobLocation
//   video_url?: string
//   cv_send_email?: string
//   applied_users: Types.ObjectId[]
//   saved_users: Types.ObjectId[]
//   screening_questions: ScreeningQuestion[]
//   expired_at?: Date
//   job_post_status: 'Draft' | 'Live' | 'Expired'
//   created_at?: Date
//   updated_at?: Date
// }

// /**
//  * Address Schema
//  */
// const AddressSchema = new Schema<Address>(
//   {
//     line1: { type: String, required: false },
//     line2: { type: String, required: false },
//     city: { type: String, required: false },
//     province: { type: String, required: false },
//     zip_code: { type: String, required: false },
//     country: { type: String, required: false }
//   },
//   { _id: false }
// )

// /**
//  * Coordinates Schema
//  */
// const CoordinatesSchema = new Schema<Coordinates>(
//   {
//     latitude: { type: Number, required: false },
//     longitude: { type: Number, required: false }
//   },
//   { _id: false }
// )

// /**
//  * JobLocation Schema
//  */
// const JobLocationSchema = new Schema<JobLocation>(
//   {
//     address: { type: AddressSchema, required: false },
//     coordinates: { type: CoordinatesSchema, required: false }
//   },
//   { _id: false }
// )

// /**
//  * ScreeningQuestion Schema
//  */
// const ScreeningQuestionSchema = new Schema<ScreeningQuestion>(
//   {
//     question: { type: String, required: true },
//     correct_answer: { type: String },
//     answers: { type: [String] },
//     answer_type: { type: String, enum: ['Multiple Choice', 'Text', 'Range'], required: true },
//     required: { type: Boolean, default: false }
//   },
//   { _id: true }
// )

// /**
//  * Job Schema
//  */
// const JobSchema = new Schema<IJob>(
//   {
//     company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
//     job_title: { type: String, required: true },
//     job_description: { type: String, required: false },
//     job_type: { type: String, enum: ['Internship', 'Full-Time', 'Part-Time', 'Contract'], required: false },
//     job_location_type: { type: String, enum: ['On-Site', 'Remote', 'Hybrid'], required: false },
//     job_level: { type: String, enum: ['Junior', 'Senior', 'Executive'], required: false },
//     gender: { type: String, enum: ['Male', 'Female', 'Any'], required: false },
//     job_closing_date: { type: Date, required: false },
//     job_post_type: { type: String, enum: ['Normal', 'Urgent', 'Premium'], required: false, default: 'Normal' },
//     skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
//     job_location: { type: JobLocationSchema, required: false },
//     video_url: { type: String },
//     cv_send_email: { type: String },
//     applied_users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
//     saved_users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
//     screening_questions: { type: [ScreeningQuestionSchema], default: [] },
//     expired_at: { type: Date },
//     job_post_status: { type: String, enum: ['Draft', 'Live', 'Expired'], required: false, default: 'Draft' }
//   },
//   {
//     timestamps: true
//   }
// )

// /**
//  * Indexes for Optimized Queries
//  */
// // Text index for job_title and job_description
// JobSchema.index({ job_title: 'text', job_description: 'text' })

// // Index for company_id
// JobSchema.index({ company_id: 1 })

// // Index for job_post_status
// JobSchema.index({ job_post_status: 1 })

// // Index for job_closing_date
// JobSchema.index({ job_closing_date: 1 })

// /**
//  * Job Model
//  */
// const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema)

// export default Job
