import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
} from 'lucide-react'
import { useRealignmentStore } from '../store/realignmentStore'
import {
  calculateObjectGroupTotal,
} from '../utils/realignmentExport'
import {
  AddObjectGroupDialog,
  AddDescGroupDialog,
  AddProjectItemDialog,
} from '../dialogs/ProjectRealignmentDialogs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import CreateWfpLineItemBudgetDetailsForm, {
  LineItemWithId,
} from '@/features/planning/line-item-budgeting/line-item-budget-details/components/CreateWfpLineItemBudgetDetailsForm'
import type { DescriptionGroup, ChangeIndicator } from '../types/realignment.types'
import api from '@/services/api'
import { adaptApiOrphansToProjectGroups } from '../utils/realignmentMapper'

export function ProjectRealignmentView() {
  const {
    editMode,
    selectedFiscalYear,
    selectedWfpId,
    viewingVersion,
    compareWithVersion,
    editingItemId,
    projectGroupsByWfpYear,
    projectVersions,
    activeLibId,
    projectGroups,
    handleStartItemEdit,
    handleSaveItemEdit,
    handleCancelItemEdit,
    handleAddObjectGroup,
    handleAddDescGroup,
    handleAddProjectItem: _handleAddProjectItem,
    handleUpdateProjectItem,
    setProjectGroups,
  } = useRealignmentStore()

  const { toast } = useToast()

  const reloadProjectGroups = async () => {
    if (!activeLibId) return
    try {
      const res = await api.get(`/libs/${activeLibId}`).then((res) => res.data)
      const orphansData = res.data?.data?.orphanDetails || res.data?.orphanDetails || []
      const mapped = adaptApiOrphansToProjectGroups(orphansData)
      setProjectGroups(mapped)
    } catch (err) {
      console.error('Failed to reload project groups:', err)
    }
  }

  // Local UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddProjectLineItemDialog, setShowAddProjectLineItemDialog] = useState(false)
  const [expandedObjectGroups, setExpandedObjectGroups] = useState<string[]>([])
  const [expandedDescGroups, setExpandedDescGroups] = useState<string[]>([])

  // Dialog Controls
  const [showAddObjectDialog, setShowAddObjectDialog] = useState(false)
  const [showAddDescGroupDialog, setShowAddDescGroupDialog] = useState(false)
  const [showAddProjectItemDialog, setShowAddProjectItemDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)

  // Contexts
  const [addContext, setAddContext] = useState<{
    type: 'object' | 'descGroup' | 'projectItem'
    objectId?: string
    descGroupId?: string
  } | null>(null)

  const [deleteContext, setDeleteContext] = useState<{
    type: 'object' | 'descGroup' | 'projectItem'
    objectId?: string
    descGroupId?: string
    itemId?: string
    name: string
  } | null>(null)

  // Resolve current active project groups tree based on versioning
  const projectVersionsList = activeLibId !== null
    ? projectVersions[selectedFiscalYear]?.[activeLibId] || []
    : projectVersions[selectedFiscalYear]?.[selectedWfpId] || []

  const activeProjectGroups = activeLibId !== null
    ? projectGroups
    : projectGroupsByWfpYear[selectedFiscalYear]?.[selectedWfpId] || []

  const currentProjectGroups = viewingVersion !== null
    ? projectVersionsList.find((v) => v.version === viewingVersion)?.objectGroups || []
    : activeProjectGroups

  // Filter groups based on search query
  const displayedObjectGroups = currentProjectGroups.filter((group) => {
    if (!searchQuery.trim()) return true
    return (
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.code.includes(searchQuery) ||
      group.descriptionGroups.some((dg) =>
        dg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dg.items.some((item) =>
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    )
  })

  // Calculation helpers
  const calculateDescriptionGroupTotal = (dg: DescriptionGroup): number => {
    return dg.items.reduce((sum, item) => sum + (item.isDeleted ? 0 : item.budget || 0), 0)
  }

  // Toggles
  const toggleObjectGroup = (id: string) => {
    setExpandedObjectGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const toggleDescGroup = (id: string) => {
    setExpandedDescGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  // Change detection indicators (Project)
  const getObjectGroupChangeIndicator = (groupId: string): ChangeIndicator => {
    if (!compareWithVersion || !viewingVersion) return 'unchanged'
    const curV = projectVersionsList.find(
      (v) => v.version === Math.max(viewingVersion, compareWithVersion),
    )
    const prevV = projectVersionsList.find(
      (v) => v.version === Math.min(viewingVersion, compareWithVersion),
    )
    if (!curV || !prevV) return 'unchanged'

    const curG = curV.objectGroups.find((g) => g.id === groupId)
    const prevG = prevV.objectGroups.find((g) => g.id === groupId)

    if (!prevG && curG) return 'added'
    if (!curG && prevG) return 'deleted'
    if (!curG || !prevG) return 'unchanged'

    return calculateObjectGroupTotal(curG) !== calculateObjectGroupTotal(prevG)
      ? 'edited'
      : 'unchanged'
  }

  const getDescGroupChangeIndicator = (
    groupId: string,
    descGroupId: string,
  ): ChangeIndicator => {
    if (!compareWithVersion || !viewingVersion) return 'unchanged'
    const curV = projectVersionsList.find(
      (v) => v.version === Math.max(viewingVersion, compareWithVersion),
    )
    const prevV = projectVersionsList.find(
      (v) => v.version === Math.min(viewingVersion, compareWithVersion),
    )
    if (!curV || !prevV) return 'unchanged'

    const curG = curV.objectGroups.find((g) => g.id === groupId)
    const prevG = prevV.objectGroups.find((g) => g.id === groupId)
    if (!prevG || !curG) return 'unchanged'

    const curD = curG.descriptionGroups.find((d) => d.id === descGroupId)
    const prevD = prevG.descriptionGroups.find((d) => d.id === descGroupId)

    if (!prevD && curD) return 'added'
    if (!curD && prevD) return 'deleted'
    if (!curD || !prevD) return 'unchanged'

    return calculateDescriptionGroupTotal(curD) !== calculateDescriptionGroupTotal(prevD)
      ? 'edited'
      : 'unchanged'
  }

  const getProjectItemChangeIndicator = (
    groupId: string,
    descGroupId: string,
    itemId: string,
  ): ChangeIndicator => {
    if (!compareWithVersion || !viewingVersion) return 'unchanged'
    const curV = projectVersionsList.find(
      (v) => v.version === Math.max(viewingVersion, compareWithVersion),
    )
    const prevV = projectVersionsList.find(
      (v) => v.version === Math.min(viewingVersion, compareWithVersion),
    )
    if (!curV || !prevV) return 'unchanged'

    const curG = curV.objectGroups.find((g) => g.id === groupId)
    const prevG = prevV.objectGroups.find((g) => g.id === groupId)
    if (!prevG || !curG) return 'unchanged'

    const curD = curG.descriptionGroups.find((d) => d.id === descGroupId)
    const prevD = prevG.descriptionGroups.find((d) => d.id === descGroupId)
    if (!prevD || !curD) return 'unchanged'

    const curI = curD.items.find((i) => i.id === itemId)
    const prevI = prevD.items.find((i) => i.id === itemId)

    if (!prevI && curI) return 'added'
    if (!curI && prevI) return 'deleted'
    if (!curI || !prevI) return 'unchanged'

    return curI.qty !== prevI.qty ||
      curI.unitCost !== prevI.unitCost ||
      curI.description !== prevI.description
      ? 'edited'
      : 'unchanged'
  }

  const getChangeColor = (indicator: ChangeIndicator) => {
    switch (indicator) {
      case 'added':
        return 'bg-green-50/40 border-l-4 border-l-green-500 border border-green-200 shadow-sm'
      case 'deleted':
        return 'bg-red-50/40 border-l-4 border-l-red-500 border border-red-200 shadow-sm'
      case 'edited':
        return 'bg-yellow-50/40 border-l-4 border-l-yellow-500 border border-yellow-200 shadow-sm'
      default:
        return ''
    }
  }

  const getChangeIndicatorBadge = (indicator: ChangeIndicator) => {
    if (indicator === 'unchanged') return null
    const badges: Record<
      ChangeIndicator,
      { bg: string; text: string; icon: string; label: string }
    > = {
      added: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓', label: 'Added' },
      deleted: { bg: 'bg-red-100', text: 'text-red-700', icon: '✕', label: 'Deleted' },
      edited: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '◆', label: 'Edited' },
      unchanged: { bg: 'bg-slate-100', text: 'text-slate-600', icon: '○', label: 'Unchanged' },
    }
    const badge = badges[indicator]
    if (!badge) return null
    return (
      <Badge
        variant="outline"
        className={`${badge.bg} ${badge.text} border border-current text-[10px] font-semibold px-1.5 py-0.5 gap-1`}
      >
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </Badge>
    )
  }

  // Delete Action Confirm Handler
  const handleDeleteConfirm = async () => {
    if (!deleteContext) return

    const { type, itemId } = deleteContext

    try {
      if (type === 'projectItem' && itemId) {
        await api.delete(`/line-item-budget-details/${itemId}`)
        toast({
          title: 'Deleted Successfully',
          description: 'The budget line item has been deleted.',
        })
        await reloadProjectGroups()
      }
    } catch (err) {
      console.error('Failed to delete item:', err)
      toast({
        title: 'Error',
        description: 'Failed to delete selected item. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeleteContext(null)
      setShowDeleteConfirmDialog(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search project entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-white"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          {editMode && (
            <>
              <Button
                onClick={() => setShowAddProjectLineItemDialog(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white h-9 text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Multiple Line Items
              </Button>
              <Button
                onClick={() => {
                  setAddContext({ type: 'object' })
                  setShowAddObjectDialog(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Object Item
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main projects cards */}
      <div className="space-y-4">
        {displayedObjectGroups.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-sm">
            No project accounts registered for this plan
          </div>
        ) : (
          displayedObjectGroups.map((group) => {
            const changeIndicator = getObjectGroupChangeIndicator(group.id)
            const isGroupExpanded = expandedObjectGroups.includes(group.id)

            return (
              <Card
                key={group.id}
                className={`shadow-sm overflow-hidden border ${getChangeColor(changeIndicator)}`}
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
                  onClick={() => toggleObjectGroup(group.id)}
                >
                  <div className="flex items-center gap-3">
                    {isGroupExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-slate-900 ${changeIndicator === 'deleted' ? 'line-through opacity-60 text-red-700' : ''}`}
                      >
                        {group.name}
                      </span>
                      <span
                        className={`text-xs font-semibold text-slate-500 ${changeIndicator === 'deleted' ? 'line-through opacity-60 text-red-700' : ''}`}
                      >
                        ({group.code})
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-semibold px-2 py-0.5"
                      >
                        WFP - project level
                      </Badge>
                      {getChangeIndicatorBadge(changeIndicator)}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Group Total
                      </p>
                      <p className="font-semibold text-slate-900 text-sm">
                        ₱
                        {calculateObjectGroupTotal(group).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    {editMode && changeIndicator !== 'deleted' && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-600 hover:bg-slate-100"
                          onClick={() => {
                            setAddContext({
                              type: 'descGroup',
                              objectId: group.id,
                            })
                            setShowAddDescGroupDialog(true)
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDeleteContext({
                              type: 'object',
                              objectId: group.id,
                              name: group.name,
                            })
                            setShowDeleteConfirmDialog(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {isGroupExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-4 space-y-4">
                    {(() => {
                      const dgsToRender = [...group.descriptionGroups]
                      if (compareWithVersion && viewingVersion) {
                        const curV = projectVersionsList.find((v) => v.version === viewingVersion)
                        const prevV = projectVersionsList.find((v) => v.version === compareWithVersion)
                        if (curV && prevV) {
                          const prevGroup = prevV.objectGroups.find((g) => g.id === group.id)
                          if (prevGroup) {
                            prevGroup.descriptionGroups.forEach((prevDg) => {
                              if (!dgsToRender.some((dg) => dg.id === prevDg.id)) {
                                dgsToRender.push(prevDg)
                              }
                            })
                          }
                        }
                      }
                      return dgsToRender.map((dg) => {
                        const descChangeIndicator = getDescGroupChangeIndicator(group.id, dg.id)
                        const isDescExpanded = expandedDescGroups.includes(dg.id)

                        return (
                          <div
                            key={dg.id}
                            className={`border border-slate-200 rounded-lg bg-white overflow-hidden ${getChangeColor(descChangeIndicator)}`}
                          >
                            <div
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/40"
                              onClick={() => toggleDescGroup(dg.id)}
                            >
                              <div className="flex items-center gap-2">
                                {isDescExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span
                                  className={`font-medium text-slate-800 text-xs ${descChangeIndicator === 'deleted' ? 'line-through opacity-60 text-red-700 font-semibold' : ''}`}
                                >
                                  {dg.description}
                                </span>
                                {getChangeIndicatorBadge(descChangeIndicator)}
                              </div>
                              <div
                                className="flex items-center gap-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="font-semibold text-slate-900 text-xs">
                                  ₱
                                  {calculateDescriptionGroupTotal(dg).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                                {editMode && descChangeIndicator !== 'deleted' && (
                                  <div className="flex gap-0.5">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-blue-600 hover:bg-slate-100"
                                      onClick={() => {
                                        setAddContext({
                                          type: 'projectItem',
                                          objectId: group.id,
                                          descGroupId: dg.id,
                                        })
                                        setShowAddProjectItemDialog(true)
                                      }}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-red-600 hover:bg-red-50"
                                      onClick={() => {
                                        setDeleteContext({
                                          type: 'descGroup',
                                          objectId: group.id,
                                          descGroupId: dg.id,
                                          name: dg.description,
                                        })
                                        setShowDeleteConfirmDialog(true)
                                      }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {isDescExpanded && (
                              <div className="p-3 border-t border-slate-100 overflow-x-auto bg-slate-50/10">
                                <table className="w-full text-xs text-left text-slate-500 min-w-[700px]">
                                  <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-600">
                                    <tr>
                                      <th className="py-2 px-3">Description</th>
                                      <th className="py-2 px-3 text-right">Quantity</th>
                                      <th className="py-2 px-3 text-right">Unit Cost</th>
                                      <th className="py-2 px-3 text-right">Total Budget</th>
                                      <th className="py-2 px-3 text-center">Timeline</th>
                                      <th className="py-2 px-3 text-center">Dates</th>
                                      {editMode && <th className="py-2 px-3 text-center w-16">Actions</th>}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {(() => {
                                      const itemsToRender = [...dg.items]
                                      if (compareWithVersion && viewingVersion) {
                                        const curV = projectVersionsList.find((v) => v.version === viewingVersion)
                                        const prevV = projectVersionsList.find((v) => v.version === compareWithVersion)
                                        if (curV && prevV) {
                                          const prevGroup = prevV.objectGroups.find((g) => g.id === group.id)
                                          const prevDg = prevGroup?.descriptionGroups.find((d) => d.id === dg.id)
                                          if (prevDg) {
                                            prevDg.items.forEach((prevItem) => {
                                              if (!itemsToRender.some((item) => item.id === prevItem.id)) {
                                                itemsToRender.push(prevItem)
                                              }
                                            })
                                          }
                                        }
                                      }
                                      return itemsToRender.map((item) => {
                                        const itemChangeIndicator = getProjectItemChangeIndicator(
                                          group.id,
                                          dg.id,
                                          item.id,
                                        )
                                        const isRowEditing = editMode && editingItemId === item.id

                                        return (
                                          <tr
                                            key={item.id}
                                            className={`hover:bg-slate-50/50 ${getChangeColor(itemChangeIndicator)}`}
                                          >
                                            <td className="py-2 px-3 font-medium text-slate-800">
                                              {isRowEditing ? (
                                                <Input
                                                  value={item.description}
                                                  className="h-7 text-xs bg-white"
                                                  onChange={(e) =>
                                                    handleUpdateProjectItem(
                                                      group.id,
                                                      dg.id,
                                                      item.id,
                                                      'description',
                                                      e.target.value,
                                                    )
                                                  }
                                                />
                                              ) : (
                                                <div className="flex items-center gap-1.5">
                                                  <span
                                                    className={
                                                      itemChangeIndicator === 'deleted'
                                                        ? 'line-through opacity-60 text-red-700 font-semibold'
                                                        : ''
                                                    }
                                                  >
                                                    {item.description}
                                                  </span>
                                                  {getChangeIndicatorBadge(itemChangeIndicator)}
                                                </div>
                                              )}
                                            </td>
                                            <td className="py-2 px-3 text-right w-24">
                                              {isRowEditing ? (
                                                <Input
                                                  type="number"
                                                  value={item.qty}
                                                  className="h-7 text-xs bg-white text-right"
                                                  onChange={(e) =>
                                                    handleUpdateProjectItem(
                                                      group.id,
                                                      dg.id,
                                                      item.id,
                                                      'qty',
                                                      e.target.value,
                                                    )
                                                  }
                                                />
                                              ) : (
                                                <span className={itemChangeIndicator === 'deleted' ? 'line-through opacity-60 text-slate-400' : ''}>
                                                  {item.qty}
                                                </span>
                                              )}
                                            </td>
                                            <td className="py-2 px-3 text-right w-32 font-mono">
                                              {isRowEditing ? (
                                                <Input
                                                  type="number"
                                                  value={item.unitCost}
                                                  className="h-7 text-xs bg-white text-right"
                                                  onChange={(e) =>
                                                    handleUpdateProjectItem(
                                                      group.id,
                                                      dg.id,
                                                      item.id,
                                                      'unitCost',
                                                      e.target.value,
                                                    )
                                                  }
                                                />
                                              ) : (
                                                <span className={itemChangeIndicator === 'deleted' ? 'line-through opacity-60 text-slate-400' : ''}>
                                                  ₱{item.unitCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                              )}
                                            </td>
                                            <td className="py-2 px-3 text-right font-semibold text-slate-900 font-mono w-32">
                                              <span className={itemChangeIndicator === 'deleted' ? 'line-through opacity-60 text-red-750' : ''}>
                                                ₱{item.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-center w-28">
                                              {isRowEditing ? (
                                                <Select
                                                  value={item.timelineType}
                                                  onValueChange={(val: any) =>
                                                    handleUpdateProjectItem(
                                                      group.id,
                                                      dg.id,
                                                      item.id,
                                                      'timelineType',
                                                      val,
                                                    )
                                                  }
                                                >
                                                  <SelectTrigger className="h-7 text-xs bg-white">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="ONGOING">ONGOING</SelectItem>
                                                    <SelectItem value="PERIOD">PERIOD</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              ) : (
                                                <Badge
                                                  variant="outline"
                                                  className={
                                                    item.timelineType === 'ONGOING'
                                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                      : 'bg-orange-50 text-orange-700 border-orange-200'
                                                  }
                                                >
                                                  {item.timelineType}
                                                </Badge>
                                              )}
                                            </td>
                                            <td className="py-2 px-3 text-center text-[10px] text-slate-400 w-44">
                                              {isRowEditing ? (
                                                <div className="flex gap-1 items-center">
                                                  <Input
                                                    type="date"
                                                    value={item.startDate}
                                                    className="h-7 text-[10px] bg-white p-1"
                                                    onChange={(e) =>
                                                      handleUpdateProjectItem(
                                                        group.id,
                                                        dg.id,
                                                        item.id,
                                                        'startDate',
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                  <span>to</span>
                                                  <Input
                                                    type="date"
                                                    value={item.endDate}
                                                    className="h-7 text-[10px] bg-white p-1"
                                                    onChange={(e) =>
                                                      handleUpdateProjectItem(
                                                        group.id,
                                                        dg.id,
                                                        item.id,
                                                        'endDate',
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                </div>
                                              ) : (
                                                `${item.startDate} to ${item.endDate}`
                                              )}
                                            </td>
                                            {editMode && (
                                              <td className="py-2 px-3 text-center">
                                                {itemChangeIndicator === 'deleted' ? (
                                                  <Badge
                                                    variant="outline"
                                                    className="bg-red-50 text-red-700 border-red-200 text-[10px]"
                                                  >
                                                    Deleted
                                                  </Badge>
                                                ) : isRowEditing ? (
                                                  <div className="flex justify-center gap-1">
                                                    <Button
                                                      size="icon"
                                                      variant="ghost"
                                                      className="h-6 w-6 text-green-600 hover:text-green-800"
                                                      onClick={async () => {
                                                        try {
                                                          await api.put(`/line-item-budget-details/${item.id}`, {
                                                            description: item.description,
                                                            unitQuantity: Number(item.qty),
                                                            unitCost: Number(item.unitCost),
                                                            budget: Number(item.qty) * Number(item.unitCost),
                                                          })
                                                          toast({
                                                            title: 'Saved Successfully',
                                                            description: 'The line item has been updated.',
                                                          })
                                                          handleSaveItemEdit()
                                                          await reloadProjectGroups()
                                                        } catch (err) {
                                                          console.error('Failed to save project item edit:', err)
                                                          toast({
                                                            title: 'Error',
                                                            description: 'Failed to update line item details.',
                                                            variant: 'destructive',
                                                          })
                                                        }
                                                      }}
                                                      title="Save item"
                                                    >
                                                      <Check className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                      size="icon"
                                                      variant="ghost"
                                                      className="h-6 w-6 text-red-600 hover:text-red-800"
                                                      onClick={handleCancelItemEdit}
                                                      title="Cancel editing"
                                                    >
                                                      <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  <div className="flex justify-center gap-1">
                                                    <Button
                                                      size="icon"
                                                      variant="ghost"
                                                      className="h-6 w-6 text-blue-600 hover:text-blue-800"
                                                      onClick={() => handleStartItemEdit(item.id, item)}
                                                      title="Edit item"
                                                    >
                                                      <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                      size="icon"
                                                      variant="ghost"
                                                      className="h-6 w-6 text-red-600 hover:text-red-800"
                                                      onClick={() => {
                                                        setDeleteContext({
                                                          type: 'projectItem',
                                                          objectId: group.id,
                                                          descGroupId: dg.id,
                                                          itemId: item.id,
                                                          name: item.description,
                                                        })
                                                        setShowDeleteConfirmDialog(true)
                                                      }}
                                                      title="Delete item"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                  </div>
                                                )}
                                              </td>
                                            )}
                                          </tr>
                                        )
                                      })
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* dialog wrappers */}
      {showAddProjectLineItemDialog && activeLibId && (
        <Dialog open={showAddProjectLineItemDialog} onOpenChange={setShowAddProjectLineItemDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Line Items</DialogTitle>
              <DialogDescription>
                Add multiple expenditure line items to this Line Item Budget.
              </DialogDescription>
            </DialogHeader>
            <CreateWfpLineItemBudgetDetailsForm
              libId={activeLibId}
              scope="Project"
              onClose={() => setShowAddProjectLineItemDialog(false)}
              onSubmitOverride={async (items: LineItemWithId[]) => {
                try {
                  const promises = items.map((item) =>
                    api.post(`/line-item-budget-details`, {
                      lineItemBudgetId: activeLibId,
                      objectId: item.objectId,
                      description: item.description,
                      unitQuantity: item.unitQuantity,
                      unitCost: item.unitCost,
                      startDate: item.startDate ? new Date(item.startDate).toISOString() : undefined,
                      endDate: item.endDate ? new Date(item.endDate).toISOString() : undefined,
                      timelineType: item.timelineType,
                      budget: item.budget,
                    })
                  )
                  await Promise.all(promises)
                  toast({
                    title: 'Line Items Added',
                    description: 'Line items successfully added.',
                  })
                  await reloadProjectGroups()
                  setShowAddProjectLineItemDialog(false)
                } catch (err) {
                  console.error(err)
                  toast({
                    title: 'Error',
                    description: 'Failed to add line items to database.',
                    variant: 'destructive',
                  })
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {showAddObjectDialog && (
        <AddObjectGroupDialog
          open={showAddObjectDialog}
          onOpenChange={setShowAddObjectDialog}
          onSubmit={(values) => {
            const finalName = values.itemSelect === 'custom' ? values.customName! : values.itemSelect
            handleAddObjectGroup(values.allotmentClass, finalName)
          }}
        />
      )}

      {showAddDescGroupDialog && addContext?.objectId && (
        <AddDescGroupDialog
          open={showAddDescGroupDialog}
          onOpenChange={setShowAddDescGroupDialog}
          onSubmit={(description) => {
            handleAddDescGroup(addContext.objectId!, description)
          }}
        />
      )}

      {showAddProjectItemDialog && addContext?.objectId && addContext?.descGroupId && (
        <AddProjectItemDialog
          open={showAddProjectItemDialog}
          onOpenChange={setShowAddProjectItemDialog}
          onSubmit={async (values) => {
            try {
              await api.post(`/line-item-budget-details`, {
                lineItemBudgetId: activeLibId,
                objectId: addContext.objectId!,
                description: values.description,
                unitQuantity: values.qty,
                unitCost: values.unitCost,
                startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
                endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
                timelineType: values.timelineType,
                budget: values.qty * values.unitCost,
              })
              toast({
                title: 'Line Item Added',
                description: 'Line item successfully added to the database.',
              })
              await reloadProjectGroups()
              setShowAddProjectItemDialog(false)
            } catch (err) {
              console.error(err)
              toast({
                title: 'Error',
                description: 'Failed to add project line item.',
                variant: 'destructive',
              })
            }
          }}
        />
      )}

      {showDeleteConfirmDialog && deleteContext && (
        <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold">
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                Are you sure you want to delete/remove <strong>{deleteContext.name}</strong> from this budget realignment plan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs h-9">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white text-xs h-9"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
