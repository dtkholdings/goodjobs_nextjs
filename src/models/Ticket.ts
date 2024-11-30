// src/models/Ticket.ts

import mongoose, { Document, Model, Schema, Types } from 'mongoose'

/**
 * Comment Interface
 */
interface Comment {
  comment_id: Types.ObjectId
  comment_text: string
  commented_by: Types.ObjectId // References Users collection (Admins)
  commented_at: Date
}

/**
 * ITicket Interface
 */
export interface ITicket extends Document {
  ticket_id: string // Unique identifier
  admin_id: Types.ObjectId // References Users collection (Admins)
  issue_type: string // 'Bug', 'Feature Request', etc.
  priority: string // 'Low', 'Medium', 'High', 'Critical'
  status: string // 'Open', 'In Progress', 'Resolved', 'Closed'
  title: string
  description: string
  attachments: string[] // URLs or paths
  assigned_to?: Types.ObjectId // References Users collection (Admins)
  comments: Comment[]
  tags: string[]
  created_at?: Date
  updated_at?: Date
}

/**
 * Comment Schema
 */
const CommentSchema = new Schema<Comment>(
  {
    comment_id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    comment_text: { type: String, required: true },
    commented_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    commented_at: { type: Date, default: Date.now }
  },
  { _id: false }
)

/**
 * Ticket Schema
 */
const TicketSchema = new Schema<ITicket>(
  {
    ticket_id: { type: String, required: true, unique: true },
    admin_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    issue_type: { type: String, enum: ['Bug', 'Feature Request', 'Support', 'Other'], required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [{ type: String }],
    assigned_to: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: [CommentSchema],
    tags: [{ type: String }]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

/**
 * Indexes for Optimized Queries
 */
TicketSchema.index({ ticket_id: 1 })
TicketSchema.index({ admin_id: 1 })
TicketSchema.index({ assigned_to: 1 })
TicketSchema.index({ status: 1 })
TicketSchema.index({ priority: 1 })

/**
 * Ticket Model
 */
const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema)

export default Ticket
