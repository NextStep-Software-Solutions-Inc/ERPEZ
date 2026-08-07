/**
 * Mock data for Data Rollover Wizard hierarchical options
 * Provides hierarchical structure for Org Structure and UACS Library
 */

export interface RolloverSubChild {
  id: string;
  label: string;
}

export interface RolloverChild {
  id: string;
  label: string;
  children?: RolloverSubChild[];
}

export interface RolloverOption {
  id: string;
  label: string;
  children: RolloverChild[];
}

export const rolloverOptions = {
  orgStructure: {
    id: 'copyOrgStructure',
    label: 'Organization Structure',
    children: [
      {
        id: 'departments',
        label: 'Departments',
        children: [
          { id: 'departmentTypes', label: 'Department Types' },
          { id: 'departmentHierarchy', label: 'Department Hierarchy' },
        ],
      },
      {
        id: 'costCenters',
        label: 'Cost Centers',
        children: [
          { id: 'costCenterCodes', label: 'Cost Center Codes' },
          { id: 'costCenterAllocation', label: 'Cost Center Allocation' },
        ],
      },
      {
        id: 'personnelStructure',
        label: 'Personnel Structure',
        children: [
          { id: 'jobPositions', label: 'Job Positions' },
          { id: 'personnelRoles', label: 'Personnel Roles' },
        ],
      },
    ],
  },
  uacsLibrary: {
    id: 'copyUACSLibrary',
    label: 'UACS Library',
    children: [
      {
        id: 'accountCodes',
        label: 'Account Codes',
        children: [
          { id: 'assetAccounts', label: 'Asset Accounts' },
          { id: 'liabilityAccounts', label: 'Liability Accounts' },
        ],
      },
      {
        id: 'ledgerAccounts',
        label: 'Ledger Accounts',
        children: [
          { id: 'generalLedger', label: 'General Ledger' },
          { id: 'subledger', label: 'Subledger' },
        ],
      },
      {
        id: 'costAllocations',
        label: 'Cost Allocations',
        children: [
          { id: 'allocationRules', label: 'Allocation Rules' },
          { id: 'allocationMethods', label: 'Allocation Methods' },
        ],
      },
    ],
  },
};

export const recurringExpensesOption = {
  id: 'copyRecurringExpenses',
  label: 'Recurring Expenses',
  description: 'Copies setup for regular, predictable expenditures',
};
