import { describe, it, expect } from 'vitest'
import { normalizeAPRStatus, matchesAPRStatus } from './normalizeAPRStatus'

describe('normalizeAPRStatus', () => {
  it('should normalize draft status variants', () => {
    expect(normalizeAPRStatus('Draft')).toBe('DRAFT')
    expect(normalizeAPRStatus('draft')).toBe('DRAFT')
    expect(normalizeAPRStatus('DRAFT')).toBe('DRAFT')
  })

  it('should normalize for approval / submitted variants', () => {
    expect(normalizeAPRStatus('ForApproval')).toBe('FOR_APPROVAL')
    expect(normalizeAPRStatus('forapproval')).toBe('FOR_APPROVAL')
    expect(normalizeAPRStatus('FOR_APPROVAL')).toBe('FOR_APPROVAL')
    expect(normalizeAPRStatus('for_approval')).toBe('FOR_APPROVAL')
    expect(normalizeAPRStatus('Submitted')).toBe('FOR_APPROVAL')
    expect(normalizeAPRStatus('submitted')).toBe('FOR_APPROVAL')
    expect(normalizeAPRStatus('SUBMITTED')).toBe('FOR_APPROVAL')
    expect(normalizeAPRStatus('Pending')).toBe('FOR_APPROVAL')
    expect(normalizeAPRStatus('pending')).toBe('FOR_APPROVAL')
  })

  it('should normalize approved status variants', () => {
    expect(normalizeAPRStatus('Approved')).toBe('APPROVED')
    expect(normalizeAPRStatus('approved')).toBe('APPROVED')
    expect(normalizeAPRStatus('APPROVED')).toBe('APPROVED')
  })

  it('should normalize returned status variants', () => {
    expect(normalizeAPRStatus('Returned')).toBe('RETURNED')
    expect(normalizeAPRStatus('returned')).toBe('RETURNED')
    expect(normalizeAPRStatus('RETURNED')).toBe('RETURNED')
  })

  it('should normalize partially available variants', () => {
    expect(normalizeAPRStatus('PartiallyAvailable')).toBe('PARTIALLY_AVAILABLE')
    expect(normalizeAPRStatus('partially_available')).toBe('PARTIALLY_AVAILABLE')
    expect(normalizeAPRStatus('PARTIALLY_AVAILABLE')).toBe('PARTIALLY_AVAILABLE')
    expect(normalizeAPRStatus('Partially Available')).toBe('PARTIALLY_AVAILABLE')
  })

  it('should normalize out of stock variants', () => {
    expect(normalizeAPRStatus('OutOfStock')).toBe('OUT_OF_STOCK')
    expect(normalizeAPRStatus('out_of_stock')).toBe('OUT_OF_STOCK')
    expect(normalizeAPRStatus('OUT_OF_STOCK')).toBe('OUT_OF_STOCK')
    expect(normalizeAPRStatus('Out of Stock')).toBe('OUT_OF_STOCK')
  })

  it('should return empty string for null/undefined', () => {
    expect(normalizeAPRStatus(null)).toBe('')
    expect(normalizeAPRStatus(undefined)).toBe('')
    expect(normalizeAPRStatus('')).toBe('')
  })
})

describe('matchesAPRStatus', () => {
  it('should match ALL / all / empty as true', () => {
    expect(matchesAPRStatus('Approved', 'ALL')).toBe(true)
    expect(matchesAPRStatus('ForApproval', 'all')).toBe(true)
    expect(matchesAPRStatus('Draft', '')).toBe(true)
    expect(matchesAPRStatus('Draft', undefined)).toBe(true)
  })

  it('should correctly match ForApproval against FOR_APPROVAL filter', () => {
    expect(matchesAPRStatus('ForApproval', 'FOR_APPROVAL')).toBe(true)
    expect(matchesAPRStatus('Submitted', 'FOR_APPROVAL')).toBe(true)
    expect(matchesAPRStatus('FOR_APPROVAL', 'FOR_APPROVAL')).toBe(true)
    expect(matchesAPRStatus('forapproval', 'FOR_APPROVAL')).toBe(true)
    expect(matchesAPRStatus('Approved', 'FOR_APPROVAL')).toBe(false)
    expect(matchesAPRStatus('Draft', 'FOR_APPROVAL')).toBe(false)
  })

  it('should correctly match Approved against APPROVED filter', () => {
    expect(matchesAPRStatus('Approved', 'APPROVED')).toBe(true)
    expect(matchesAPRStatus('approved', 'APPROVED')).toBe(true)
    expect(matchesAPRStatus('ForApproval', 'APPROVED')).toBe(false)
  })

  it('should correctly match Returned against RETURNED filter', () => {
    expect(matchesAPRStatus('Returned', 'RETURNED')).toBe(true)
    expect(matchesAPRStatus('returned', 'RETURNED')).toBe(true)
    expect(matchesAPRStatus('Approved', 'RETURNED')).toBe(false)
  })
})
