// src/validators/user.ts

import { z } from 'zod'

export const updateUserSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  work_email: z.string().email().optional().nullable(),
  display_name: z.string().optional().nullable(),
  role: z.string().optional().default('User'),
  birthday: z.string().datetime().nullable().optional(),
  first_name: z.string().optional().nullable(),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  profile_picture: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
  resume: z.string().optional().nullable(),
  cover_letter: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  skills: z.array(z.string().nonempty()).optional().default([]),
  languages: z.array(z.string()).optional().nullable(),
  address: z
    .object({
      line1: z.string().optional().nullable(),
      line2: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      province: z.string().optional().nullable(),
      zip_code: z.string().optional().nullable(),
      country: z.string().optional().nullable()
    })
    .optional(),
  mobile_no: z.string().optional().nullable(),
  work_mobile_no: z.string().optional().nullable(),
  notification_method: z.string().optional().default('None'),
  education: z
    .array(
      z.object({
        degree_title: z.string().optional().nullable(),
        institute_name: z.string().optional().nullable(),
        field_of_study: z.string().optional().nullable(),
        start_date: z.string().datetime().nullable().optional().nullable(),
        end_date: z.string().datetime().nullable().optional().nullable(),
        skills: z.array(z.string()).optional().nullable(),
        description: z.string().optional().nullable()
      })
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        certification_name: z.string().optional().nullable(),
        certification_authority: z.string().optional().nullable(),
        obtained_date: z.string().datetime().nullable().optional().nullable(),
        expiry_date: z.string().datetime().nullable().optional().nullable(),
        credential_url: z.string().optional().nullable(),
        description: z.string().optional().nullable()
      })
    )
    .optional(),
  courses: z
    .array(
      z.object({
        course_name: z.string().optional().nullable(),
        institution: z.string().optional().nullable(),
        start_date: z.string().datetime().nullable().optional().nullable(),
        end_date: z.string().datetime().nullable().optional().nullable(),
        description: z.string().optional().nullable()
      })
    )
    .optional(),
  projects: z
    .array(
      z.object({
        project_name: z.string().optional().nullable(),
        client: z.string().optional().nullable(),
        start_date: z.string().datetime().optional().nullable(),
        end_date: z.string().datetime().optional().nullable(),
        skills_used: z.array(z.string()).optional().nullable(),
        description: z.string().optional().nullable()
      })
    )
    .optional(),
  awards: z
    .array(
      z.object({
        award_name: z.string().optional().nullable(),
        awarding_authority: z.string().optional().nullable(),
        award_received_date: z.string().datetime().optional().nullable(),
        description: z.string().optional().nullable()
      })
    )
    .optional(),
  reference_contacts: z
    .array(
      z.object({
        name: z.string().optional().nullable(),
        company: z.string().optional().nullable(),
        designation: z.string().optional().nullable(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable()
      })
    )
    .optional(),
  two_factor_auth: z
    .object({
      enabled: z.boolean().optional().nullable(),
      method: z.string().optional().nullable()
    })
    .optional(),
  profile_status: z.string().optional().default('Active')
})
