import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import type { AppMaster, Signatory, SignatoryBlock } from '../types'
import { signatoriesDialogOpenAtom, currentAppAtom, appListAtom } from '../atoms'

// Mock signatories database with predefined details
const MOCK_SIGNATORIES_DATABASE = [
  {
    id: 'sig-001',
    name: 'Maria Santos',
    position: 'Procurement Officer',
    department: 'Supply & Logistics Division',
  },
  {
    id: 'sig-002',
    name: 'Juan Cruz',
    position: 'Budget Officer',
    department: 'Finance & Budget Division',
  },
  {
    id: 'sig-003',
    name: 'Ana Garcia',
    position: 'Director',
    department: 'Planning & Development Office',
  },
  {
    id: 'sig-004',
    name: 'Roberto Mendoza',
    position: 'Administrative Officer',
    department: 'Administrative Services Division',
  },
  {
    id: 'sig-005',
    name: 'Luisa Reyes',
    position: 'Finance Manager',
    department: 'Finance & Budget Division',
  },
  {
    id: 'sig-006',
    name: 'Carlos Fernandez',
    position: 'Procurement Manager',
    department: 'Supply & Logistics Division',
  },
  {
    id: 'sig-007',
    name: 'Teresa Bautista',
    position: 'Deputy Director',
    department: 'Planning & Development Office',
  },
  {
    id: 'sig-008',
    name: 'Miguel Castillo',
    position: 'Senior Procurement Specialist',
    department: 'Supply & Logistics Division',
  },
]

interface EditSignatoriesDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface SignatoryFormData {
  name: string
  position: string
  department: string
  signatureDate?: string
}

interface EditingState {
  roleKey: string | null
  signatoryIndex: number | null
}

const SIGNATORY_TYPES = [
  { key: 'preparedBy', label: 'Prepared By', color: 'bg-blue-100 text-blue-700', lightBg: 'bg-blue-50', borderColor: 'border-blue-200' },
  { key: 'reviewedBy', label: 'Reviewed By', color: 'bg-green-100 text-green-700', lightBg: 'bg-green-50', borderColor: 'border-green-200' },
  { key: 'approvedBy', label: 'Approved By', color: 'bg-purple-100 text-purple-700', lightBg: 'bg-purple-50', borderColor: 'border-purple-200' },
  { key: 'certifiedBy', label: 'Certified By', color: 'bg-orange-100 text-orange-700', lightBg: 'bg-orange-50', borderColor: 'border-orange-200' },
] as const

/**
 * EditSignatoriesDialog - Multi-Signatory Management Editor
 *
 * Manages signatories setup for Annual Procurement Plans (APP).
 * Enhanced to support MULTIPLE signatories per role with improved UX.
 *
 * Features:
 * - Multiple signatories per role (Prepared By, Reviewed By, Approved By, Certified By)
 * - Inline add buttons (easier accessibility than bottom buttons)
 * - Collapsible sections per role for better organization
 * - Auto-population from predefined database
 * - Unsaved changes protection
 * - Real-time validation
 */
