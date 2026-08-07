import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'

import { useRatingScaleTemplateQuery, useUpdateRatingScaleTemplateMutation } from '../../hooks/useRatingScaleTemplateAPI'
import type {
  KPILineItem,
  RatingLevel,
  RatingScaleTemplate,
  RatingScaleType,
} from '../../types'

interface RatingScaleTemplateEditorProps {
  item: KPILineItem
  isReadOnly: boolean
  editMode: boolean
  showTemplateDetails: boolean
  draftTemplate: RatingScaleTemplate | null
  setDraftTemplate: (value: RatingScaleTemplate | null) => void
  setEditMode: (value: boolean) => void
  onUpdateScaleType: (id: string, v: RatingScaleType) => void
  onUpdateRatingLevel: (
    id: string,
    level: RatingLevel['level'],
    updates: Partial<Pick<RatingLevel, 'description' | 'min' | 'max'>>,
  ) => void
  onUpdateIsScaleEditable: (id: string, v: boolean) => void
  onUpdateIsMOVEditable: (id: string, v: boolean) => void
  onAddConfiguredMOVName: (id: string, name: string) => void
  onUpdateConfiguredMOVName: (id: string, index: number, name: string) => void
  onRemoveConfiguredMOVName: (id: string, index: number) => void
}

export function RatingScaleTemplateEditor({
  item,
  isReadOnly,
  editMode,
  showTemplateDetails,
  draftTemplate,
  setDraftTemplate,
  setEditMode,
  onUpdateScaleType,
  onUpdateRatingLevel,
  onUpdateIsScaleEditable,
  onUpdateIsMOVEditable,
  onAddConfiguredMOVName,
  onUpdateConfiguredMOVName,
  onRemoveConfiguredMOVName,
}: RatingScaleTemplateEditorProps) {
  const { data: ratingScaleTemplate } = useRatingScaleTemplateQuery(
    item.ratingScaleTemplateId,
  )
  const updateTemplateMutation = useUpdateRatingScaleTemplateMutation()

  useEffect(() => {
    if (ratingScaleTemplate && draftTemplate?.id !== ratingScaleTemplate.id) {
      setDraftTemplate(ratingScaleTemplate)
    }
  }, [draftTemplate?.id, ratingScaleTemplate, setDraftTemplate])

  return (
    <div className="px-4 py-2 border-t border-b bg-muted/10 space-y-2">
      <div className="rounded-md border bg-background p-3 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs font-semibold">Configure Rating Levels</p>
          <div className="flex items-center gap-2">
            {editMode ? (
              ratingScaleTemplate ? (
                <Select
                  value={draftTemplate?.isFixed ? 'FIXED' : 'NON_FIXED'}
                  onValueChange={(v) => {
                    if (draftTemplate) {
                      setDraftTemplate({
                        ...draftTemplate,
                        isFixed: v === 'FIXED',
                      })
                    }
                  }}
                  disabled={!item.isScaleEditable}
                >
                  <SelectTrigger className="h-7 w-[150px] text-xs">
                    <SelectValue placeholder="Scale Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed</SelectItem>
                    <SelectItem value="NON_FIXED">Non-Fixed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={item.scaleType}
                  onValueChange={(v) =>
                    onUpdateScaleType(item.id, v as RatingScaleType)
                  }
                >
                  <SelectTrigger
                    className="h-7 w-[150px] text-xs"
                    disabled={!item.isScaleEditable}
                  >
                    <SelectValue placeholder="Scale Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed</SelectItem>
                    <SelectItem value="NON_FIXED">Non-Fixed</SelectItem>
                  </SelectContent>
                </Select>
              )
            ) : null}
          </div>
        </div>

        {ratingScaleTemplate && (
          <div className="p-3 bg-muted/20 border rounded-lg space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800">
                Template: {ratingScaleTemplate.name || 'Untitled'}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {ratingScaleTemplate.isFixed ? 'Fixed Scale' : 'Non-Fixed Scale'}
              </Badge>
            </div>
            {ratingScaleTemplate.description && (
              <p className="text-[11px] text-muted-foreground">
                {ratingScaleTemplate.description}
              </p>
            )}
          </div>
        )}

        {showTemplateDetails || editMode ? (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
              <div>
                <p className="text-[11px] font-semibold">Dimensions</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(['quality', 'efficiency', 'timeliness'] as const).map(
                    (dim) => (
                      <Badge
                        key={dim}
                        variant={item.tags.includes(dim) ? 'outline' : 'soft'}
                        className="text-[11px]"
                      >
                        {dim === 'quality'
                          ? 'Q'
                          : dim === 'efficiency'
                            ? 'E'
                            : 'T'}
                        {item.tags.includes(dim)
                          ? ` · ${dim[0].toUpperCase() + dim.slice(1)}`
                          : ''}
                      </Badge>
                    ),
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold">Configured MOV</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(item.configuredMOVs ?? []).length > 0 ? (
                    (item.configuredMOVs ?? []).map((configuredMOV, index) =>
                      editMode ? (
                        <div
                          key={`${item.id}-cfg-dtl-edit-${index}`}
                          className="flex items-center gap-2"
                        >
                          <Input
                            value={configuredMOV}
                            onChange={(e) =>
                              onUpdateConfiguredMOVName(
                                item.id,
                                index,
                                e.target.value,
                              )
                            }
                            className="h-7 text-xs"
                            onClick={(e) => e.stopPropagation()}
                            disabled={!item.isMOVEditable}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemoveConfiguredMOVName(item.id, index)
                            }}
                            className="h-7 w-7"
                            disabled={!item.isMOVEditable}
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          key={`${item.id}-cfg-dtl-${index}`}
                          variant="outline"
                          className="text-[11px] py-1 px-3"
                        >
                          {configuredMOV}
                        </Badge>
                      ),
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No configured MOV
                    </p>
                  )}
                </div>
                {editMode && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddConfiguredMOVName(item.id, 'New MOV')
                      }}
                      disabled={!item.isMOVEditable}
                    >
                      Add MOV
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold">Governance Toggles</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4 p-2 rounded-lg border bg-slate-50/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold">
                        Scale Configurable
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Allow adjusting rating levels
                      </p>
                    </div>
                    <Switch
                      checked={item.isScaleEditable}
                      onCheckedChange={(checked) =>
                        onUpdateIsScaleEditable(item.id, checked)
                      }
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 p-2 rounded-lg border bg-slate-50/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold">
                        MOV Configurable
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Allow editing MOV requirements
                      </p>
                    </div>
                    <Switch
                      checked={item.isMOVEditable}
                      onCheckedChange={(checked) =>
                        onUpdateIsMOVEditable(item.id, checked)
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>
            </div>

            {ratingScaleTemplate
              ? draftTemplate?.RatingScaleLevels &&
                [...draftTemplate.RatingScaleLevels]
                  .sort((a, b) => b.ratingValue - a.ratingValue)
                  .map((levelItem) => (
                    <div
                      key={levelItem.ratingValue || levelItem.id}
                      className="rounded border p-2 bg-slate-50/30"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[110px_1.6fr_0.7fr_0.7fr] gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-[11px]">Level Number</Label>
                          <p className="text-xs font-semibold text-cyan-600 border rounded px-2 py-1.5 bg-muted/20">
                            Level {levelItem.ratingValue}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">Level Description</Label>
                          {editMode ? (
                            <Input
                              value={levelItem.description || ''}
                              onChange={(e) => {
                                if (!draftTemplate) return
                                setDraftTemplate({
                                  ...draftTemplate,
                                  RatingScaleLevels: draftTemplate.RatingScaleLevels.map(
                                    (level) =>
                                      level.ratingValue === levelItem.ratingValue
                                        ? {
                                            ...level,
                                            description: e.target.value,
                                          }
                                        : level,
                                  ),
                                })
                              }}
                              placeholder="e.g. Outstanding"
                              className="h-7 text-xs"
                              disabled={!item.isScaleEditable}
                            />
                          ) : (
                            <p className="text-xs border rounded px-2 py-1.5 bg-muted/20">
                              {levelItem.description || '—'}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            Minimum Threshold
                          </Label>
                          {editMode ? (
                            <Input
                              type="number"
                              step={0.01}
                              value={levelItem.minValue ?? ''}
                              onChange={(e) => {
                                if (!draftTemplate) return
                                const value = parseFloat(e.target.value)
                                setDraftTemplate({
                                  ...draftTemplate,
                                  RatingScaleLevels: draftTemplate.RatingScaleLevels.map(
                                    (level) =>
                                      level.ratingValue === levelItem.ratingValue
                                        ? {
                                            ...level,
                                            minValue: Number.isNaN(value)
                                              ? undefined
                                              : value,
                                          }
                                        : level,
                                  ),
                                })
                              }}
                              placeholder="Min"
                              className="h-7 text-xs"
                              disabled={!item.isScaleEditable}
                            />
                          ) : (
                            <p className="text-xs border rounded px-2 py-1.5 bg-muted/20">
                              {levelItem.minValue ?? '—'}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            Maximum Threshold
                          </Label>
                          {editMode ? (
                            <Input
                              type="number"
                              step={0.01}
                              value={levelItem.maxValue ?? ''}
                              onChange={(e) => {
                                if (!draftTemplate) return
                                const value = parseFloat(e.target.value)
                                setDraftTemplate({
                                  ...draftTemplate,
                                  RatingScaleLevels: draftTemplate.RatingScaleLevels.map(
                                    (level) =>
                                      level.ratingValue === levelItem.ratingValue
                                        ? {
                                            ...level,
                                            maxValue: Number.isNaN(value)
                                              ? undefined
                                              : value,
                                          }
                                        : level,
                                  ),
                                })
                              }}
                              placeholder="Max"
                              className="h-7 text-xs"
                              disabled={!item.isScaleEditable}
                            />
                          ) : (
                            <p className="text-xs border rounded px-2 py-1.5 bg-muted/20">
                              {levelItem.maxValue ?? '—'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              : [...item.ratingLevels]
                  .sort((a, b) => b.level - a.level)
                  .map((levelItem) => (
                    <div key={levelItem.level} className="rounded border p-2">
                      <div className="grid grid-cols-1 md:grid-cols-[110px_1.6fr_0.7fr_0.7fr] gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-[11px]">Level Number</Label>
                          <p className="text-xs font-semibold text-cyan-600 border rounded px-2 py-1.5 bg-muted/20">
                            Level {levelItem.level}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">Level Description</Label>
                          {editMode ? (
                            <Input
                              value={levelItem.description}
                              onChange={(e) =>
                                onUpdateRatingLevel(item.id, levelItem.level, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="e.g. Outstanding"
                              className="h-7 text-xs"
                              disabled={!item.isScaleEditable}
                            />
                          ) : (
                            <p className="text-xs border rounded px-2 py-1.5 bg-muted/20">
                              {levelItem.description || '—'}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            Minimum Threshold
                          </Label>
                          {editMode ? (
                            <Input
                              type="number"
                              step={0.01}
                              value={levelItem.min ?? ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value)
                                onUpdateRatingLevel(item.id, levelItem.level, {
                                  min: Number.isNaN(value) ? null : value,
                                })
                              }}
                              placeholder="Min"
                              className="h-7 text-xs"
                              disabled={!item.isScaleEditable}
                            />
                          ) : (
                            <p className="text-xs border rounded px-2 py-1.5 bg-muted/20">
                              {levelItem.min ?? '—'}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            Maximum Threshold
                          </Label>
                          {editMode ? (
                            <Input
                              type="number"
                              step={0.01}
                              value={levelItem.max ?? ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value)
                                onUpdateRatingLevel(item.id, levelItem.level, {
                                  max: Number.isNaN(value) ? null : value,
                                })
                              }}
                              placeholder="Max"
                              className="h-7 text-xs"
                              disabled={!item.isScaleEditable}
                            />
                          ) : (
                            <p className="text-xs border rounded px-2 py-1.5 bg-muted/20">
                              {levelItem.max ?? '—'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

            {editMode && ratingScaleTemplate && (
              <div className="flex justify-end pt-2 border-t mt-3">
                <Button
                  size="sm"
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (!draftTemplate) return
                    await updateTemplateMutation.mutateAsync({
                      id: draftTemplate.id,
                      payload: {
                        name: draftTemplate.name,
                        description: draftTemplate.description,
                        isFixed: draftTemplate.isFixed,
                        RatingScaleLevels: draftTemplate.RatingScaleLevels.map(
                          (level) => ({
                            id: level.id,
                            ratingScaleTemplateId: level.ratingScaleTemplateId,
                            ratingValue: level.ratingValue,
                            description: level.description,
                            minValue: level.minValue ?? undefined,
                            maxValue: level.maxValue ?? undefined,
                          }),
                        ),
                      },
                    })
                    setEditMode(false)
                  }}
                  disabled={updateTemplateMutation.isPending}
                  className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {updateTemplateMutation.isPending && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  Save Template Changes
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border bg-white p-3 shadow-sm">
            <div className="space-y-2">
              {ratingScaleTemplate
                ? [...ratingScaleTemplate.RatingScaleLevels]
                    .sort((a, b) => b.ratingValue - a.ratingValue)
                    .map((levelItem) => (
                      <div
                        key={levelItem.ratingValue || levelItem.id}
                        className="grid grid-cols-[56px_1fr_96px] items-center gap-3 py-2"
                      >
                        <div className="flex items-center justify-center w-9 h-9 rounded-full border border-cyan-300 text-cyan-700 font-semibold text-sm bg-cyan-50">
                          {levelItem.ratingValue}
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {levelItem.description || '—'}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-block px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">
                            {levelItem.minValue ?? '—'}–{levelItem.maxValue ?? '—'}
                          </span>
                        </div>
                      </div>
                    ))
                : [...item.ratingLevels]
                    .sort((a, b) => b.level - a.level)
                    .map((levelItem) => (
                      <div
                        key={levelItem.level}
                        className="grid grid-cols-[56px_1fr_96px] items-center gap-3 py-2"
                      >
                        <div className="flex items-center justify-center w-9 h-9 rounded-full border border-primary/30 text-primary font-semibold text-base bg-primary/5">
                          {levelItem.level}
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {levelItem.description || '—'}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-block px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                            {levelItem.min ?? '—'}–{levelItem.max ?? '—'}
                          </span>
                        </div>
                      </div>
                    ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
