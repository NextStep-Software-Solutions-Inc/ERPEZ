import type { MasterDoc, Profile, ProjectChecklistItem } from './types'

export const TEMPLATE_FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx'

export function formatTemplateFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function getSortedChecklist(
  checklist: ProjectChecklistItem[],
  masterDocs: MasterDoc[],
) {
  return [...checklist].sort((a, b) => {
    const docA = masterDocs.find((doc) => doc.id === a.id)
    const docB = masterDocs.find((doc) => doc.id === b.id)
    const orderA = docA ? docA.order : 999
    const orderB = docB ? docB.order : 999

    return orderA - orderB
  })
}

export function getProfileEnvelopeCount(
  profile: Profile,
  masterDocs: MasterDoc[],
  envelope: 1 | 2,
) {
  return profile.documentIds.filter(
    (id) => masterDocs.find((doc) => doc.id === id)?.envelope === envelope,
  ).length
}
