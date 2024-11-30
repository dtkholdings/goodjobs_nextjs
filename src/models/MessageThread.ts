// src/models/MessageThread.ts

import mongoose, { Document, Model, Schema, Types } from 'mongoose'

/**
 * LastMessage Interface
 */
interface LastMessage {
  content: string
  sender_id: Types.ObjectId // References Users collection
  created_at: Date
}

/**
 * IMessageThread Interface
 */
export interface IMessageThread extends Document {
  participants: Types.ObjectId[] // References Users collection
  deleted_by: Types.ObjectId[] // Users who have deleted the thread
  last_message: LastMessage
  created_at?: Date
  updated_at?: Date
}

/**
 * LastMessage Schema
 */
const LastMessageSchema = new Schema<LastMessage>(
  {
    content: { type: String, required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, required: true }
  },
  { _id: false }
)

/**
 * MessageThread Schema
 */
const MessageThreadSchema = new Schema<IMessageThread>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    deleted_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    last_message: { type: LastMessageSchema, required: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

/**
 * Indexes for Optimized Queries
 */
MessageThreadSchema.index({ participants: 1 })
MessageThreadSchema.index({ 'last_message.created_at': -1 })

/**
 * MessageThread Model
 */
const MessageThread: Model<IMessageThread> =
  mongoose.models.MessageThread || mongoose.model<IMessageThread>('MessageThread', MessageThreadSchema)

export default MessageThread
