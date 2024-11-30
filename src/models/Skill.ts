// src/models/Skill.ts

import mongoose, { Document, Model, Schema } from 'mongoose'

/**
 * ISkill Interface
 */
export interface ISkill extends Document {
  skill_name: string
  created_at?: Date
  updated_at?: Date
}

/**
 * Skill Schema
 */
const SkillSchema = new Schema<ISkill>(
  {
    skill_name: { type: String, required: true, unique: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

/**
 * Indexes for Optimized Queries
 */
SkillSchema.index({ skill_name: 1 })

/**
 * Skill Model
 */
const Skill: Model<ISkill> = mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema)

export default Skill
