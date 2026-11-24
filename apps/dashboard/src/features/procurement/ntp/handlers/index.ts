/**
 * NTP Handlers Index
 * Central export point for all API request handlers and TanStack Query hooks.
 */

export * from './getNoticeToProceedsRequest'
export * from './getNoticeToProceedByIdRequest'
export * from './getNoticeToProceedByContractIdRequest'
export * from './getNoticeToProceedSummaryRequest'
export * from './getAvailableContractsForNoticeToProceedRequest'
export * from './createNoticeToProceedRequest'
export * from './updateNoticeToProceedRequest'
export * from './issueNoticeToProceedRequest'
export * from './recordNoticeToProceedReceiptRequest'
export * from './cancelNoticeToProceedRequest'
export * from './deleteNoticeToProceedRequest'
export * from './generateNoticeToProceedDocumentRequest'
export * from './getNoticeToProceedPdfRequest'
export * from './hooks'

// Backwards compatibility re-exports
export { getNoticeToProceedsRequest as getNTPListRequest } from './getNoticeToProceedsRequest'
export { createNoticeToProceedRequest as createNTPRequest } from './createNoticeToProceedRequest'
export { getAvailableContractsForNoticeToProceedRequest as getApprovedContractsRequest } from './getAvailableContractsForNoticeToProceedRequest'
