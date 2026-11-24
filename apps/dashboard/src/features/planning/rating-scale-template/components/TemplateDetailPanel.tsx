// /**
//  * Template Detail Panel Component
//  * Right panel showing selected template details, preview, and actions
//                   value: template.generalRatingScaleId || 'N/A',

import { useAtom } from 'jotai'
// import { Button } from '@/components/ui/button'
//                   value: template.author || 'N/A',
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  Edit2,
  Trash2,
  User,
  Calendar,
  Clock,
  Activity,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  itemAnimations,
  useReducedMotion,
  animationTimings,
  templateAnimations,
} from '@/utils/animation'
import { RatingScaleTemplate } from '../types'
import { TemplatePreview } from './TemplatePreview'
import {
  selectedTemplateForEditAtom,
  selectedTemplateForDeleteAtom,
  editTemplateDialogOpenAtom,
  deleteTemplateDialogOpenAtom,
} from '../atoms'
import {
  useCreateRatingScaleTemplate,
  useRatingScaleTemplateById,
} from '../useRatingScaleTemplates'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateV2 } from '@/utils/formatters'
import { Spinner } from '@/components/ui/spinner'

interface TemplateDetailPanelProps {
  template: RatingScaleTemplate | null
  isLoading?: boolean
  onTemplateUpdated?: () => void
  hideActions?: boolean
}

