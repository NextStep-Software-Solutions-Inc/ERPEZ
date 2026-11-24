/**
 * React Query mutation hook for triggering PSDBM catalogue & stock synchronization
 */

import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { triggerPSDBMSyncRequest } from '../handlers'

export const useTriggerPSDBMSync = createMutationHookFromTemplate(triggerPSDBMSyncRequest)
