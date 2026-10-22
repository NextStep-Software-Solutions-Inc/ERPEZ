// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ReturnPPMPDialog } from './ReturnPPMPDialog'
import type { PPMP } from '../types'

describe('ReturnPPMPDialog', () => {
  afterEach(() => {
    cleanup()
  })

  const mockPpmp: PPMP = {
    id: 'ppmp-123',
    documentName: 'IT Equipment Plan 2026',
    ppmpNumber: 'PPMP-2026-001',
    officeName: 'Information Technology Office',
    fiscalYearName: 'FY 2026',
    totalEstimatedBudget: 500000,
    status: 'Submitted',
  } as unknown as PPMP

  it('renders correctly when open with PPMP details', () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <ReturnPPMPDialog
        open={true}
        onOpenChange={onOpenChange}
        ppmp={mockPpmp}
        isSubmitting={false}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByText('Return PPMP for Revision')).toBeDefined()
    expect(screen.getByText('IT Equipment Plan 2026')).toBeDefined()
    expect(screen.getByText('Information Technology Office')).toBeDefined()
    expect(screen.getByText('FY 2026')).toBeDefined()
  })

  it('disables submit button when remarks is empty', () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <ReturnPPMPDialog
        open={true}
        onOpenChange={onOpenChange}
        ppmp={mockPpmp}
        isSubmitting={false}
        onConfirm={onConfirm}
      />,
    )

    const returnBtn = screen.getByRole('button', { name: /Return PPMP/i })
    expect(returnBtn.hasAttribute('disabled')).toBe(true)
  })

  it('calls onConfirm with remarks when feedback is provided and submitted', async () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <ReturnPPMPDialog
        open={true}
        onOpenChange={onOpenChange}
        ppmp={mockPpmp}
        isSubmitting={false}
        onConfirm={onConfirm}
      />,
    )

    const textarea = screen.getByPlaceholderText(/Detail what needs to be changed/i)
    fireEvent.change(textarea, {
      target: { value: 'Please revise the quantity for laptops in Q2.' },
    })

    const returnBtn = screen.getByRole('button', { name: /Return PPMP/i })
    expect(returnBtn.hasAttribute('disabled')).toBe(false)

    fireEvent.click(returnBtn)
    expect(onConfirm).toHaveBeenCalledWith(
      'Please revise the quantity for laptops in Q2.',
    )
  })

  it('calls onOpenChange(false) when Cancel is clicked', () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <ReturnPPMPDialog
        open={true}
        onOpenChange={onOpenChange}
        ppmp={mockPpmp}
        isSubmitting={false}
        onConfirm={onConfirm}
      />,
    )

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtn)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