export function TemplateDetailPanel({
  template,
  isLoading = false,
  onTemplateUpdated,
  hideActions = false,
}: TemplateDetailPanelProps) {
  const prefersReducedMotion = useReducedMotion()
  const [, setSelectedTemplateForEdit] = useAtom(selectedTemplateForEditAtom)
  const [, setSelectedTemplateForDelete] = useAtom(
    selectedTemplateForDeleteAtom,
  )
  const [, setEditDialogOpen] = useAtom(editTemplateDialogOpenAtom)
  const [, setDeleteDialogOpen] = useAtom(deleteTemplateDialogOpenAtom)
  const createMutation = useCreateRatingScaleTemplate()

  // Fetch the detailed template by ID from the API to get the ratingScaleLevels
  const { data: detailedTemplateResponse, isPending: isDetailPending } =
    useRatingScaleTemplateById({
      pathParams: { id: template?.id ?? '' },
      queryParams: {},
      enabled: !!template?.id,
    })

  const activeTemplate = detailedTemplateResponse?.data ?? template

  const handleEdit = () => {
    if (!activeTemplate) return
    setSelectedTemplateForEdit(activeTemplate)
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    if (!activeTemplate) return
    setSelectedTemplateForDelete(activeTemplate)
    setDeleteDialogOpen(true)
  }

  const handleCloneTemplate = async () => {
    if (!activeTemplate) return

    try {
      const copiedTemplate = {
        name: `${activeTemplate.name} - Copy`,
        description: activeTemplate.description,
        scaleType: activeTemplate.scaleType,
        rating5: { ...activeTemplate.rating5 },
        rating4: { ...activeTemplate.rating4 },
        rating3: { ...activeTemplate.rating3 },
        rating2: { ...activeTemplate.rating2 },
        rating1: { ...activeTemplate.rating1 },
      }

      await createMutation.mutateAsync({
        pathParams: {},
        payload: copiedTemplate,
      })
      toast.success(`Template "${copiedTemplate.name}" created successfully`)
      onTemplateUpdated?.()
    } catch (error) {
      toast.error(
        `Failed to clone template: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  // Button animation variants
  const buttonMotionProps = {
    whileHover: prefersReducedMotion ? {} : { scale: 1.05 },
    whileTap: prefersReducedMotion ? {} : { scale: 0.95 },
    transition: {
      duration: animationTimings.interactive.instant,
    },
  }

  if (!activeTemplate) {
    return (
      <motion.div
        className="flex-1 flex items-center justify-center bg-muted/30"
        initial="hidden"
        animate="show"
        variants={itemAnimations.slideUpFade}
      >
        <div className="text-center space-y-4">
          <motion.div
            className="text-6xl"
            variants={itemAnimations.pop}
            initial="hidden"
            animate="show"
          >
            📋
          </motion.div>
          <h3 className="text-lg font-semibold">No Template Selected</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Select a template from the list to view its details and manage it
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key={activeTemplate.id}
      className="flex-1 overflow-y-auto p-6 space-y-6"
      initial="hidden"
      animate="show"
      variants={
        prefersReducedMotion ? undefined : templateAnimations.detailPanelStagger
      }
    >
      {/* Header with Title and Badges */}
      <motion.div
        className="space-y-4"
        variants={
          prefersReducedMotion
            ? undefined
            : templateAnimations.detailPanelSection
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="text-3xl font-bold">{activeTemplate.name}</h1>
            <div className="flex flex-wrap gap-2">
              <motion.div
                variants={prefersReducedMotion ? undefined : itemAnimations.pop}
                initial="hidden"
                animate="show"
              >
                <Badge
                  color={
                    activeTemplate.scaleType === 'Fixed' ? 'info' : 'warning'
                  }
                  variant="soft"
                >
                  {activeTemplate.scaleType}
                </Badge>
              </motion.div>
              {activeTemplate.isDefault && (
                <motion.div
                  variants={
                    prefersReducedMotion ? undefined : itemAnimations.pop
                  }
                  initial="hidden"
                  animate="show"
                >
                  <Badge color="success" variant="soft">
                    Default
                  </Badge>
                </motion.div>
              )}
              {activeTemplate.isReadOnly && (
                <motion.div
                  variants={
                    prefersReducedMotion ? undefined : itemAnimations.pop
                  }
                  initial="hidden"
                  animate="show"
                >
                  <Badge color="info" variant="soft">
                    Read-only
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>

          {/* Actions */}
          {!hideActions && (
            <div className="flex gap-2">
              {activeTemplate.isReadOnly ? (
                <motion.div {...buttonMotionProps}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloneTemplate}
                    disabled={isLoading}
                    title="Clone this preset template to create a custom copy"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div {...buttonMotionProps}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </motion.div>
                  <motion.div {...buttonMotionProps}>
                    <Button
                      variant="outline"
                      size="sm"
                      color="destructive"
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {activeTemplate.description && (
          <p className="text-sm text-foreground/80 leading-relaxed">
            {activeTemplate.description}
          </p>
        )}
      </motion.div>

      {/* Metadata Card */}
      <motion.div
        variants={
          prefersReducedMotion
            ? undefined
            : {
                hidden: { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: animationTimings.entrance.normal,
                    ease: 'easeOut',
                    delay: 0.1,
                  },
                },
              }
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Information</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              initial="hidden"
              animate="show"
              variants={
                prefersReducedMotion
                  ? undefined
                  : {
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: animationTimings.stagger.tight,
                        },
                      },
                    }
              }
            >
              {[
                {
                  label: 'Author',
                  value: activeTemplate.author || '—',
                  icon: <User className="h-4 w-4 text-primary" />,
                },
                {
                  label: 'Created',
                  value: formatDateV2(activeTemplate.createdAt),
                  icon: <Calendar className="h-4 w-4 text-primary" />,
                },
                {
                  label: 'Last Updated',
                  value: formatDateV2(activeTemplate.updatedAt),
                  icon: <Clock className="h-4 w-4 text-primary" />,
                },
                ...(typeof activeTemplate.usageCount === 'number'
                  ? [
                      {
                        label: 'Usage',
                        value: `${activeTemplate.usageCount} Success Indicator${
                          activeTemplate.usageCount !== 1 ? 's' : ''
                        }`,
                        icon: <Activity className="h-4 w-4 text-primary" />,
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={
                    prefersReducedMotion
                      ? undefined
                      : {
                          hidden: { opacity: 0, y: 8 },
                          show: {
                            opacity: 1,
                            y: 0,
                            transition: {
                              duration: animationTimings.entrance.normal,
                            },
                          },
                        }
                  }
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rating Scale Preview */}
      <motion.div
        variants={
          prefersReducedMotion
            ? undefined
            : {
                hidden: { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: animationTimings.entrance.normal,
                    ease: 'easeOut',
                    delay: 0.2,
                  },
                },
              }
        }
      >
        <Card>
          <CardHeader>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: animationTimings.entrance.normal,
              }}
            >
              <CardTitle className="text-base">Rating Scale</CardTitle>
              <CardDescription>
                Visual representation of the scale levels
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            {isDetailPending && !detailedTemplateResponse ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : activeTemplate ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: animationTimings.entrance.normal,
                  delay: animationTimings.stagger.normal,
                }}
              >
                <TemplatePreview
                  template={activeTemplate}
                  compact={false}
                  hideHeader={true}
                />
              </motion.div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
