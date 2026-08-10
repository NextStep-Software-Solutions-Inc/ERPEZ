import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  FileCheck2,
  ListChecks,
  Plus,
  Save,
  Settings2,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type {
  BACWorkspace,
  ProjectChecklist,
  ProjectChecklistEnvelope,
  ProjectChecklistRequirement,
} from '../../types'

interface ProjectChecklistTabProps {
  workspace: BACWorkspace
  onUpdate?: (workspace: Partial<BACWorkspace>) => void
  readOnly?: boolean
}

const STANDARD_GOODS_PROFILE = {
  id: 'public-bidding-goods',
  name: 'Profile 1: Standard Goods',
  description: 'Public Bidding - Goods',
  category: 'Goods',
  procurementMode: 'Public Bidding',
}

const PROFILE_REQUIREMENTS: ProjectChecklistRequirement[] = [
  {
    id: 'omnibus-sworn-statement',
    name: 'Omnibus Sworn Statement',
    envelope: 'Envelope 1',
    enabled: true,
    source: 'profile',
  },
  {
    id: 'philgeps-platinum-certificate',
    name: 'PhilGEPS Platinum Certificate',
    envelope: 'Envelope 1',
    enabled: true,
    source: 'profile',
  },
  {
    id: 'mayors-permit',
    name: "Mayor's Permit",
    envelope: 'Envelope 1',
    enabled: true,
    source: 'profile',
  },
  {
    id: 'bid-securing-declaration',
    name: 'Bid Securing Declaration',
    envelope: 'Envelope 1',
    enabled: true,
    source: 'profile',
  },
  {
    id: 'joint-venture-agreement',
    name: 'Joint Venture Agreement',
    envelope: 'Envelope 1',
    enabled: true,
    source: 'profile',
    note: 'Toggle off when not applicable.',
  },
  {
    id: 'technical-specifications-compliance',
    name: 'Technical Specifications Compliance Statement',
    envelope: 'Envelope 1',
    enabled: true,
    source: 'profile',
  },
  {
    id: 'financial-bid-form',
    name: 'Financial Bid Form',
    envelope: 'Envelope 2',
    enabled: true,
    source: 'profile',
  },
  {
    id: 'price-schedule',
    name: 'Price Schedule for Goods Offered',
    envelope: 'Envelope 2',
    enabled: true,
    source: 'profile',
  },
]

const ENVELOPES: ProjectChecklistEnvelope[] = ['Envelope 1', 'Envelope 2']

function buildStandardGoodsChecklist(): ProjectChecklist {
  return {
    profileId: STANDARD_GOODS_PROFILE.id,
    profileName: STANDARD_GOODS_PROFILE.name,
    profileDescription: STANDARD_GOODS_PROFILE.description,
    projectCategory: STANDARD_GOODS_PROFILE.category,
    procurementMode: STANDARD_GOODS_PROFILE.procurementMode,
    requirements: PROFILE_REQUIREMENTS.map((requirement) => ({ ...requirement })),
    confirmed: false,
  }
}

function normalizeChecklist(checklist?: ProjectChecklist): ProjectChecklist {
  if (!checklist) return buildStandardGoodsChecklist()

  return {
    ...buildStandardGoodsChecklist(),
    ...checklist,
    requirements: checklist.requirements?.length
      ? checklist.requirements
      : buildStandardGoodsChecklist().requirements,
  }
}

