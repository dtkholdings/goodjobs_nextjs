// src/views/Profile.tsx

'use client'

import React, { useState } from 'react'
import { Container } from '@mui/material'
import ProfileHeader from './ProfileHeader'
import ProfessionalSummary from './ProfessionalSummary'
import WorkExperience from './WorkExperience'
import EducationSection from './EducationSection'
import SkillsSection from './SkillsSection'
import ProjectsSection from './ProjectsSection'
import CertificationsSection from './CertificationsSection'
import AwardsSection from './AwardsSection'

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
        role: 'Senior Frontend Engineer',
        period: '2020 - Present',
        description: 'Led development of enterprise-scale React applications, improving performance by 40%.'
      },
      {
        company: 'Digital Innovations Co.',
        role: 'Frontend Developer',
        period: '2017 - 2020',
        description: 'Developed responsive web applications using modern JavaScript frameworks.'
      }
    ],
    education: [
      {
        institution: 'University of Technology',
        degree: "Master's in Computer Science",
        year: '2017'
      },
      {
        institution: 'Tech Institute',
        degree: "Bachelor's in Software Engineering",
        year: '2015'
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
