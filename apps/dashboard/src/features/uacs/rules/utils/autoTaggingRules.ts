/**
 * Expense Class Auto-Tagging Utilities
 * Provides logic for automatically assigning expense classes based on Object Code prefixes
 */

import { ExpenseClass } from "../../code-segments/types/commonTypes"


export type AutoTagRule = {
  prefix: string
  expenseClass: ExpenseClass
  description: string
}

/**
 * Default auto-tagging rules based on Object Code prefixes
 * Per Philippine Budget Classification Standards:
 * - 501* → PS (Personal Services)
 * - 502* → MOOE (Maintenance and Other Operating Expenses)
 * - 503* → FE (Financial Expenses)
 * - 106* → CO (Capital Outlay)
 */
export const DEFAULT_AUTO_TAG_RULES: AutoTagRule[] = [
  {
    prefix: '501',
    expenseClass: ExpenseClass.PS,
    description: 'Personal Services (Salaries, Benefits)',
  },
  {
    prefix: '502',
    expenseClass: ExpenseClass.MOOE,
    description: 'Maintenance and Other Operating Expenses',
  },
  {
    prefix: '503',
    expenseClass: ExpenseClass.FE,
    description: 'Financial Expenses (Interest, Premiums)',
  },
  {
    prefix: '106',
    expenseClass: ExpenseClass.CO,
    description: 'Capital Outlay (Buildings, Equipment)',
  },
  {
    prefix: '506',
    expenseClass: ExpenseClass.CO,
    description: 'Capital Outlay (Equipment, Infrastructure)',
  },
]

/**
 * Auto-tag an Object Code with an Expense Class
 * Returns the matching expense class or undefined if no rule matches
 */
export function autoTagExpenseClass(
  objectCode: string,
  customRules?: AutoTagRule[]
): ExpenseClass | undefined {
  const rules = customRules || DEFAULT_AUTO_TAG_RULES

  for (const rule of rules) {
    if (objectCode.startsWith(rule.prefix)) {
      return rule.expenseClass
    }
  }

  return undefined
}

/**
 * Check if an expense class was auto-tagged (not manually overridden)
 */
export function isAutoTagged(
  objectCode: string,
  assignedClass: ExpenseClass | undefined,
  customRules?: AutoTagRule[]
): boolean {
  const autoTaggedClass = autoTagExpenseClass(objectCode, customRules)
  return autoTaggedClass === assignedClass
}

/**
 * Get the description for why an expense class was assigned
 */
export function getAutoTagReason(objectCode: string, customRules?: AutoTagRule[]): string {
  const rules = customRules || DEFAULT_AUTO_TAG_RULES

  for (const rule of rules) {
    if (objectCode.startsWith(rule.prefix)) {
      return `Auto-tagged based on prefix ${rule.prefix}: ${rule.description}`
    }
  }

  return 'No auto-tag rule applied'
}
