import { atomWithStorage } from 'jotai/utils'
import type { CreateFundSourceFormValues } from './forms/CreateFundSourceForm'

export const createFormDataAtom = atomWithStorage<
  Partial<CreateFundSourceFormValues>
>('fund-source-create-form', {})