function formatConfirmationDate(value?: string) {
  if (!value) return null

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function ProjectChecklistTab({
  workspace,
  onUpdate,
  readOnly = false,
}: ProjectChecklistTabProps) {
  const checklist = useMemo(
    () => normalizeChecklist(workspace.projectChecklist),
    [workspace.projectChecklist],
  )
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [customRequirement, setCustomRequirement] = useState('')
  const [customEnvelope, setCustomEnvelope] =
    useState<ProjectChecklistEnvelope>('Envelope 1')

  useEffect(() => {
    if (!workspace.projectChecklist) {
      onUpdate?.({ projectChecklist: checklist })
    }
  }, [checklist, onUpdate, workspace.projectChecklist])

  const activeRequirements = checklist.requirements.filter(
    (requirement) => requirement.enabled,
  )
  const inactiveRequirements = checklist.requirements.length - activeRequirements.length
  const confirmationDate = formatConfirmationDate(checklist.confirmedAt)

  const updateChecklist = (
    updates: Partial<ProjectChecklist>,
    resetConfirmation = true,
  ) => {
    const nextChecklist: ProjectChecklist = {
      ...checklist,
      ...updates,
      confirmed: resetConfirmation ? false : updates.confirmed ?? checklist.confirmed,
      confirmedAt: resetConfirmation ? undefined : updates.confirmedAt ?? checklist.confirmedAt,
      confirmedBy: resetConfirmation ? undefined : updates.confirmedBy ?? checklist.confirmedBy,
    }

    onUpdate?.({ projectChecklist: nextChecklist })
  }

  const handleToggleRequirement = (requirementId: string, enabled: boolean) => {
    updateChecklist({
      requirements: checklist.requirements.map((requirement) =>
        requirement.id === requirementId ? { ...requirement, enabled } : requirement,
      ),
    })
  }

  const handleAddCustomRequirement = () => {
    const trimmedRequirement = customRequirement.trim()
    if (!trimmedRequirement) return

    updateChecklist({
      requirements: [
        ...checklist.requirements,
        {
          id: `custom-${Date.now()}`,
          name: trimmedRequirement,
          envelope: customEnvelope,
          enabled: true,
          source: 'custom',
        },
      ],
    })
    setCustomRequirement('')
    setCustomEnvelope('Envelope 1')
    setIsAddingCustom(false)
  }

  const handleConfirmChecklist = () => {
    updateChecklist(
      {
        confirmed: true,
        confirmedAt: new Date().toISOString(),
        confirmedBy: 'BAC Secretariat',
      },
      false,
    )
  }

  const requirementsByEnvelope = ENVELOPES.map((envelope) => ({
    envelope,
    requirements: checklist.requirements.filter(
      (requirement) => requirement.envelope === envelope,
    ),
  }))

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-600">
              Checklist Profile
            </Label>
            <Select value={checklist.profileId} disabled={readOnly}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={STANDARD_GOODS_PROFILE.id}>
                  {STANDARD_GOODS_PROFILE.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-blue-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase text-blue-700">
                Auto-loaded
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {checklist.profileDescription}
              </p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase text-emerald-700">
                Category
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {checklist.projectCategory}
              </p>
            </div>
            <div className="rounded-md border border-amber-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase text-amber-700">
                Active Items
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {activeRequirements.length} enabled
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {requirementsByEnvelope.map(({ envelope, requirements }) => (
          <section
            key={envelope}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <FileCheck2 className="h-4 w-4 text-blue-600" />
                  {envelope}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {envelope === 'Envelope 1'
                    ? 'Eligibility and technical documents'
                    : 'Financial bid documents'}
                </p>
              </div>
              <Badge variant="outline" className="border-slate-300 bg-slate-50">
                {requirements.filter((requirement) => requirement.enabled).length}/
                {requirements.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {requirements.map((requirement) => (
                <div
                  key={requirement.id}
                  className="flex min-h-16 items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <Switch
                    checked={requirement.enabled}
                    onCheckedChange={(checked) =>
                      handleToggleRequirement(requirement.id, checked)
                    }
                    disabled={readOnly}
                    color={requirement.enabled ? 'success' : 'dark'}
                    className="mt-1"
                    aria-label={`Toggle ${requirement.name}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="break-words text-sm font-semibold text-slate-900">
                        {requirement.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          requirement.source === 'custom'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }
                      >
                        {requirement.source === 'custom' ? 'Custom' : 'Profile'}
                      </Badge>
                      {!requirement.enabled && (
                        <Badge
                          variant="outline"
                          className="border-slate-300 bg-white text-slate-600"
                        >
                          Off
                        </Badge>
                      )}
                    </div>
                    {requirement.note && (
                      <p className="mt-1 text-xs text-slate-500">
                        {requirement.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <ListChecks className="h-4 w-4 text-slate-700" />
              Custom Requirements
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Add project-specific documents without changing the master profile.
            </p>
          </div>
          {!isAddingCustom && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCustom(true)}
              disabled={readOnly}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Custom Requirement
            </Button>
          )}
        </div>

        {isAddingCustom && (
          <div className="mt-4 grid gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 lg:grid-cols-[1fr_190px_auto]">
            <div className="space-y-1">
              <Label htmlFor="custom-requirement">Requirement Name</Label>
              <Input
                id="custom-requirement"
                value={customRequirement}
                onChange={(event) => setCustomRequirement(event.target.value)}
                placeholder="Mayor's Permit specific to Medical Supplies"
                disabled={readOnly}
                className="bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label>Envelope</Label>
              <Select
                value={customEnvelope}
                onValueChange={(value) =>
                  setCustomEnvelope(value as ProjectChecklistEnvelope)
                }
                disabled={readOnly}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENVELOPES.map((envelope) => (
                    <SelectItem key={envelope} value={envelope}>
                      {envelope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="button"
                onClick={handleAddCustomRequirement}
                disabled={readOnly || !customRequirement.trim()}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsAddingCustom(false)
                  setCustomRequirement('')
                }}
                disabled={readOnly}
                aria-label="Cancel custom requirement"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-slate-700">
            <Settings2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {checklist.confirmed ? 'Checklist confirmed' : 'Checklist pending confirmation'}
            </p>
            <p className="text-xs text-slate-500">
              {checklist.confirmed && confirmationDate
                ? `Confirmed by ${checklist.confirmedBy ?? 'BAC Secretariat'} on ${confirmationDate}`
                : `${inactiveRequirements} item${inactiveRequirements === 1 ? '' : 's'} toggled off`}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleConfirmChecklist}
          disabled={readOnly || activeRequirements.length === 0}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          Confirm Checklist
        </Button>
      </div>
    </div>
  )
}
