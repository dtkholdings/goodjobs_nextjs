// src/views/Profile.tsx

'use client'

import React, { useState } from 'react'
import { Container } from '@mui/material'
import ProfileHeader from '@/views/profile/ProfileHeader'
import ProfessionalSummary from '@/views/profile/ProfessionalSummary'
import WorkExperience from '@/views/profile/WorkExperience'
import EducationSection from '@/views/profile/EducationSection'
import SkillsSection from '@/views/profile/SkillsSection'
import ProjectsSection from '@/views/profile/ProjectsSection'
import CertificationsSection from '@/views/profile/CertificationsSection'
import AwardsSection from '@/views/profile/AwardsSection'

const ProfilePage = () => {
  const [expandedSections, setExpandedSections] = useState({
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    awards: true
  })

  const handleToggle = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    console.log('Downloading PDF...')
    // Implement PDF download functionality here
  }

  const handleEdit = () => {
    console.log('Editing profile...')
    // Implement edit profile functionality here
  }

  const profile = {
    name: 'John Developer',
    title: 'Senior Frontend Engineer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    contact: {
      email: 'john.developer@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johndeveloper',
      github: 'github.com/johndeveloper'
    },
    summary:
      'Experienced frontend engineer with 8+ years of expertise in building scalable web applications. Passionate about creating intuitive user interfaces and implementing best practices in web development.',
    experience: [
      {
        company: 'Tech Solutions Inc.',
        companyLogo: 'https://example.com/logos/tech-solutions.png',
        jobType: 'Full-time',
        duration: '3 yrs 11 mos',
        roles: [
          {
            jobTitle: 'Senior Frontend Engineer',
            duration: 'Feb 2021 - Present',
            description: 'Led the development of enterprise-scale React applications, improving performance by 40%.',
            skills: ['React', 'TypeScript', 'Redux', 'JavaScript', 'CSS']
          },
          {
            jobTitle: 'Frontend Developer',
            duration: 'Jan 2019 - Jan 2021',
            description: 'Developed responsive web applications using modern JavaScript frameworks.',
            skills: ['JavaScript', 'React', 'HTML/CSS', 'Webpack']
          }
        ]
      },
      {
        company: 'Digital Innovations Co.',
        companyLogo: 'https://example.com/logos/digital-innovations.png',
        jobType: 'Contract',
        duration: '2 yrs 6 mos',
        roles: [
          {
            jobTitle: 'Frontend Developer',
            duration: 'Mar 2017 - Aug 2019',
            description: 'Created dynamic user interfaces and collaborated with backend teams to integrate APIs.',
            skills: ['JavaScript', 'Vue.js', 'HTML/CSS', 'RESTful APIs']
          }
        ]
      }
    ],
    education: [
      {
        institution: 'University of Technology',
        institutionLogo: 'https://example.com/logos/university-of-technology.png',
        degree: "Master's in Computer Science",
        duration: 'Jan 2020 - Sep 2024',
        grade: '3.8 GPA',
        skills: ['Machine Learning', 'Data Structures', 'Algorithms', 'Database Management']
      },
      {
        institution: 'Tech Institute',
        institutionLogo: 'https://example.com/logos/tech-institute.png',
        degree: "Bachelor's in Software Engineering",
        duration: 'Sep 2015 - Jun 2019',
        grade: '3.6 GPA',
        skills: ['JavaScript', 'React', 'Web Development', 'UI/UX Design']
      }
    ],
    skills: [
      { name: 'React', level: 95 },
      { name: 'JavaScript', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'HTML/CSS', level: 90 },
      { name: 'Node.js', level: 80 },
      { name: 'GraphQL', level: 75 }
    ],
    projects: [
      {
        title: 'E-commerce Platform',
        description: 'Built a fully functional e-commerce platform using React and Node.js',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c'
      },
      {
        title: 'Social Media Dashboard',
        description: 'Developed an analytics dashboard for social media metrics',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
      },
      {
        title: 'Healthcare App',
        description: 'Created a mobile-first healthcare appointment scheduling system',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d'
      },
      {
        title: 'Healthcare App',
        description: 'Created a mobile-first healthcare appointment scheduling system',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d'
      },
      {
        title: 'Healthcare App',
        description: 'Created a mobile-first healthcare appointment scheduling system',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d'
      }
    ],
    certifications: [
      {
        title: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'
      },
      {
        title: 'React Advanced Developer',
        issuer: 'Meta',
        date: '2022',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee'
      }
    ],
    awards: [
      {
        title: 'Best Innovation Award',
        organization: 'Tech Conference 2023',
        description: 'Recognized for innovative solution in web development',
        image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad'
      },
      {
        title: 'Excellence in Engineering',
        organization: 'Digital Summit 2022',
        description: 'Awarded for outstanding technical contributions',
        image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31'
      }
    ]
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <ProfileHeader
        name={profile.name}
        title={profile.title}
        image={profile.image}
        contact={profile.contact}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onEdit={handleEdit}
      />

      <ProfessionalSummary summary={profile.summary} />

      <WorkExperience
        experience={profile.experience}
        expanded={expandedSections.experience}
        onToggle={() => handleToggle('experience')}
      />

      <EducationSection
        education={profile.education}
        expanded={expandedSections.education}
        onToggle={() => handleToggle('education')}
      />

      <SkillsSection
        skills={profile.skills}
        expanded={expandedSections.skills}
        onToggle={() => handleToggle('skills')}
      />

      <ProjectsSection
        projects={profile.projects}
        expanded={expandedSections.projects}
        onToggle={() => handleToggle('projects')}
      />

      <CertificationsSection
        certifications={profile.certifications}
        expanded={expandedSections.certifications}
        onToggle={() => handleToggle('certifications')}
      />

      <AwardsSection
        awards={profile.awards}
        expanded={expandedSections.awards}
        onToggle={() => handleToggle('awards')}
      />
    </Container>
  )
}

export default ProfilePage
