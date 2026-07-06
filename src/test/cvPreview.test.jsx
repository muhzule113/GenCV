import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CVPreview from '../components/cv/CVPreview'

const sampleData = {
  personal: {
    name: 'Test User',
    jobTitle: 'Software Engineer',
    email: 'test@example.com',
    phone: '+62 812-3456-7890',
    city: 'Jakarta',
  },
  summary: 'A short professional summary.',
  experiences: [
    {
      position: 'Backend Developer',
      company: 'Acme',
      startDate: '2024-01',
      endDate: '2025-12',
      isCurrent: false,
      description: ['Built APIs', 'Wrote tests'],
    },
  ],
  educations: [
    { degree: 'S.Kom', field: 'Computer Science', institution: 'Universitas X', startYear: '2018', endYear: '2022', gpa: '3.85' },
  ],
  skills: {
    technical: ['Node.js', 'PostgreSQL', { name: 'React', level: 'advanced' }],
    soft: ['Communication'],
  },
  projects: [
    { name: 'GenCV', period: '2025', techStack: ['React', 'Vite'], description: 'CV generator' },
  ],
  certifications: [{ name: 'AWS CCP', issuer: 'AWS' }],
  languages: [{ name: 'Indonesian', level: 'native' }, { name: 'English', level: 'B2' }],
  publications: [{ authors: 'A, B', year: '2024', title: 'A study', venue: 'Journal X' }],
  organizations: [{ role: 'Lead', name: 'Dev Club', period: '2022', description: 'Ran workshops' }],
}

const ids = [
  'ats-clean-v1',
  'ats-modern-minimal-v1',
  'executive-serif-v1',
  'compact-onepage-v1',
  'sidebar-slim-v1',
  'academic-minimal-v1',
  'technical-minimal-v1',
  'fresh-graduate-minimal-v1',
  'timeline-minimal-v1',
  'two-tone-minimal-v1',
]

describe('CVPreview layouts', () => {
  for (const id of ids) {
    it(`renders ${id} without throwing`, () => {
      const { container } = render(<CVPreview templateId={id} data={sampleData} scale={1} />)
      expect(container.textContent).toContain('Test User')
    })
  }

  it('falls back to ATS Clean for unknown template ids', () => {
    const { container } = render(<CVPreview templateId="unknown-id" data={sampleData} scale={1} />)
    expect(container.textContent).toContain('Test User')
  })
})
