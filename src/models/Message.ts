// src/models/Message.ts

import mongoose, { Document, Model, Schema, Types } from 'mongoose'

/**
 * IMessage Interface
 */
export interface IMessage extends Document {
  thread_id: Types.ObjectId // References MessageThreads collection
  sender_id: Types.ObjectId // References Users collection
  content: string
  attachments: string[] // URLs or paths
  status: string // 'Sent', 'Delivered', 'Read'
  created_at?: Date
  updated_at?: Date
}

/**
 * Message Schema
 */
const MessageSchema = new Schema<IMessage>(
  {
    thread_id: { type: Schema.Types.ObjectId, ref: 'MessageThread', required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: { type: [String], default: [] },
    status: { type: String, enum: ['Sent', 'Delivered', 'Read'], default: 'Sent' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

/**
 * Indexes for Optimized Queries
 */
MessageSchema.index({ thread_id: 1 })
MessageSchema.index({ sender_id: 1 })
MessageSchema.index({ status: 1 })

/**
 * Message Model
 */
const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)

export default Message
