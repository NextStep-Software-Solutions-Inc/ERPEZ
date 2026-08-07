/**
 * Market Scoping Create Route Page
 * URL: /v2/market-scoping/create
 * 
 * Renders the multi-step form wizard for creating new market scoping forms
 */

import { useNavigate } from '@tanstack/react-router'
import { FormWizard, useCreateMarketScoping } from '@/features/planning/market-scoping'
import { transformFormToCreatePayload } from '@/features/planning/market-scoping/utils/transformers'
import { MOCK_USER_PROFILE, MOCK_LIB_ACTIVITIES } from '@/features/planning/market-scoping/mocks'
import type { MarketScopingForm } from '@/features/planning/market-scoping/types/marketScopingTypes'

export default function CreateMarketScopingPage() {
  const navigate = useNavigate()
  const { mutateAsync: createForm } = useCreateMarketScoping()

  const handleFormSubmit = async (formData: MarketScopingForm) => {
    try {
      // TODO (follow-up): User profile should come from auth context, not mock
      const payload = transformFormToCreatePayload(formData)
      const result = await createForm({ pathParams: {}, payload })  
      const createdId = typeof result === 'string' ? result : result?.data
      // Navigate to details page
      if (createdId) {
        navigate({ to: `/v2/market-scoping/${createdId}` })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      throw error
    }
  }

  const handleCancel = () => {
    navigate({ to: '/v2/market-scoping' })
  }

  return (
    <FormWizard
      onFormSubmit={handleFormSubmit}
      userProfile={MOCK_USER_PROFILE}
      libActivities={MOCK_LIB_ACTIVITIES}
      onCancel={handleCancel}
    />
  )
}
