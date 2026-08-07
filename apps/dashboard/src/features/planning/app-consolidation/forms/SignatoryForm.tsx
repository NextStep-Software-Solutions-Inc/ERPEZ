import { useState, useEffect } from 'react'
import type { SignatoryBlock, Signatory } from '../types'
import { SignatorySearchField } from '../components/SignatorySearchField'

// Mock available signatories - replace with API call
const AVAILABLE_SIGNATORIES: Signatory[] = [
  {
    id: 'sig-001',
    name: 'Juan M. Santos',
    position: 'Procurement Officer',
    department: 'Administrative Services',
  },
  {
    id: 'sig-002',
    name: 'Maria G. Lopez',
    position: 'Budget Officer',
    department: 'Finance Division',
  },
  {
    id: 'sig-003',
    name: 'Pedro R. Reyes',
    position: 'Director',
    department: 'Planning and Development',
  },
  {
    id: 'sig-004',
    name: 'Ana C. Mendoza',
    position: 'Executive Director',
    department: 'Executive Office',
  },
  {
    id: 'sig-005',
    name: 'Rosa M. Garcia',
    position: 'Deputy Director',
    department: 'Operations',
  },
  {
    id: 'sig-006',
    name: 'Miguel T. Torres',
    position: 'Assistant Director',
    department: 'Finance Division',
  },
]

interface SignatoryState {
  id?: string
  name: string
  position: string
  department: string
  searchInput: string
  showSuggestions: boolean
  filteredSuggestions: Signatory[]
}

const toState = (signatory?: Signatory): SignatoryState => ({
  id: signatory?.id,
  name: signatory?.name || '',
  position: signatory?.position || '',
  department: signatory?.department || '',
  searchInput: '',
  showSuggestions: false,
  filteredSuggestions: [],
})

interface SignatoryFormProps {
  onSave?: (signatories: SignatoryBlock) => void
  initialData?: SignatoryBlock
}

export function SignatoryForm({ onSave, initialData }: SignatoryFormProps) {
  const [preparedBy, setPreparedBy] = useState<SignatoryState>(
    initialData?.preparedBy ? toState(initialData.preparedBy) : toState(AVAILABLE_SIGNATORIES[0]),
  )
  const [reviewedBy, setReviewedBy] = useState<SignatoryState>(
    initialData?.reviewedBy ? toState(initialData.reviewedBy) : toState(),
  )
  const [approvedBy, setApprovedBy] = useState<SignatoryState>(
    initialData?.approvedBy ? toState(initialData.approvedBy) : toState(),
  )
  const [certifiedBy, setCertifiedBy] = useState<SignatoryState>(
    initialData?.certifiedBy ? toState(initialData.certifiedBy) : toState(),
  )

  // Auto-save signatories when any field changes
  useEffect(() => {
    const signatories: SignatoryBlock = {
      preparedBy: preparedBy.name
        ? { id: preparedBy.id || 'prepared-1', name: preparedBy.name, position: preparedBy.position, department: preparedBy.department }
        : undefined,
      reviewedBy: reviewedBy.name
        ? { id: reviewedBy.id || 'reviewed-1', name: reviewedBy.name, position: reviewedBy.position, department: reviewedBy.department }
        : undefined,
      approvedBy: approvedBy.name
        ? { id: approvedBy.id || 'approved-1', name: approvedBy.name, position: approvedBy.position, department: approvedBy.department }
        : undefined,
      certifiedBy: certifiedBy.name
        ? { id: certifiedBy.id || 'certified-1', name: certifiedBy.name, position: certifiedBy.position, department: certifiedBy.department }
        : undefined,
    }
    onSave?.(signatories)
  }, [preparedBy, reviewedBy, approvedBy, certifiedBy, onSave])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SignatorySearchField
          label="Prepared By"
          state={preparedBy}
          onStateChange={setPreparedBy}
          suggestions={AVAILABLE_SIGNATORIES}
        />
        <SignatorySearchField
          label="Reviewed By"
          state={reviewedBy}
          onStateChange={setReviewedBy}
          suggestions={AVAILABLE_SIGNATORIES}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SignatorySearchField
          label="Approved By"
          state={approvedBy}
          onStateChange={setApprovedBy}
          suggestions={AVAILABLE_SIGNATORIES}
        />
        <SignatorySearchField
          label="Certified By"
          state={certifiedBy}
          onStateChange={setCertifiedBy}
          suggestions={AVAILABLE_SIGNATORIES}
        />
      </div>
    </div>
  )
}
