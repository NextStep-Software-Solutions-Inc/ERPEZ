/**
 * GET /notice-to-proceed/:id/pdf
 * Stream server-rendered Notice to Proceed PDF directly (QuestPDF)
 */

import api from '@/services/api'

export interface NoticeToProceedPdfResult {
  fileName: string
  blob: Blob
}

export const getNoticeToProceedPdfRequest = {
  endpoint: '/notice-to-proceed/:id/pdf',
  fetcher: async ({ ntpId, ntpNumber }: { ntpId: string; ntpNumber?: string }): Promise<NoticeToProceedPdfResult> => {
    const fileName = `${ntpNumber || 'NTP'}_Notice_to_Proceed.pdf`
    const response = await api.get<Blob>(`/notice-to-proceed/${ntpId}/pdf`, {
      responseType: 'blob',
    })

    if (!response.data || response.data.size === 0) {
      throw new Error('Received empty Notice to Proceed PDF document.')
    }

    return {
      fileName,
      blob: response.data,
    }
  },
}
