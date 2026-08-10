import type { CreateWFPObjectiveTargetExpenditureValues } from './schema'
import type { ReactFormExtendedApi, FormValidateOrFn, FormAsyncValidateOrFn } from '@tanstack/react-form'

export type Expenditure = CreateWFPObjectiveTargetExpenditureValues['expenditures'][0]
export type LineItem = Expenditure['lineItems'][0]
export type Item = LineItem['items'][0]

export interface FieldArrayLike<T = unknown> {
  state: { value: Array<T> }
  removeValue: (index: number) => void
}

export interface FieldRenderProps<T = unknown> {
  state: { value: T }
  handleChange: (value: T) => void
  handleBlur: () => void
}

/**
 * Type-safe form type using TanStack Form's ReactFormExtendedApi with full union types
 * for each validator generic param (as inferred by TypeScript when no validators are passed).
 * Using full `FormValidateOrFn | undefined` / `FormAsyncValidateOrFn | undefined` unions
 * avoids assignability errors caused by invariant generic params.
 */
export type WFPExpenditureForm = ReactFormExtendedApi<
  CreateWFPObjectiveTargetExpenditureValues,
  FormValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  FormValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  FormAsyncValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  FormValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  FormAsyncValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  FormValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  FormAsyncValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  FormValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  FormAsyncValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  FormAsyncValidateOrFn<CreateWFPObjectiveTargetExpenditureValues> | undefined,
  unknown
>
