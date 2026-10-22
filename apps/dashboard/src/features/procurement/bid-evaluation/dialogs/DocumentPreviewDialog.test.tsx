// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { DocumentPreviewDialog } from './DocumentPreviewDialog'
import api from '@/services/api'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('DocumentPreviewDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders nothing when open is false', () => {
    render(
      <DocumentPreviewDialog
        open={false}
        onOpenChange={vi.fn()}
        document={{ name: 'Technical_Proposal.pdf', url: '/files/123' }}
      />,
    )
    expect(screen.queryByText('Technical_Proposal.pdf')).toBeNull()
  })

  it('renders iframe when previewing a PDF document', async () => {
    const pdfBlob = new Blob(['%PDF-1.4 mock content'], { type: 'application/pdf' })
    vi.mocked(api.get).mockResolvedValue({
      data: pdfBlob,
      headers: { 'content-type': 'application/pdf' },
    })

    render(
      <DocumentPreviewDialog
        open={true}
        onOpenChange={vi.fn()}
        document={{ id: '1', name: 'Technical_Proposal.pdf', url: '/files/download/123', type: 'pdf' }}
      />,
    )

    await waitFor(() => {
      const iframe = document.querySelector('iframe')
      expect(iframe).toBeDefined()
      expect(iframe?.getAttribute('src')).toBe('blob:mock-preview-url')
    })

    expect(screen.getByText('Technical_Proposal.pdf')).toBeDefined()
    expect(screen.getByText('PDF Document')).toBeDefined()
  })

  it('renders img when previewing an image document', async () => {
    const imgBlob = new Blob(['image data'], { type: 'image/png' })
    vi.mocked(api.get).mockResolvedValue({
      data: imgBlob,
      headers: { 'content-type': 'image/png' },
    })

    render(
      <DocumentPreviewDialog
        open={true}
        onOpenChange={vi.fn()}
        document={{ id: '2', name: 'Business_Permit.png', url: '/files/download/456', type: 'image/png' }}
      />,
    )

    await waitFor(() => {
      const img = document.querySelector('img')
      expect(img).toBeDefined()
      expect(img?.getAttribute('src')).toBe('blob:mock-preview-url')
    })

    expect(screen.getByText('Business_Permit.png')).toBeDefined()
    expect(screen.getByText('Image Document')).toBeDefined()
  })

  it('renders non-previewable file card with download button for DOCX/XLSX', async () => {
    const docxBlob = new Blob(['docx data'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    vi.mocked(api.get).mockResolvedValue({
      data: docxBlob,
      headers: {
        'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    })

    render(
      <DocumentPreviewDialog
        open={true}
        onOpenChange={vi.fn()}
        document={{ id: '3', name: 'Financial_Schedule.docx', url: '/files/download/789', type: 'docx' }}
      />,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Inline preview is not supported for this file format/),
      ).toBeDefined()
    })

    expect(screen.getByRole('button', { name: /Download Document/i })).toBeDefined()
  })
})
