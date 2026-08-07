import type { ProcurementWorkflowSetting } from '@/components/features/planning/organizational-structure/types'

/**
 * Procurement Workflows Database
 * Defines the procurement processes and workflow types for organizational units
 * Examples: Centralized, Decentralized, Mixed, None
 */
export let PROCUREMENT_WORKFLOWS_DB: ProcurementWorkflowSetting[] = [
  {
    id: 'pw-1',
    name: 'Centralized',
    code: 'CENT',
    description: 'Centralized procurement - all purchases processed through central office',
    status: 'active',
    thresholdAmount: 500000,
    approvalLevels: 3,
    requiresBiddingProcess: true,
    estimatedProcessDays: 30,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pw-2',
    name: 'Decentralized',
    code: 'DECENT',
    description: 'Decentralized procurement - offices manage their own purchases',
    status: 'active',
    thresholdAmount: 100000,
    approvalLevels: 2,
    requiresBiddingProcess: false,
    estimatedProcessDays: 14,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pw-3',
    name: 'Mixed',
    code: 'MIX',
    description: 'Mixed procurement - combination of centralized and decentralized based on amount',
    status: 'active',
    thresholdAmount: 250000,
    approvalLevels: 2,
    requiresBiddingProcess: true,
    estimatedProcessDays: 21,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'pw-4',
    name: 'None',
    code: 'NONE',
    description: 'No formal procurement process',
    status: 'active',
    thresholdAmount: 0,
    approvalLevels: 1,
    requiresBiddingProcess: false,
    estimatedProcessDays: 1,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

/**
 * Fetch all procurement workflows
 */
export async function fetchProcurementWorkflows(): Promise<ProcurementWorkflowSetting[]> {
  return PROCUREMENT_WORKFLOWS_DB
}

/**
 * Fetch procurement workflow by ID
 */
export async function fetchProcurementWorkflowById(id: string): Promise<ProcurementWorkflowSetting | null> {
  return PROCUREMENT_WORKFLOWS_DB.find((workflow) => workflow.id === id) || null
}

/**
 * Create new procurement workflow
 */
export async function createProcurementWorkflow(data: Omit<ProcurementWorkflowSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcurementWorkflowSetting> {
  const newWorkflow: ProcurementWorkflowSetting = {
    ...data,
    id: `pw-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  PROCUREMENT_WORKFLOWS_DB.push(newWorkflow)
  return newWorkflow
}

/**
 * Update procurement workflow
 */
export async function updateProcurementWorkflow(id: string, data: Partial<ProcurementWorkflowSetting>): Promise<ProcurementWorkflowSetting | null> {
  const index = PROCUREMENT_WORKFLOWS_DB.findIndex((workflow) => workflow.id === id)
  if (index === -1) return null
  
  PROCUREMENT_WORKFLOWS_DB[index] = {
    ...PROCUREMENT_WORKFLOWS_DB[index],
    ...data,
    id: PROCUREMENT_WORKFLOWS_DB[index].id,
    createdAt: PROCUREMENT_WORKFLOWS_DB[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  return PROCUREMENT_WORKFLOWS_DB[index]
}

/**
 * Delete procurement workflow
 */
export async function deleteProcurementWorkflow(id: string): Promise<boolean> {
  const index = PROCUREMENT_WORKFLOWS_DB.findIndex((workflow) => workflow.id === id)
  if (index === -1) return false
  PROCUREMENT_WORKFLOWS_DB.splice(index, 1)
  return true
}
