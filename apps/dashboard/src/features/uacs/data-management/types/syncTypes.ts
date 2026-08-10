import type { CodeSegmentType } from '../../code-segments/types/commonTypes'

/**
 * Sync Status
 */
export enum SyncStatus {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

/**
 * Sync Result
 */
export interface SyncResult {
  status: SyncStatus
  addedRecords: number
  updatedRecords: number
  deletedRecords: number
  errors: string[]
  syncedAt: string
}

/**
 * Sync Configuration
 */
export interface SyncConfiguration {
  id: string
  source: string // e.g., "DBM API", "External System"
  codeSegmentType: CodeSegmentType
  autoSync: boolean
  syncInterval?: number // in hours
  lastSyncAt?: string
  lastSyncResult?: SyncResult
}
