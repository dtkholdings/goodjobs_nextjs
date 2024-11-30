// src/app/api/skills/route.ts

import { NextResponse } from 'next/server'
import connectToDatabase from '@/libs/mongodb'
import Skill from '@/models/Skill'

export async function GET(request: Request) {
  await connectToDatabase()

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  try {
    let skills
    if (query) {
      // Search skills based on query
      const regex = new RegExp(query, 'i') // Case-insensitive search
      skills = await Skill.find({ skill_name: regex }).limit(10)
    } else {
      // Return all skills or limit as necessary
      skills = await Skill.find().limit(100)
    }

    return NextResponse.json(skills)
  } catch (error) {
    console.error('Error fetching skills:', error)
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await connectToDatabase()

  const data = await request.json()
  const { skill_name } = data

  if (!skill_name) {
    return NextResponse.json({ error: 'Skill name is required' }, { status: 400 })
  }

  try {
    // Check if the skill already exists
    let skill = await Skill.findOne({ skill_name: skill_name })

    if (!skill) {
      // Create new skill
      skill = new Skill({ skill_name })
      await skill.save()
    }

    return NextResponse.json(skill)
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 })
  }
}
