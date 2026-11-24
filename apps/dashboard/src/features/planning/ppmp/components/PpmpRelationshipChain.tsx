/**
 * PpmpRelationshipChain
 * Lightweight UI plumbing for amendment and master-office parent/child links.
 */

import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PPMP } from '../types'
import { mockPpmpDatabase } from '../data/mockPpmpData'

interface PpmpRelationshipChainProps {
  ppmp: PPMP
}

export function PpmpRelationshipChain({ ppmp }: PpmpRelationshipChainProps) {
  const navigate = useNavigate()

  const parent = useMemo(() => {
    if (!ppmp.parentPpmpId) return null
    return (
      mockPpmpDatabase.find((item) => item.id === ppmp.parentPpmpId) ?? null
    )
  }, [ppmp.parentPpmpId])

  const consolidatedChildren = useMemo(
    () =>
      ppmp.isMasterOffice
        ? mockPpmpDatabase.filter((item) => item.consolidatedIntoId === ppmp.id)
        : [],
    [ppmp.id, ppmp.isMasterOffice],
  )

  const masterParent = useMemo(() => {
    if (!ppmp.consolidatedIntoId) return null
    return (
      mockPpmpDatabase.find((item) => item.id === ppmp.consolidatedIntoId) ??
      null
    )
  }, [ppmp.consolidatedIntoId])

  if (!parent && !ppmp.isMasterOffice && !masterParent) {
    return null
  }

  return (
    <div className={cn('rounded-xl ')}>
      <div className="items-center gap-2">
        {ppmp.parentPpmpId && parent && (
          <>
            <Badge variant="outline">Amendment chain</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={() =>
                navigate({
                  to: '/v2/ppmp/$ppmpId',
                  params: { ppmpId: parent.id },
                  search: {},
                })
              }
            >
              Parent: {parent.documentName}
            </Button>
          </>
        )}

        {ppmp.isMasterOffice && (
          <>
            <Badge variant="outline">Master office parent</Badge>
          </>
        )}

        {ppmp.consolidatedIntoId && masterParent && (
          <>
            <Badge variant="outline">Read-only child</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={() =>
                navigate({
                  to: '/v2/ppmp/$ppmpId',
                  params: { ppmpId: masterParent.id },
                  search: {},
                })
              }
            >
              Consolidated into: {masterParent.documentName}
            </Button>
          </>
        )}
      </div>

      {ppmp.isMasterOffice && consolidatedChildren.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {consolidatedChildren.map((child) => (
            <Button
              key={child.id}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={() =>
                navigate({
                  to: '/v2/ppmp/$ppmpId',
                  params: { ppmpId: child.id },
                  search: {},
                })
              }
            >
              {child.documentName}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
