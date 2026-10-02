import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  numberToPhilippinePesoWords,
  mapProcurementMode,
  mapTypeOfPo,
  generatePurchaseOrderPrintHTML,
} from './printPurchaseOrder'
import type { PurchaseOrder } from '../types'

describe('printPurchaseOrder utilities', () => {
  describe('formatCurrency', () => {
    it('formats numbers to Philippine Peso currency string', () => {
      expect(formatCurrency(49000)).toBe('₱ 49,000.00')
      expect(formatCurrency(1234.56)).toBe('₱ 1,234.56')
      expect(formatCurrency(0)).toBe('₱ 0.00')
      expect(formatCurrency(null)).toBe('₱ 0.00')
      expect(formatCurrency(undefined)).toBe('₱ 0.00')
    })
  })

  describe('numberToPhilippinePesoWords', () => {
    it('converts whole peso amounts accurately matching COA Appendix 61 sample', () => {
      expect(numberToPhilippinePesoWords(49000)).toBe(
        'FORTY-NINE THOUSAND PESOS ONLY***********'
      )
      expect(numberToPhilippinePesoWords(1000000)).toBe(
        'ONE MILLION PESOS ONLY***********'
      )
      expect(numberToPhilippinePesoWords(500)).toBe('FIVE HUNDRED PESOS ONLY***********')
    })

    it('converts peso amounts with centavos accurately', () => {
      expect(numberToPhilippinePesoWords(49000.5)).toBe(
        'FORTY-NINE THOUSAND PESOS AND 50/100 ONLY***********'
      )
      expect(numberToPhilippinePesoWords(125.75)).toBe(
        'ONE HUNDRED TWENTY-FIVE PESOS AND 75/100 ONLY***********'
      )
    })

    it('handles zero gracefully', () => {
      expect(numberToPhilippinePesoWords(0)).toBe('ZERO PESOS ONLY***********')
    })
  })

  describe('mapProcurementMode', () => {
    it('maps SVP to official section 53.9 designation', () => {
      expect(mapProcurementMode('SVP')).toBe(
        'Negotiated Procurement - Small Value Procurement (Sec. 53.9)'
      )
      expect(mapProcurementMode('svp')).toBe(
        'Negotiated Procurement - Small Value Procurement (Sec. 53.9)'
      )
    })

    it('maps Public Bidding to section 10 designation', () => {
      expect(mapProcurementMode('PUBLIC_BIDDING')).toBe(
        'Competitive Public Bidding (Sec. 10)'
      )
    })

    it('maps Direct Acquisition to section 50 designation', () => {
      expect(mapProcurementMode('DIRECT_ACQUISITION')).toBe(
        'Direct Acquisition / Direct Contracting (Sec. 50)'
      )
    })
  })

  describe('mapTypeOfPo', () => {
    it('returns correct shorthand label', () => {
      expect(mapTypeOfPo('SVP')).toBe('SVP')
      expect(mapTypeOfPo('public-bidding')).toBe('Public Bidding')
      expect(mapTypeOfPo('direct-acquisition')).toBe('Direct Acquisition')
    })
  })

  describe('generatePurchaseOrderPrintHTML', () => {
    const mockPo: PurchaseOrder = {
      id: 'po-123',
      poNumber: 'PO-2023-11-0240',
      date: '2023-11-27',
      procurementMode: 'SVP',
      source: 'svp',
      status: 'Draft',
      supplierName: 'Acme Technologies Inc.',
      supplierAddress: '123 Tech Blvd, Cagayan de Oro City',
      supplierTin: '123-456-789-000',
      placeOfDelivery: 'USTP CDO Campus, Supply Office',
      dateOfDelivery: '2023-12-15',
      deliveryTerm: 'Within 30 Calendar Days',
      paymentTerm: 'LDDAP-ADA',
      totalAmount: 49000,
      approvedBy: 'Dr. Jane Doe, HOPE',
      lineItems: [
        {
          id: 'item-1',
          description: 'Table and 4 Chairs',
          quantity: 1,
          unit: 'box',
          unitPrice: 49000,
          amount: 49000,
        },
      ],
    }

    it('generates HTML containing all dynamically mapped fields', () => {
      const html = generatePurchaseOrderPrintHTML(mockPo)

      // Header & Standard
      expect(html).toContain('Appendix 61')
      expect(html).toContain('PURCHASE ORDER')

      // PO & Supplier Metadata
      expect(html).toContain('PO-2023-11-0240')
      expect(html).toContain('Acme Technologies Inc.')
      expect(html).toContain('123 Tech Blvd, Cagayan de Oro City')
      expect(html).toContain('123-456-789-000')
      expect(html).toContain('Negotiated Procurement - Small Value Procurement (Sec. 53.9)')

      // Delivery & Payment
      expect(html).toContain('USTP CDO Campus, Supply Office')
      expect(html).toContain('Within 30 Calendar Days')
      expect(html).toContain('LDDAP-ADA')

      // Items & Totals
      expect(html).toContain('Table and 4 Chairs')
      expect(html).toContain('box')
      expect(html).toContain('₱ 49,000.00')
      expect(html).toContain('***NOTHING FOLLOWS***')
      expect(html).toContain('FORTY-NINE THOUSAND PESOS ONLY***********')

      // Penalty Clause
      expect(html).toContain('one-tenth (1/10) of one percent for every day of delay')

      // Signatories
      expect(html).toContain('Conforme:')
      expect(html).toContain('Very truly yours,')
      expect(html).toContain('Dr. Jane Doe, HOPE')
      expect(html).toContain('Funds Available :')

      // Agency Name fallback & No Logo
      expect(html).toContain('<h2>Agency Name</h2>')
      expect(html).not.toContain('po-header-logo-container')
      expect(html).not.toContain('po-header-logo-svg')
    })

    it('filters out SuperAdmin Workspace and USTP to fallback to Agency Name', () => {
      const htmlSuperAdmin = generatePurchaseOrderPrintHTML(mockPo, {
        entityName: 'SuperAdmin Workspace',
      })
      expect(htmlSuperAdmin).toContain('<h2>Agency Name</h2>')
      expect(htmlSuperAdmin).not.toContain('SuperAdmin')

      const htmlUstp = generatePurchaseOrderPrintHTML(mockPo, {
        entityName: 'USTP',
      })
      expect(htmlUstp).toContain('<h2>Agency Name</h2>')
      expect(htmlUstp).not.toContain('<h2>USTP</h2>')
    })

    it('renders specific valid agency name when passed via options', () => {
      const html = generatePurchaseOrderPrintHTML(mockPo, {
        entityName: 'Department of Science and Technology',
      })
      expect(html).toContain('<h2>Department of Science and Technology</h2>')
      expect(html).not.toContain('<h2>Agency Name</h2>')
    })
  })
})
