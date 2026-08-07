/**
 * Mock internal agency employee list for the "Select Payee" dropdown in the
 * Employee Reimbursement payment method flow.
 *
 * TODO: Replace with a live API call (e.g. GET /api/employees?active=true)
 *       once the HR / Personnel module is integrated.
 */
export interface EmployeeOption {
  id: string
  name: string
  position: string
  office: string
}

export const EMPLOYEE_OPTIONS: EmployeeOption[] = [
  { id: 'emp-001', name: 'Maria Santos', position: 'Petty Cash Custodian', office: 'Finance Division' },
  { id: 'emp-002', name: 'Juan dela Cruz', position: 'Administrative Officer', office: 'Office A' },
  { id: 'emp-003', name: 'Ana Reyes', position: 'Budget Officer', office: 'Budget Division' },
  { id: 'emp-004', name: 'Carlos Mendoza', position: 'Procurement Officer', office: 'BAC Secretariat' },
  { id: 'emp-005', name: 'Liza Bautista', position: 'Supply Officer', office: 'Property & Supply' },
  { id: 'emp-006', name: 'Roberto Garcia', position: 'Accountant', office: 'Accounting Division' },
  { id: 'emp-007', name: 'Elena Flores', position: 'Department Head', office: 'Office A' },
]
