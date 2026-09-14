import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageContainerDashtail } from '@/components/v2'
import {
  approveNoticeOfAwardRequest,
  getNoticeOfAwardRequest,
  logNoticeOfAwardMilestoneRequest,
  printNoticeOfAwardRequest,
  recordNoticeOfAwardExecutionJustificationRequest,
  returnNoticeOfAwardRequest,
  submitNoticeOfAwardRequest,
  triggerNoticeOfAwardCascadeRequest,
} from '../handlers'
import type { NoticeOfAward, NoticeOfAwardRole } from '../types'
import { downloadNoticeOfAwardBlob } from '../utils/downloadNoticeOfAwardBlob'
import { NoticeOfAwardDetailsShell } from '../components/NoticeOfAwardDetailsShell'
import {
  ApproveNoticeOfAwardDialog,
  LogConformeDialog,
  ReturnNoticeOfAwardDialog,
} from '../dialogs'

const isGuid = (id?: string | null): boolean => {
  return (
    typeof id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
}

export function NoticeOfAwardDetailsPage({
  noaId,
  role,
  backTo,
}: NoticeOfAwardDetailsPageProps) {
  const [noticeOfAward, setNoticeOfAward] = useState<NoticeOfAward | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isMutating, setIsMutating] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [logConformeOpen, setLogConformeOpen] = useState(false)

  const loadNoticeOfAward = async () => {
    if (!isGuid(noaId)) {
      setIsLoading(false)
      setLoadError(`'${noaId}' is not a valid Notice of Award ID.`)
      return
    }

    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await getNoticeOfAwardRequest.fetcher({ noaId })
      setNoticeOfAward(response)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load the NOA.'
      setLoadError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadNoticeOfAward()
  }, [noaId])

  if (isLoading) {
    return (
      <PageContainerDashtail
        title="Loading NOA"
        description="Loading the selected Notice of Award."
      >
        <Card>
          <CardContent className="p-6 text-sm text-default-600">
            Loading record details...
          </CardContent>
        </Card>
      </PageContainerDashtail>
    )
  }

  if (loadError || !noticeOfAward) {
    return (
      <PageContainerDashtail
        title="Notice of Award not found"
        description={
          loadError ?? 'The selected Notice of Award could not be loaded.'
        }
      >
        <Card>
          <CardContent className="space-y-4 p-6 text-sm text-default-600">
            <p>
              The record may have been removed or the route parameter is
              invalid.
            </p>
            <Button asChild>
              <Link to={backTo}>Back to NOA workspace</Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainerDashtail>
    )
  }

  const refreshNoticeOfAward = (updated: NoticeOfAward) => {
    setNoticeOfAward(updated)
  }

  return (
    <PageContainerDashtail
      title={noticeOfAward.noaNumber}
      description={noticeOfAward.description}
      headerVariant="default"
      headerSize="large"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" color="secondary" asChild>
            <Link to={backTo}>Back</Link>
          </Button>
        </div>
      }
      contentClassName="pt-4"
    >
      <NoticeOfAwardDetailsShell
        noticeOfAward={noticeOfAward}
        role={role}
        isLoading={isMutating}
        onViewSignedDocument={
          noticeOfAward.signedDocumentFileName
            ? async () => {
                setIsMutating(true)
                try {
                  const result = await printNoticeOfAwardRequest.fetcher({
                    noaId: noticeOfAward.id,
                  })
                  const fileUrl = URL.createObjectURL(result.blob)
                  window.open(fileUrl, '_blank')
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Failed to open the signed document.',
                  )
                } finally {
                  setIsMutating(false)
                }
              }
            : undefined
        }
        onViewMilestoneFile={async (milestone, fileName) => {
          setIsMutating(true)
          try {
            const { jsPDF } = await import('jspdf')
            const doc = new jsPDF()
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(16)
            doc.text('Notice of Award Milestone Document', 20, 20)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(12)
            doc.text(`Document Name: ${fileName}`, 20, 35)
            doc.text(`Notice of Award No: ${noticeOfAward.noaNumber}`, 20, 45)
            doc.text(`Project Name: ${noticeOfAward.projectName}`, 20, 55)
            doc.text(`Winning Supplier: ${noticeOfAward.supplierName}`, 20, 65)
            doc.text(`Milestone: ${milestone.replace(/_/g, ' ').toUpperCase()}`, 20, 75)
            const blob = doc.output('blob')
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')
          } catch (error) {
            toast.error('Failed to open milestone document.')
          } finally {
            setIsMutating(false)
          }
        }}
        onPrint={async () => {
          setIsMutating(true)
          try {
            const result = await printNoticeOfAwardRequest.fetcher({
              noaId: noticeOfAward.id,
            })
            downloadNoticeOfAwardBlob(result.blob, result.fileName)
            toast.success('NOA document downloaded.')
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : 'Failed to download the NOA document.',
            )
          } finally {
            setIsMutating(false)
          }
        }}
        onSubmit={
          role === 'procurement-staff' &&
          (noticeOfAward.status === 'draft' ||
            noticeOfAward.status === 'returned')
            ? async () => {
                setIsMutating(true)
                try {
                  await submitNoticeOfAwardRequest.fetcher({
                    data: { noaId: noticeOfAward.id },
                  })
                  toast.success('NOA submitted for approval.')
                  await loadNoticeOfAward()
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Failed to submit NOA.',
                  )
                } finally {
                  setIsMutating(false)
                }
              }
            : undefined
        }
        onReturn={
          role === 'hope' && noticeOfAward.status === 'for-approval'
            ? () => setReturnOpen(true)
            : undefined
        }
        onApprove={
          role === 'hope' && noticeOfAward.status === 'for-approval'
            ? () => setApproveOpen(true)
            : undefined
        }
        onOpenLogConforme={
          role === 'procurement-staff' && noticeOfAward.status === 'approved'
            ? () => setLogConformeOpen(true)
            : undefined
        }
        onLogMilestone={
          noticeOfAward.status === 'approved'
            ? async (milestone, file) => {
                setIsMutating(true)
                try {
                  await logNoticeOfAwardMilestoneRequest.fetcher({
                    data: {
                      noaId: noticeOfAward.id,
                      milestone,
                      date: new Date().toISOString().slice(0, 10),
                      file,
                    },
                  })
                  toast.success('Contract execution milestone logged.')
                  await loadNoticeOfAward()
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Failed to log milestone.',
                  )
                } finally {
                  setIsMutating(false)
                }
              }
            : undefined
        }
        onLogJustification={
          noticeOfAward.status === 'approved'
            ? async () => {
                const justification = window.prompt(
                  'Enter the justification for delayed contract execution.',
                )

                if (!justification?.trim()) {
                  return
                }

                setIsMutating(true)
                try {
                  await recordNoticeOfAwardExecutionJustificationRequest.fetcher(
                    {
                      data: {
                        noaId: noticeOfAward.id,
                        justification,
                      },
                    },
                  )
                  toast.success('Contract execution justification logged.')
                  await loadNoticeOfAward()
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Failed to log justification.',
                  )
                } finally {
                  setIsMutating(false)
                }
              }
            : undefined
        }
        onTriggerCascade={
          noticeOfAward.status === 'approved'
            ? async () => {
                const confirmed = window.confirm(
                  'Trigger forfeiture handling and promote the next-ranked bidder?',
                )

                if (!confirmed) {
                  return
                }

                setIsMutating(true)
                try {
                  await triggerNoticeOfAwardCascadeRequest.fetcher({
                    data: {
                      noaId: noticeOfAward.id,
                      note: 'Forfeiture of bid security and promotion of the next-ranked bidder initiated.',
                    },
                  })
                  toast.success('Post-qualification cascade triggered.')
                  await loadNoticeOfAward()
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Failed to trigger cascade.',
                  )
                } finally {
                  setIsMutating(false)
                }
              }
            : undefined
        }
      />

      {role === 'hope' ? (
        <ReturnNoticeOfAwardDialog
          open={returnOpen}
          onOpenChange={setReturnOpen}
          noaId={noticeOfAward.id}
          noaNumber={noticeOfAward.noaNumber}
          onReturn={async (payload) => {
            setIsMutating(true)
            try {
              await returnNoticeOfAwardRequest.fetcher({
                data: payload,
              })
              setReturnOpen(false)
              toast.success('NOA returned for revision.')
              await loadNoticeOfAward()
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to return NOA.',
              )
            } finally {
              setIsMutating(false)
            }
          }}
        />
      ) : null}

      {role === 'hope' ? (
        <ApproveNoticeOfAwardDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          noaId={noticeOfAward.id}
          noaNumber={noticeOfAward.noaNumber}
          onApprove={async (payload) => {
            setIsMutating(true)
            try {
              await approveNoticeOfAwardRequest.fetcher({
                data: payload,
              })
              setApproveOpen(false)
              toast.success('NOA approved and issued successfully.')
              await loadNoticeOfAward()
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to approve NOA.',
              )
            } finally {
              setIsMutating(false)
            }
          }}
        />
      ) : null}

      <LogConformeDialog
        open={logConformeOpen}
        onOpenChange={setLogConformeOpen}
        noaId={noticeOfAward.id}
        noaNumber={noticeOfAward.noaNumber}
        issuedAt={noticeOfAward.issuedAt}
        isLoading={isMutating}
        onConfirm={async ({ date, file, remarks }) => {
          setIsMutating(true)
          try {
            await logNoticeOfAwardMilestoneRequest.fetcher({
              data: {
                noaId: noticeOfAward.id,
                milestone: 'conforme_received_date',
                date,
                file: file ?? undefined,
                remarks,
              },
            })
            toast.success('NOA Receipt / Conforme logged successfully.')
            await loadNoticeOfAward()
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : 'Failed to record NOA receipt.',
            )
            throw error
          } finally {
            setIsMutating(false)
          }
        }}
      />
    </PageContainerDashtail>
  )
}
