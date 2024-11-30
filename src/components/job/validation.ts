// Path: src/components/job/validation.ts

import * as Yup from 'yup'

/**
 * ScreeningQuestion Validation Schema
 */
const ScreeningQuestionSchema = Yup.object().shape({
  question: Yup.string().required('Question is required'),
  answer_type: Yup.string()
    .oneOf(['Multiple Choice', 'Text', 'Range'], 'Select a valid answer type')
    .required('Answer Type is required'),
  required: Yup.boolean().required('Required flag is required'),
  correct_answer: Yup.string().when('answer_type', {
    is: 'Text',
    then: () => Yup.string().required('Correct answer is required for Text type'),
    otherwise: () => Yup.string().notRequired()
  }),
  answers: Yup.array()
    .of(Yup.string())
    .when('answer_type', {
      is: (val: string) => val === 'Multiple Choice',
      then: () => Yup.array().min(2, 'At least two answers are required').required('Answers are required'),
      otherwise: () => Yup.array().notRequired()
    })
})

/**
 * Job Validation Schema
 */
export const JobSchema = Yup.object().shape({
  company_id: Yup.string()
    .required('Company ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid Company ID'),
  job_title: Yup.string().required('Job Title is required'),
  job_description: Yup.string(),
  job_type: Yup.string()
    .oneOf(['Internship', 'Full-Time', 'Part-Time', 'Contract'], 'Select a valid job type')
    .required('Job Type is required'),
  job_location_type: Yup.string()
    .oneOf(['On-Site', 'Remote', 'Hybrid'], 'Select a valid location type')
    .required('Job Location Type is required'),
  job_level: Yup.string()
    .oneOf(['Junior', 'Senior', 'Executive'], 'Select a valid job level')
    .required('Job Level is required'),
  gender: Yup.string()
    .oneOf(['Male', 'Female', 'Any'], 'Select a valid gender preference')
    .required('Gender preference is required'),
  job_closing_date: Yup.date()
    .required('Job Closing Date is required')
    .min(new Date(), 'Closing date cannot be in the past'),
  job_post_type: Yup.string()
    .oneOf(['Normal', 'Urgent', 'Premium'], 'Select a valid post type')
    .required('Job Post Type is required'),
  skills: Yup.array()
    .of(Yup.string().matches(/^[0-9a-fA-F]{24}$/, 'Invalid Skill ID'))
    .max(10, 'You can select up to 10 skills')
    .required('Skills are required'),
  video_url: Yup.string().url('Must be a valid URL').optional(),
  cv_send_email: Yup.string().email('Must be a valid email').optional(),

  job_location: Yup.object().shape({
    address: Yup.object().when('job_location_type', {
      is: 'Different Location',
      then: () =>
        Yup.object({
          line1: Yup.string().required('Address Line 1 is required'),
          line2: Yup.string(),
          city: Yup.string().required('City is required'),
          province: Yup.string().required('Province is required'),
          zip_code: Yup.string().required('Zip Code is required'),
          country: Yup.string().required('Country is required')
        }),
      otherwise: () =>
        Yup.object({
          line1: Yup.string(),
          line2: Yup.string(),
          city: Yup.string(),
          province: Yup.string(),
          zip_code: Yup.string(),
          country: Yup.string()
        })
    }),
    coordinates: Yup.object()
      .shape({
        latitude: Yup.number().typeError('Latitude must be a number'),
        longitude: Yup.number().typeError('Longitude must be a number')
      })
      .optional()
  }),
  screening_questions: Yup.array().of(ScreeningQuestionSchema).max(10, 'You can add up to 10 screening questions')
})
