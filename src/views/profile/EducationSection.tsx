// src/components/EducationSection.tsx

import React from 'react'
import { Box, Typography, IconButton, Collapse, Avatar, Chip } from '@mui/material'
import { StyledPaper } from '@/styles/StyledComponents'

interface Education {
  institution: string
  institutionLogo: string
  degree: string
  duration: string
  grade: string
  skills: string[]
}

interface EducationSectionProps {
  education: Education[]
  expanded: boolean
  onToggle: () => void
}

const EducationSection: React.FC<EducationSectionProps> = ({ education, expanded, onToggle }) => {
  return (
    <StyledPaper elevation={3}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center' }}>
          <i className='ri-school-fill' style={{ marginRight: '8px', fontSize: '1.5rem' }} />
          Education
        </Typography>
        <IconButton onClick={onToggle} aria-label='Toggle education section'>
          {expanded ? <i className='ri-arrow-up-s-line' /> : <i className='ri-arrow-down-s-line' />}
        </IconButton>
      </Box>

      {/* Collapse Content */}
      <Collapse in={expanded}>
        <Box>
          {education.map((edu, index) => (
            <Box key={index} sx={{ mb: 6 }}>
              {/* Institution Details */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={edu.institutionLogo} alt={edu.institution} sx={{ width: 50, height: 50, mr: 2 }} />
                <Box>
                  <Typography variant='h6'>{edu.institution}</Typography>
                  <Typography variant='subtitle2' color='text.secondary'>
                    {edu.degree} &bull; {edu.duration}
                  </Typography>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Grade: {edu.grade}
                  </Typography>
                </Box>
              </Box>

              {/* Skills Timeline */}
              <Box sx={{ borderLeft: '2px solid #e0e0e0', paddingLeft: '25px', marginLeft: '25px' }}>
                <Box sx={{ position: 'relative', mb: 5 }}>
                  {/* Connector Dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '-34px',
                      top: '2px',
                      width: '16px',
                      height: '16px',
                      bgcolor: 'primary.main',
                      borderRadius: '50%'
                    }}
                  ></Box>

                  {/* Education Details */}
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {edu.degree}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    {edu.duration}
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 1 }}>
                    Grade: {edu.grade}
                  </Typography>
                  {/* Skills */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {edu.skills.map((skill, skillIndex) => (
                      <Chip key={skillIndex} label={skill} size='small' />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </StyledPaper>
  )
}

export default EducationSection

// // src/components/EducationSection.tsx

// import React from 'react'
// import { Box, Typography, IconButton, Collapse } from '@mui/material'
// import { StyledPaper } from '@/styles/StyledComponents'

// interface Education {
//   institution: string
//   degree: string
//   year: string
// }

// interface EducationSectionProps {
//   education: Education[]
//   expanded: boolean
//   onToggle: () => void
// }

// const EducationSection: React.FC<EducationSectionProps> = ({ education, expanded, onToggle }) => {
//   return (
//     <StyledPaper elevation={3}>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           mb: 2
//         }}
//       >
//         <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center' }}>
//           <i className='ri-school-fill' style={{ marginRight: '8px' }} />
//           Education
//         </Typography>
//         <IconButton onClick={onToggle} aria-label='Toggle education section'>
//           {expanded ? <i className='ri-arrow-up-s-line' /> : <i className='ri-arrow-down-s-line' />}
//         </IconButton>
//       </Box>
//       <Collapse in={expanded}>
//         {education.map((edu, index) => (
//           <Box key={index} sx={{ mb: 3 }}>
//             <Typography variant='subtitle1' fontWeight='bold'>
//               {edu.degree}
//             </Typography>
//             <Typography variant='body2' color='text.secondary'>
//               {edu.institution} - {edu.year}
//             </Typography>
//           </Box>
//         ))}
//       </Collapse>
//     </StyledPaper>
//   )
// }

// export default EducationSection
