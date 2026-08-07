/**
 * Handler: Import eligible Department PPMPs into a Master Office PPMP.
 * Child PPMPs are marked read-only forever and their line items are copied into
 * the master consolidation grid with origin department tags.
 */

import {
  mockPpmpDatabase,
  mockPpmpListDatabase,
  mockAmendmentRecords,
} from '../data/mockPpmpData'
import type {
  PPMP,
  PPMPActivityBlock,
  PPMPIoEBlock,
  PPMPLineItem,
  PPMPAmendmentRecord,
} from '../types'
import { PPMPState } from '../types'
import {
  recomputeActivityBlock,
  recomputeIoEBlock,
  recomputeLineItem,
  computePPMPTotalBudget,
} from '../lib/ppmpUtils'

interface ImportDeptPpmpsData {
  masterPpmpId: string
  departmentPpmpIds: string[]
}

function cloneLineItem(
  item: PPMPLineItem,
  ppmp: PPMP,
  ioEBlockId: string,
  index: number,
): PPMPLineItem {
  const cloned = recomputeLineItem({
    ...JSON.parse(JSON.stringify(item)),
    id: `item-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    ioEBlockId,
    originDepartmentId: ppmp.officeId,
    originDepartmentName: (ppmp.officeId ?? 'department').toUpperCase(),
  })

  return {
    ...cloned,
    sortOrder: index + 1,
  }
}

export const importDeptPpmpsRequest = {
  endpoint: '/ppmps/:id/import-departments',
  key: null,
  fetcher: async (params: { data: ImportDeptPpmpsData }): Promise<PPMP> => {
    await new Promise((r) => setTimeout(r, 500))

    const master = mockPpmpDatabase.find((p) => p.id === params.data.masterPpmpId)
    if (!master) throw new Error('Master Office PPMP not found.')
    if (!master.isMasterOffice) {
      throw new Error('Only Master Office PPMPs can import department plans.')
    }

    const departmentPpmps = params.data.departmentPpmpIds
      .map((id) => mockPpmpDatabase.find((p) => p.id === id))
      .filter((ppmp): ppmp is PPMP => Boolean(ppmp))

    if (departmentPpmps.length === 0) {
      throw new Error('Select at least one Department PPMP to import.')
    }

    const now = new Date().toISOString()

    for (const dept of departmentPpmps) {
      if (dept.isMasterOffice) {
        throw new Error(`"${dept.documentName}" is a Master Office PPMP and cannot be imported.`)
      }
      if (dept.id === master.id) {
        throw new Error('A PPMP cannot be imported into itself.')
      }
      if (dept.fiscalYear !== master.fiscalYear) {
        throw new Error(
          `PPMP "${dept.documentName}" is not in the same fiscal year as the master plan.`,
        )
      }
      if (dept.consolidatedToMasterId) {
        throw new Error(
          `PPMP "${dept.documentName}" is already consolidated and cannot be imported again.`,
        )
      }
    }

    const masterActivityByKey = new Map(
      master.activityBlocks.map((activity) => [activity.activityCode, activity]),
    )

    for (const dept of departmentPpmps) {
      dept.consolidatedToMasterId = master.id
      dept.state = PPMPState.CONSOLIDATED
      dept.currentApprovalStage = null
      dept.rejectionReason = null
      dept.updatedAt = now

      const amendmentRecord: PPMPAmendmentRecord = {
        originalPpmpId: dept.id,
        originalDocumentName: dept.documentName,
        amendmentPpmpId: master.id,
        amendmentVersion: master.amendmentVersion,
        amendmentState: master.state,
        reason: `Consolidated into ${master.documentName}`,
        createdAt: now,
        createdBy: master.createdBy,
      }
      mockAmendmentRecords.push(amendmentRecord)

      const deptListItem = mockPpmpListDatabase.find((item) => item.id === dept.id)
      if (deptListItem) {
        deptListItem.consolidatedToMasterId = master.id
        deptListItem.updatedAt = now
        deptListItem.state = PPMPState.CONSOLIDATED
        deptListItem.currentApprovalStage = null
      }

      for (const activity of dept.activityBlocks) {
        let targetActivity = masterActivityByKey.get(activity.activityCode)

        if (!targetActivity) {
          targetActivity = {
            id: `ab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            activityId: activity.activityId,
            activityName: activity.activityName,
            activityCode: activity.activityCode,
            ioEBlocks: [],
            totalCost: 0,
          }
          master.activityBlocks.push(targetActivity)
          masterActivityByKey.set(activity.activityCode, targetActivity)
        }

        const masterIoEByKey = new Map(
          targetActivity.ioEBlocks.map((block) => [block.ioECode, block]),
        )

        for (const block of activity.ioEBlocks) {
          let targetBlock = masterIoEByKey.get(block.ioECode)

          if (!targetBlock) {
            targetBlock = {
              id: `ioeb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              ioEId: block.ioEId,
              ioEName: block.ioEName,
              ioECode: block.ioECode,
              budgetLimit: block.budgetLimit,
              activityBlockId: targetActivity.id,
              items: [],
              totalCost: 0,
              isOverBudget: false,
              isProcurable: block.isProcurable,
              costs: block.costs ? JSON.parse(JSON.stringify(block.costs)) : undefined,
            }
            targetActivity.ioEBlocks.push(targetBlock)
            masterIoEByKey.set(block.ioECode, targetBlock)
          }

          if (block.items.length > 0) {
            block.items.forEach((item, index) => {
              targetBlock!.items.push(
                cloneLineItem(item, dept, targetBlock!.id, index + targetBlock!.items.length),
              )
            })
          }

          if (block.costs?.length) {
            targetBlock.costs = JSON.parse(JSON.stringify(block.costs))
          }

          const recomputedBlock = recomputeIoEBlock(targetBlock)
          const blockIndex = targetActivity.ioEBlocks.findIndex((item) => item.id === targetBlock!.id)
          targetActivity.ioEBlocks[blockIndex] = recomputedBlock
        }

        const activityIndex = master.activityBlocks.findIndex((item) => item.id === targetActivity!.id)
        master.activityBlocks[activityIndex] = recomputeActivityBlock(targetActivity)
      }
    }

    master.totalBudget = computePPMPTotalBudget(master.activityBlocks)
    master.updatedAt = now

    const masterListItem = mockPpmpListDatabase.find((item) => item.id === master.id)
    if (masterListItem) {
      masterListItem.totalBudget = master.totalBudget
      masterListItem.updatedAt = now
    }

    return { ...master }
  },
}
