import { describe, expect, it } from 'vitest'
import { mockPpmpDatabase } from '../data/mockPpmpData'
import { buildDocumentHtml } from './ppmpDocumentExport'

describe('buildDocumentHtml', () => {
  it('renders the default Indicative status and stacked procurement metadata', () => {
    const html = buildDocumentHtml(mockPpmpDatabase[0], null)

    expect(html).toContain('Indicative')
    expect(html).toContain('title-status-box checked')
    expect(html).toContain('Project Type')
    expect(html).toContain('Goods')
    expect(html).toContain('Quantity and Size of the Project to be Procured')
    expect(html).toContain('A4, 70 GSM, 500 sheets per ream')
    expect(html).toContain('Pre-Procurement Conference')
    expect(html).toContain('Start of Procurement Activity')
    expect(html).toContain('01/2026')
    expect(html).toContain('End of Procurement Activity')
    expect(html).toContain('10/2026')
  })
})
