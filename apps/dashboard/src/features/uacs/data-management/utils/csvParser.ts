/**
 * CSV parsing and validation utilities for UACS code imports
 */

export interface CSVParseResult {
  rows: Record<string, string>[]
  headers: string[]
  errors: string[]
  warnings: Warning[]
}

export interface Warning {
  row: number
  field: string
  message: string
}

export interface ValidationReportItem {
  row: number
  status: 'valid' | 'warning' | 'error'
  code?: string
  name?: string
  message?: string
}

/**
 * Parse CSV file content
 */
export function parseCSV(content: string): CSVParseResult {
  const lines = content.split('\n').filter((line) => line.trim())
  if (lines.length === 0) {
    return { rows: [], headers: [], errors: ['File is empty'], warnings: [] }
  }

  const headers = lines[0].split(',').map((h) => h.trim())
  const rows: Record<string, string>[] = []
  const errors: string[] = []
  const warnings: Warning[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`)
      continue
    }

    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })
    rows.push(row)
  }

  return { rows, headers, errors, warnings }
}

/**
 * Validate parsed CSV data for UACS codes
 */
export function validateCSVData(
  rows: Record<string, string>[],
  codeType: 'fundingSource' | 'organization' | 'location' | 'mfoPap' | 'objectCode'
): ValidationReportItem[] {
  const results: ValidationReportItem[] = []

  const codeLength: Record<string, number> = {
    fundingSource: 6,
    organization: 12,
    location: 9,
    mfoPap: 9,
    objectCode: 10,
  }

  const expectedLength = codeLength[codeType]

  rows.forEach((row, index) => {
    const rowNum = index + 2 // 1-indexed + header row
    const code = row.code || row.Code || ''
    const name = row.name || row.Name || ''

    const result: ValidationReportItem = {
      row: rowNum,
      status: 'valid',
      code,
      name,
    }

    // Validate code exists
    if (!code) {
      result.status = 'error'
      result.message = 'Code field is required'
      results.push(result)
      return
    }

    // Validate code length
    if (code.length !== expectedLength) {
      result.status = 'error'
      result.message = `Code must be ${expectedLength} digits (got ${code.length})`
      results.push(result)
      return
    }

    // Validate code is numeric
    if (!/^\d+$/.test(code)) {
      result.status = 'error'
      result.message = 'Code must contain only digits'
      results.push(result)
      return
    }

    // Validate name exists
    if (!name) {
      result.status = 'error'
      result.message = 'Name field is required'
      results.push(result)
      return
    }

    results.push(result)
  })

  return results
}

/**
 * Generate validation report summary
 */
export function generateValidationSummary(results: ValidationReportItem[]) {
  const valid = results.filter((r) => r.status === 'valid').length
  const warnings = results.filter((r) => r.status === 'warning').length
  const errors = results.filter((r) => r.status === 'error').length

  return {
    total: results.length,
    valid,
    warnings,
    errors,
    canImport: errors === 0,
  }
}
