import mongoose, { Document, Model, Schema, Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import SkillModel from '@/models/Skill' // Import the Skill model here

/**
 * Address Interface
 */
interface Address {
  line1: string
  line2?: string
  city?: string
  province?: string
  zip_code?: string
  country?: string
}

/**
 * Education Interface
 */
interface Education {
  degree_title: string
  institute_name: string
  field_of_study: string
  start_date: Date
  end_date: Date
  skills: Types.ObjectId[] // References Skills collection
  description?: string
}

/**
 * Certification Interface
 */
interface Certification {
  certification_name: string
  certification_authority: string
  obtained_date: Date
  expiry_date?: Date
  credential_url?: string
  description?: string
}

/**
 * Course Interface
 */
interface Course {
  course_name: string
  institution: string
  start_date: Date
  end_date: Date
  description?: string
}

/**
 * Project Interface
 */
interface Project {
  project_name: string
  client?: string
  start_date: Date
  end_date: Date
  description?: string
  skills_used: Types.ObjectId[] // References Skills collection
}

/**
 * Award Interface
 */
interface Award {
  award_name: string
  awarding_authority: string
  award_received_date: Date
  description?: string
}

/**
 * ReferenceContact Interface
 */
interface ReferenceContact {
  name: string
  company?: string
  designation?: string
  email?: string
  phone?: string
}

/**
 * Subscription Interface
 */
interface Subscription {
  package_id: Types.ObjectId // References Subscriptions collection
  activated_date: Date
  expiry_date: Date
  status: string // 'Active', 'Expired', etc.
}

/**
 * TwoFactorAuth Interface
 */
interface TwoFactorAuth {
  enabled: boolean
  method: string // 'Email', 'AuthenticatorApp'
  secret?: string // For Authenticator Apps
}

/**
 * INotificationSetting Interface
 */
interface INotificationSetting {
  type: string
  email: boolean
  browser: boolean
  app: boolean
}

/**
 * IUser Interface
 */
export interface IUser extends Document {
  _id: Types.ObjectId
  username: string
  email: string
  emailVerified?: Date
  work_email?: string
  display_name?: string
  role: string // e.g., 'User', 'Admin'
  password: string // Add this line
  birthday?: Date
  first_name?: string
  middle_name?: string
  last_name?: string
  profile_picture?: string // URL or path
  cover_image?: string // URL or path
  resume?: string // URL or path to attachment
  cover_letter?: string // URL or path to attachment
  gender?: string // e.g., 'Male', 'Female', 'Other'
  skills: mongoose.Types.ObjectId[] // References Skills collection
  languages: string[]
  address?: Address
  mobile_no?: string
  work_mobile_no?: string
  notification_method?: string // 'None', 'SMS', 'Email'
  education: Education[]
  credits?: number
  ai_credits?: number
  certifications: Certification[]
  courses: Course[]
  projects: Project[]
  awards: Award[]
  profile_completeness?: number // Percentage (0-100)
  reference_contacts: ReferenceContact[]
  profile_status?: string // e.g., 'Active', 'Inactive'
  applied_jobs: Types.ObjectId[] // References Jobs collection
  saved_jobs: Types.ObjectId[] // References Jobs collection
  viewed_jobs: Types.ObjectId[] // References Jobs collection
  subscription?: Subscription
  otp?: string
  otp_expiry?: Date
  two_factor_auth?: TwoFactorAuth
  notificationSettings: INotificationSetting[]
  notificationSendTime: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  twoFactorEnabled: boolean
  twoFactorMethod: 'email' | 'authenticator' | ''
  twoFactorSecret?: string // For Authenticator App
  twoFactorOTP?: string // For Email OTP
  twoFactorOTPExpiry?: Date
}

/**
 * Address Schema
 */
const AddressSchema = new Schema<Address>(
  {
    line1: { type: String },
    line2: String,
    city: String,
    province: String,
    zip_code: String,
    country: String
  },
  { _id: false }
)

/**
 * Education Schema
 */
const EducationSchema = new Schema<Education>(
  {
    degree_title: { type: String },
    institute_name: { type: String },
    field_of_study: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    description: String
  },
  { _id: true }
)

/**
 * Certification Schema
 */
const CertificationSchema = new Schema<Certification>(
  {
    certification_name: { type: String },
    certification_authority: { type: String },
    obtained_date: { type: Date },
    expiry_date: Date,
    credential_url: String,
    description: String
  },
  { _id: true }
)

/**
 * Course Schema
 */
const CourseSchema = new Schema<Course>(
  {
    course_name: { type: String },
    institution: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
    description: String
  },
  { _id: true }
)

/**
 * Project Schema
 */
const ProjectSchema = new Schema<Project>(
  {
    project_name: { type: String },
    client: String,
    start_date: { type: Date },
    end_date: { type: Date },
    description: String,
    skills_used: [{ type: Schema.Types.ObjectId, ref: 'Skill' }]
  },
  { _id: true }
)

/**
 * Award Schema
 */
const AwardSchema = new Schema<Award>(
  {
    award_name: { type: String },
    awarding_authority: { type: String },
    award_received_date: { type: Date },
    description: String
  },
  { _id: true }
)

/**
 * ReferenceContact Schema
 */
const ReferenceContactSchema = new Schema<ReferenceContact>(
  {
    name: { type: String },
    company: String,
    designation: String,
    email: String,
    phone: String
  },
  { _id: true }
)

/**
 * Subscription Schema
 */
const SubscriptionSchema = new Schema<Subscription>(
  {
    package_id: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    activated_date: { type: Date },
    expiry_date: { type: Date },
    status: { type: String }
  },
  { _id: false }
)

/**
 * TwoFactorAuth Schema
 */
const TwoFactorAuthSchema = new Schema<TwoFactorAuth>(
  {
    enabled: { type: Boolean },
    method: { type: String, enum: ['Email', 'AuthenticatorApp'] },
    secret: String
  },
  { _id: false }
)

/**
 * NotificationSettings Schema
 */
const NotificationSettingSchema = new Schema<INotificationSetting>({
  type: { type: String },
  email: { type: Boolean, default: false },
  browser: { type: Boolean, default: false },
  app: { type: Boolean, default: false }
})

/**
 * User Schema
 */
const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date },
    work_email: String,
    display_name: String,
    role: { type: String, default: 'User' }, // e.g., 'User', 'Admin'
    password: { type: String, required: true, select: false },
    birthday: Date,
    first_name: String,
    middle_name: String,
    last_name: String,
    profile_picture: { type: String },
    cover_image: String,
    resume: String,
    cover_letter: String,
    gender: String,
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    languages: [String],
    address: AddressSchema,
    mobile_no: String,
    work_mobile_no: String,
    notification_method: { type: String, enum: ['None', 'SMS', 'Email'], default: 'None' },
    education: [EducationSchema],
    credits: { type: Number, default: 0 },
    ai_credits: { type: Number, default: 0 },
    certifications: [CertificationSchema],
    courses: [CourseSchema],
    projects: [ProjectSchema],
    awards: [AwardSchema],
    profile_completeness: { type: Number, default: 0 },
    reference_contacts: [ReferenceContactSchema],
    profile_status: { type: String, default: 'Active' },
    applied_jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    saved_jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    viewed_jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    subscription: SubscriptionSchema,
    otp: { type: String },
    otp_expiry: { type: Date },
    two_factor_auth: TwoFactorAuthSchema,
    notificationSettings: { type: [NotificationSettingSchema], default: [] },
    notificationSendTime: { type: String, default: 'online' },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ['email', 'authenticator', ''], default: '' },
    twoFactorSecret: { type: String },
    twoFactorOTP: { type: String },
    twoFactorOTPExpiry: { type: Date }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
)

// Pre-save hook to hash passwords
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err as any)
  }
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
