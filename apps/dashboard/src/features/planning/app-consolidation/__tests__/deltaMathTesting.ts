/**
 * Delta Math Testing Utilities - Task 3.5
 * Test suite for verifying delta extraction correctness
 * Ensures: No double-counting, proper quantity calculations, data integrity
 *
 * Location: __tests__/ (test utilities, excluded from production bundle)
 */

import { calculateLineItemDelta, validateDeltaItems } from '../utils/deltaCalculator'
import type { PPMPItem } from '../types'

/**
 * Test Case 1: Simple addition (no items in original)
 */
export function testDeltaMathCase1_SimpleAddition() {
  const original: PPMPItem[] = []
  const amended: PPMPItem[] = [
    {
      id: '1',
      code: 'ITEM-001',
      description: 'Laptops',
      unit: 'unit',
      quantity: 5,
      unitCost: 50000,
      totalAmount: 250000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
  ]

  const delta = calculateLineItemDelta(original, amended)
  const validation = validateDeltaItems(delta)

  return {
    testName: 'Simple Addition (No Original Items)',
    expected: { itemCount: 1, isNewItem: true, deltaQuantity: 5, totalAmount: 250000 },
    actual: {
      itemCount: delta.length,
      isNewItem: delta[0]?.isNewItem,
      deltaQuantity: delta[0]?.deltaQuantity,
      totalAmount: delta[0]?.totalAmount,
    },
    passed: validation.isValid && delta.length === 1 && delta[0]?.deltaQuantity === 5,
    errors: validation.errors,
  }
}

/**
 * Test Case 2: Quantity increase (amended has more than original)
 * Original: 10 Laptops
 * Amended: 12 Laptops
 * Expected Delta: 2 Laptops
 */
export function testDeltaMathCase2_QuantityIncrease() {
  const original: PPMPItem[] = [
    {
      id: '1',
      code: 'ITEM-001',
      description: 'Laptops',
      unit: 'unit',
      quantity: 10,
      unitCost: 50000,
      totalAmount: 500000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
  ]

  const amended: PPMPItem[] = [
    {
      id: '1',
      code: 'ITEM-001',
      description: 'Laptops',
      unit: 'unit',
      quantity: 12,
      unitCost: 50000,
      totalAmount: 600000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
  ]

  const delta = calculateLineItemDelta(original, amended)
  const validation = validateDeltaItems(delta)

  return {
    testName: 'Quantity Increase (10 → 12)',
    expected: { itemCount: 1, isNewItem: false, deltaQuantity: 2, totalAmount: 100000 },
    actual: {
      itemCount: delta.length,
      isNewItem: delta[0]?.isNewItem,
      deltaQuantity: delta[0]?.deltaQuantity,
      totalAmount: delta[0]?.totalAmount,
    },
    passed: validation.isValid && delta.length === 1 && delta[0]?.deltaQuantity === 2,
    errors: validation.errors,
  }
}

/**
 * Test Case 3: Quantity decrease (should be excluded from delta)
 * Original: 10 Laptops
 * Amended: 8 Laptops
 * Expected Delta: None (excluded)
 */
export function testDeltaMathCase3_QuantityDecrease() {
  const original: PPMPItem[] = [
    {
      id: '1',
      code: 'ITEM-001',
      description: 'Laptops',
      unit: 'unit',
      quantity: 10,
      unitCost: 50000,
      totalAmount: 500000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
  ]

  const amended: PPMPItem[] = [
    {
      id: '1',
      code: 'ITEM-001',
      description: 'Laptops',
      unit: 'unit',
      quantity: 8,
      unitCost: 50000,
      totalAmount: 400000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
  ]

  const delta = calculateLineItemDelta(original, amended)
  const validation = validateDeltaItems(delta)

  return {
    testName: 'Quantity Decrease (10 → 8, should be excluded)',
    expected: { itemCount: 0 },
    actual: { itemCount: delta.length },
    passed: delta.length === 0, // Decreases should be excluded
    errors: validation.errors,
  }
}

/**
 * Test Case 4: Complex mix (additions, new items, and decreases)
 * Original: 10 Laptops + 5 Monitors
 * Amended: 12 Laptops + 5 Monitors + 3 Printers (new)
 * Expected Delta: 2 Laptops (addition) + 3 Printers (new), Monitor excluded (no change)
 */
export function testDeltaMathCase4_ComplexMix() {
  const original: PPMPItem[] = [
    {
      id: '1',
      code: 'ITEM-001',
      description: 'Laptops',
      unit: 'unit',
      quantity: 10,
      unitCost: 50000,
      totalAmount: 500000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
    {
      id: '2',
      code: 'ITEM-002',
      description: 'Monitors',
      unit: 'unit',
      quantity: 5,
      unitCost: 15000,
      totalAmount: 75000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
  ]

  const amended: PPMPItem[] = [
    {
      id: '1',
      code: 'ITEM-001',
      description: 'Laptops',
      unit: 'unit',
      quantity: 12,
      unitCost: 50000,
      totalAmount: 600000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
    {
      id: '2',
      code: 'ITEM-002',
      description: 'Monitors',
      unit: 'unit',
      quantity: 5,
      unitCost: 15000,
      totalAmount: 75000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
    {
      id: '3',
      code: 'ITEM-003',
      description: 'Printers',
      unit: 'unit',
      quantity: 3,
      unitCost: 25000,
      totalAmount: 75000,
      modeOfProcurement: 'Competitive Bidding',
      allotmentClass: 'CO',
    },
  ]

  const delta = calculateLineItemDelta(original, amended)
  const validation = validateDeltaItems(delta)

  // Filter for results
  const laptopDelta = delta.find((d) => d.code === 'ITEM-001')
  const monitorDelta = delta.find((d) => d.code === 'ITEM-002')
  const printerDelta = delta.find((d) => d.code === 'ITEM-003')

  return {
    testName: 'Complex Mix (Additions + New Items + No Change)',
    expected: {
      itemCount: 2, // 2 Laptops (added) + 3 Printers (new)
      hasLaptops: true,
      hasPrinters: true,
      noMonitors: true, // No change so excluded
      totalAmount: 100000 + 75000, // 2 laptops @ 50k + 3 printers @ 25k
    },
    actual: {
      itemCount: delta.length,
      hasLaptops: !!laptopDelta,
      hasPrinters: !!printerDelta,
      noMonitors: !monitorDelta,
      totalAmount: delta.reduce((sum, d) => sum + d.totalAmount, 0),
    },
    passed:
      validation.isValid &&
      delta.length === 2 &&
      laptopDelta?.deltaQuantity === 2 &&
      printerDelta?.isNewItem === true &&
      !monitorDelta,
    errors: validation.errors,
  }
}

/**
 * Run all delta math tests
 */
export function runAllDeltaMathTests() {
  const tests = [
    testDeltaMathCase1_SimpleAddition(),
    testDeltaMathCase2_QuantityIncrease(),
    testDeltaMathCase3_QuantityDecrease(),
    testDeltaMathCase4_ComplexMix(),
  ]

  return {
    summary: {
      total: tests.length,
      passed: tests.filter((t) => t.passed).length,
      failed: tests.filter((t) => !t.passed).length,
    },
    tests,
    allPassed: tests.every((t) => t.passed),
  }
}

/**
 * Print test results to console
 */
export function printDeltaMathTestResults() {
  const results = runAllDeltaMathTests()

  console.group('🧪 Delta Math Test Suite')
  console.log(`Total Tests: ${results.summary.total}`)
  console.log(`✅ Passed: ${results.summary.passed}`)
  console.log(`❌ Failed: ${results.summary.failed}`)

  results.tests.forEach((test, index) => {
    console.group(`Test ${index + 1}: ${test.testName}`)
    console.log(`Status: ${test.passed ? '✅ PASSED' : '❌ FAILED'}`)
    console.log('Expected:', test.expected)
    console.log('Actual:', test.actual)
    if (test.errors?.length) {
      console.error('Errors:', test.errors)
    }
    console.groupEnd()
  })

  console.log(`\nOverall: ${results.allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`)
  console.groupEnd()

  return results.allPassed
}
