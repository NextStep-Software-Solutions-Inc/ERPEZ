import { useState } from 'react'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { generateLibRealignmentPdfRequest } from '../handlers/generateLibRealignmentPdfRequest'
import { downloadLIBDocumentRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/downloadLIBDocumentRequest'
import { useToast } from '@/components/ui/use-toast'
import api from '@/services/api'

export const useGenerateRealignmentPdf = createMutationHookFromTemplate(
  generateLibRealignmentPdfRequest,
)

const useDownloadDocument = createMutationHookFromTemplate(
  downloadLIBDocumentRequest,
)

export function useRealignmentPdf() {
  const { toast } = useToast()
  const { mutateAsync: generatePdf } = useGenerateRealignmentPdf()
  const { mutateAsync: downloadDocument } = useDownloadDocument()
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const downloadPdf = async (realignmentId: string, libNumber?: string) => {
    setGeneratingId(realignmentId)
    try {
      const genResponse = await generatePdf({
        pathParams: { id: realignmentId },
        queryParams: { format: 'Pdf' },
      })

      const documentId = genResponse.data
      if (!documentId) {
        throw new Error('No document ID returned from generation API')
      }

      const downloadResponse = await downloadDocument({
        pathParams: { documentId },
      })

      const blob = downloadResponse.blob
      const filename = libNumber
        ? `Modification_of_Budget_${libNumber}.pdf`
        : `Modification_of_Budget_${realignmentId.slice(0, 8)}.pdf`

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      toast({
        title: 'Export Successful',
        description: 'Modification of Budget PDF downloaded successfully.',
      })
    } catch (err) {
      console.error('Failed to download realignment PDF:', err)
      toast({
        title: 'Export Error',
        description:
          err instanceof Error
            ? err.message
            : 'Failed to generate Modification of Budget PDF document.',
        variant: 'destructive',
      })
    } finally {
      setGeneratingId(null)
    }
  }

  const previewPdf = async (realignmentId: string) => {
    setGeneratingId(realignmentId)
    try {
      const response = await api.get<Blob>(
        `/api/planning/lib-realignments/${realignmentId}/pdf`,
        {
          responseType: 'blob',
        },
      )
      const blobUrl = URL.createObjectURL(response.data)
      window.open(blobUrl, '_blank')
    } catch (err) {
      console.error('Failed to preview realignment PDF:', err)
      toast({
        title: 'Preview Error',
        description: 'Failed to preview Modification of Budget PDF.',
        variant: 'destructive',
      })
    } finally {
      setGeneratingId(null)
    }
  }

  return {
    downloadPdf,
    previewPdf,
    isGenerating: !!generatingId,
    generatingId,
  }
}
