// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { LIBApprovalDialog } from './LIBApprovalDialog'

describe('LIBApprovalDialog', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders correctly for approve action and calls onConfirm when clicked', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <LIBApprovalDialog
        open={true}
        libName="IT Department Operating Budget"
        action="approve"
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={false}
      />,
    )

    expect(screen.getByText('Approve LIB?')).toBeDefined()
    expect(
      screen.getByText(/Are you sure you want to approve "IT Department Operating Budget"/),
    ).toBeDefined()

    const approveButton = screen.getByRole('button', { name: 'Approve' })
    fireEvent.click(approveButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('renders correctly for reject action and calls onConfirm when clicked', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <LIBApprovalDialog
        open={true}
        libName="IT Department Operating Budget"
        action="reject"
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={false}
      />,
    )

    expect(screen.getByText('Reject LIB?')).toBeDefined()
    expect(
      screen.getByText(/Are you sure you want to reject "IT Department Operating Budget"/),
    ).toBeDefined()

    const rejectButton = screen.getByRole('button', { name: 'Reject' })
    fireEvent.click(rejectButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancel button is clicked', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <LIBApprovalDialog
        open={true}
        libName="IT Department Operating Budget"
        action="approve"
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={false}
      />,
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelButton)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does not display dialog when open is false', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <LIBApprovalDialog
        open={false}
        libName="IT Department Operating Budget"
        action="approve"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    expect(screen.queryByText('Approve LIB?')).toBeNull()
  })

  it('disables buttons and shows Processing... when isLoading is true', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <LIBApprovalDialog
        open={true}
        libName="IT Department Operating Budget"
        action="approve"
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={true}
      />,
    )

    expect(screen.getByText('Processing...')).toBeDefined()
    const actionButton = screen.getByRole('button', { name: 'Processing...' })
    expect(actionButton.hasAttribute('disabled')).toBe(true)
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton.hasAttribute('disabled')).toBe(true)
  })
})