export function EditSignatoriesDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditSignatoriesDialogProps) {
  const [dialogOpen, setDialogOpen] = useAtom(signatoriesDialogOpenAtom)
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom)
  const [appList, setAppList] = useAtom(appListAtom)

  const [formData, setFormData] = useState<AppMaster | null>(null)
  const [editingState, setEditingState] = useState<EditingState>({ roleKey: null, signatoryIndex: null })
  const [editingForm, setEditingForm] = useState<SignatoryFormData>({
    name: '',
    position: '',
    department: '',
    signatureDate: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(
    new Set(['preparedBy', 'reviewedBy', 'approvedBy', 'certifiedBy']),
  )

  const isOpen = controlledOpen !== undefined ? controlledOpen : dialogOpen

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (controlledOnOpenChange) {
        controlledOnOpenChange(newOpen)
      } else {
        setDialogOpen(newOpen)
      }
    },
    [controlledOnOpenChange, setDialogOpen],
  )

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen && currentApp) {
      setFormData(JSON.parse(JSON.stringify(currentApp)))
      setEditingState({ roleKey: null, signatoryIndex: null })
      setEditingForm({ name: '', position: '', department: '', signatureDate: '' })
    }
  }, [isOpen, currentApp])

  const isDirty = useMemo(() => {
    if (!formData || !currentApp) return false
    return JSON.stringify(formData.signatories) !== JSON.stringify(currentApp.signatories)
  }, [formData, currentApp])

  const signatoryOptions = useMemo(
    () =>
      MOCK_SIGNATORIES_DATABASE.map((sig) => ({
        value: sig.id,
        label: `${sig.name} - ${sig.position}`,
      })),
    [],
  )

  const getTotalSignatoriesCount = useCallback(() => {
    if (!formData?.signatories) return 0
    return Object.values(formData.signatories).reduce((acc, arr) => acc + (arr?.length || 0), 0)
  }, [formData])

  /**
   * Get signatories array for a role key
   */
  const getSignatoriesForRole = useCallback(
    (roleKey: string): Signatory[] => {
      return formData?.signatories?.[roleKey as keyof SignatoryBlock] || []
    },
    [formData],
  )

  /**
   * Handle signatory name selection - auto-populate position and department
   */
  const handleSignatoryNameSelect = useCallback((selectedId: string) => {
    const selected = MOCK_SIGNATORIES_DATABASE.find((sig) => sig.id === selectedId)
    if (selected) {
      setEditingForm({
        name: selected.name,
        position: selected.position,
        department: selected.department,
        signatureDate: editingForm.signatureDate || '',
      })
    }
  }, [editingForm.signatureDate])

  /**
   * Start editing a signatory or create new one
   */
  const handleStartEditingSignatory = useCallback(
    (roleKey: string, signatoryIndex: number | null = null) => {
      setEditingState({ roleKey, signatoryIndex })

      if (signatoryIndex !== null) {
        // Edit existing
        const signataries = getSignatoriesForRole(roleKey)
        const signatory = signataries[signatoryIndex]
        if (signatory) {
          setEditingForm({
            name: signatory.name,
            position: signatory.position,
            department: signatory.department,
            signatureDate: signatory.signatureDate || '',
          })
        }
      } else {
        // New signatory
        setEditingForm({
          name: '',
          position: '',
          department: '',
          signatureDate: '',
        })
      }
    },
    [getSignatoriesForRole],
  )

  /**
   * Save signatory (add or update)
   */
  const handleSaveSignatory = useCallback(() => {
    if (!formData || !editingForm.name || !editingForm.position || !editingForm.department) {
      toast.error('Please fill in all required fields')
      return
    }

    const { roleKey, signatoryIndex } = editingState
    if (!roleKey) return

    const newSignatory: Signatory = {
      id: `sig-${Date.now()}`,
      name: editingForm.name,
      position: editingForm.position,
      department: editingForm.department,
      signatureDate: editingForm.signatureDate || undefined,
    }

    const updated = { ...formData }

    if (!updated.signatories) {
      updated.signatories = {}
    }

    if (signatoryIndex !== null) {
      // Update existing
      const signatories = getSignatoriesForRole(roleKey)
      signatories[signatoryIndex] = newSignatory
      updated.signatories[roleKey as keyof SignatoryBlock] = [...signatories]
      toast.success('Signatory updated successfully')
    } else {
      // Add new
      const signatories = getSignatoriesForRole(roleKey)
      updated.signatories[roleKey as keyof SignatoryBlock] = [...signatories, newSignatory]
      toast.success('Signatory added successfully')
    }

    setFormData(updated)
    setEditingState({ roleKey: null, signatoryIndex: null })
    setEditingForm({ name: '', position: '', department: '', signatureDate: '' })
  }, [formData, editingState, editingForm, getSignatoriesForRole])

  /**
   * Remove a signatory
   */
  const handleRemoveSignatory = useCallback(
    (roleKey: string, signatoryIndex: number) => {
      if (!formData) return

      const updated = { ...formData }
      const signatories = getSignatoriesForRole(roleKey)
      const newSignatories = signatories.filter((_, idx) => idx !== signatoryIndex)

      updated.signatories[roleKey as keyof SignatoryBlock] =
        newSignatories.length > 0 ? newSignatories : undefined

      setFormData(updated)
      toast.success('Signatory removed')
    },
    [formData, getSignatoriesForRole],
  )

  /**
   * Handle saving all changes
   */
  const handleSave = useCallback(async () => {
    if (!formData || isSaving) return

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCurrentApp(formData)
      setAppList(appList.map((app) => (app.id === formData.id ? formData : app)))

      toast.success('Signatories updated successfully!')
      handleOpenChange(false)
    } catch (error) {
      console.error('Failed to update signatories:', error)
      toast.error('Failed to update signatories')
    } finally {
      setIsSaving(false)
    }
  }, [formData, isSaving, setCurrentApp, setAppList, appList, handleOpenChange])

  /**
   * Handle dialog close with unsaved changes check
   */
  const handleDialogOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen === false && (isDirty || editingState.roleKey)) {
        setShowUnsavedWarning(true)
        return
      }
      handleOpenChange(newOpen)
    },
    [isDirty, editingState.roleKey, handleOpenChange],
  )

  /**
   * Handle close without saving
   */
  const handleCancel = useCallback(() => {
    if (isDirty || editingState.roleKey) {
      setShowUnsavedWarning(true)
    } else {
      handleOpenChange(false)
    }
  }, [isDirty, editingState.roleKey, handleOpenChange])

  /**
   * Confirm discard of changes
   */
  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedWarning(false)
    setFormData(null)
    setEditingState({ roleKey: null, signatoryIndex: null })
    handleOpenChange(false)
  }, [handleOpenChange])

  /**
   * Toggle role section expansion
   */
  const toggleRoleExpanded = useCallback((roleKey: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev)
      if (next.has(roleKey)) {
        next.delete(roleKey)
      } else {
        next.add(roleKey)
      }
      return next
    })
  }, [])

  if (!formData) return null

  return (
    <>
      <ResponsiveDialog
        size="xl"
        open={isOpen}
        onOpenChange={handleDialogOpenChange}
        title="Manage Signatories"
        description="Configure signatories and approvers for this Annual Procurement Plan"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 scrollbar-hide">
          {/* Signatory Roles Sections */}
          <div className="space-y-4">
            {SIGNATORY_TYPES.map(({ key, label, color, lightBg, borderColor }) => {
              const signatories = getSignatoriesForRole(key)
              const isExpanded = expandedRoles.has(key)
              const isEditing = editingState.roleKey === key

              return (
                <div key={key}>
                  {/* Role Header with Collapse Toggle and Add Button */}
                  <div className={`border border-l-4 rounded-lg p-3 ${lightBg} ${borderColor}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleRoleExpanded(key)}
                          className="p-1 hover:bg-white rounded transition-colors"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <div>
                          <Badge className={color + ' mr-2'}>{label}</Badge>
                          <span className="text-sm text-gray-600 font-medium">
                            {signatories.length} signatory{signatories.length !== 1 ? 'ies' : ''} added
                          </span>
                        </div>
                      </div>

                      {/* Inline Add Button - Easy Access */}
                      {!isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEditingSignatory(key, null)}
                          className="gap-2 border-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="space-y-3 mt-3 pt-3 border-t">
                        {/* Existing Signatories List */}
                        {signatories.length > 0 && !isEditing && (
                          <div className="space-y-2 mb-3">
                            {signatories.map((signatory, idx) => (
                              <Card key={idx} className="bg-white">
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-gray-900 truncate">
                                        {signatory.name}
                                      </p>
                                      <p className="text-xs text-gray-600 truncate">
                                        {signatory.position}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {signatory.department}
                                      </p>
                                      {signatory.signatureDate && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Signed: {signatory.signatureDate}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleStartEditingSignatory(key, idx)}
                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveSignatory(key, idx)}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Edit/Add Form */}
                        {isEditing && (
                          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900">
                                  {editingState.signatoryIndex !== null ? 'Edit' : 'Add'}{' '}
                                  {label}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingState({ roleKey: null, signatoryIndex: null })
                                    setEditingForm({
                                      name: '',
                                      position: '',
                                      department: '',
                                      signatureDate: '',
                                    })
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                                    Name * (Select from list)
                                  </label>
                                  <Combobox
                                    options={signatoryOptions}
                                    value={MOCK_SIGNATORIES_DATABASE.find(
                                      (sig) => sig.name === editingForm.name,
                                    )?.id || ''}
                                    onValueChange={handleSignatoryNameSelect}
                                    placeholder="Select a signatory..."
                                    searchPlaceholder="Search by name or position..."
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">
                                    Position * (Auto-populated)
                                  </label>
                                  <Input
                                    placeholder="e.g., Procurement Officer"
                                    value={editingForm.position}
                                    onChange={(e) =>
                                      setEditingForm({ ...editingForm, position: e.target.value })
                                    }
                                    className="text-sm bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">
                                    Department * (Auto-populated)
                                  </label>
                                  <Input
                                    placeholder="e.g., Supply & Logistics"
                                    value={editingForm.department}
                                    onChange={(e) =>
                                      setEditingForm({ ...editingForm, department: e.target.value })
                                    }
                                    className="text-sm bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">
                                    Signature Date (Optional)
                                  </label>
                                  <Input
                                    type="date"
                                    value={editingForm.signatureDate || ''}
                                    onChange={(e) =>
                                      setEditingForm({ ...editingForm, signatureDate: e.target.value })
                                    }
                                    className="text-sm"
                                  />
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingState({ roleKey: null, signatoryIndex: null })
                                      setEditingForm({
                                        name: '',
                                        position: '',
                                        department: '',
                                        signatureDate: '',
                                      })
                                    }}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleSaveSignatory}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    size="sm"
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary Card */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
              Total Signatories Configured
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {getTotalSignatoriesCount()}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {getTotalSignatoriesCount() === 0
                ? 'Start by adding signatories for each role'
                : 'Ready to save when you are done'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </ResponsiveDialog>

      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent className="z-[99999] pointer-events-auto" style={{ zIndex: 99999 }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have made changes to the signatories. Are you sure you want to discard these
              changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel
              onClick={() => setShowUnsavedWarning(false)}
              className="bg-white"
            >
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
