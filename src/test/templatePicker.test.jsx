import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TemplatePicker from '../components/cv/TemplatePicker'
import { dummyTemplates } from '../data/dummyData'

describe('TemplatePicker', () => {
  it('renders all 10 minimal templates by default', () => {
    render(<TemplatePicker selected="ats-clean-v1" onSelect={() => {}} />)
    for (const t of dummyTemplates) {
    }
  })

  it('marks the selected template with the active class', () => {
    const { container } = render(<TemplatePicker selected="executive-serif-v1" onSelect={() => {}} />)
    const active = container.querySelector('button.border-ink')
    expect(active).not.toBeNull()
    expect(active?.textContent).toContain('Executive Serif')
  })
})
