/**
 * Template List Sidebar Component
 * Left sidebar showing filterable list of preset and custom rating scale templates
 * Organized with tab-based filtering (All, Preset, Custom)
 */

import { useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  pageAnimations,
  itemAnimations,
  useReducedMotion,
  animationTimings,
  templateAnimations,
} from '@/utils/animation'
import { RatingScaleTemplate } from '../types'
import {
  selectedTemplateAtom,
  templateSearchFilterAtom,
  templateFilterTabAtom,
} from '../atoms'

interface TemplateListSidebarProps {
  presetTemplates: RatingScaleTemplate[]
  customTemplates: RatingScaleTemplate[]
  isLoading?: boolean
}

export function TemplateListSidebar({
  presetTemplates,
  customTemplates,
  isLoading = false,
}: TemplateListSidebarProps) {
  const prefersReducedMotion = useReducedMotion()
  const [selectedTemplate, setSelectedTemplate] = useAtom(selectedTemplateAtom)
  const [searchFilter, setSearchFilter] = useAtom(templateSearchFilterAtom)
  const [filterTab, setFilterTab] = useAtom(templateFilterTabAtom)
  const [tabDirection, setTabDirection] = useState(0)
  const [previousTab, setPreviousTab] = useState<'all' | 'preset' | 'custom'>(
    'all',
  )

  // Tab order for direction calculation
  const tabOrder = { all: 0, preset: 1, custom: 2 }

  const handleTabChange = (value: string) => {
    const newTab = value as 'all' | 'preset' | 'custom'
    const direction = tabOrder[newTab] - tabOrder[previousTab]
    setTabDirection(direction)
    setPreviousTab(newTab)
    setFilterTab(newTab)
  }

  // Filter templates based on search
  const filteredPresets = useMemo(() => {
    const searchLower = searchFilter.toLowerCase()
    return presetTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower),
    )
  }, [presetTemplates, searchFilter])

  const filteredCustom = useMemo(() => {
    const searchLower = searchFilter.toLowerCase()
    return customTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower),
    )
  }, [customTemplates, searchFilter])

  // Custom glow animation for selected state
  const TemplateItem = ({ template }: { template: RatingScaleTemplate }) => {
    const isSelected = selectedTemplate?.id === template.id

    return (
      <motion.button
        onClick={() => setSelectedTemplate(template)}
        className={`w-full text-left px-3.5 py-3 rounded-lg border transition-all duration-200 ${
          isSelected
            ? 'bg-primary/10 border-primary/40 shadow-sm'
            : 'border-transparent hover:bg-muted/60'
        }`}
        disabled={isLoading}
      >
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm leading-tight pr-2">
              {template.name}
            </p>
            <Badge
              variant="soft"
              className="text-xs shrink-0"
              color={template.scaleType === 'Fixed' ? 'info' : 'warning'}
            >
              {template.scaleType === 'Fixed' ? 'Fixed' : 'Non-Fixed'}
            </Badge>
          </div>
          {template.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          )}
          {template.usageCount !== undefined && template.usageCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Used in {template.usageCount} Success Indicator
              {template.usageCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </motion.button>
    )
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Search Header */}
      <div className="p-4 border-b space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-8 h-9 text-sm"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Tab-Based Filtering */}
      <Tabs
        value={filterTab}
        onValueChange={handleTabChange}
        className="flex flex-col h-full"
      >
        <TabsList className="w-full justify-start px-4 pt-3 bg-transparent border-b rounded-none">
          <TabsTrigger value="all" className="text-xs">
            All ({presetTemplates.length + customTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="preset" className="text-xs">
            Preset ({filteredPresets.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs">
            Custom ({filteredCustom.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Content - All Templates */}
        <TabsContent
          value="all"
          className="flex-1 overflow-y-auto mt-0 p-4 pb-20"
        >
          <motion.div
            key="all-tab"
            initial="enter"
            animate="center"
            exit="exit"
            variants={
              prefersReducedMotion
                ? undefined
                : templateAnimations.tabContentSlideSmooth
            }
            custom={tabDirection}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
            }}
          >
            {filteredPresets.length === 0 && filteredCustom.length === 0 ? (
              <motion.p
                initial="hidden"
                animate="show"
                variants={itemAnimations.slideUpFade}
                className="text-xs text-muted-foreground text-center py-8"
              >
                No templates found
              </motion.p>
            ) : (
              <motion.div
                className="space-y-4"
                initial="hidden"
                animate="show"
                variants={
                  prefersReducedMotion
                    ? undefined
                    : templateAnimations.sidebarLoadStagger
                }
              >
                {/* Preset Templates Group */}
                {filteredPresets.length > 0 && (
                  <motion.div
                    className="space-y-3"
                    variants={
                      prefersReducedMotion
                        ? undefined
                        : itemAnimations.slideUpFade
                    }
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                        Preset
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground">
                        ({filteredPresets.length})
                      </span>
                    </div>
                    <motion.div
                      className="space-y-2"
                      variants={
                        prefersReducedMotion
                          ? undefined
                          : pageAnimations.containerTightStagger
                      }
                      initial="hidden"
                      animate="show"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredPresets.map((template) => (
                          <motion.div
                            key={template.id}
                            variants={
                              prefersReducedMotion
                                ? undefined
                                : itemAnimations.slideUpFade
                            }
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            layout
                          >
                            <TemplateItem template={template} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}

                {/* Custom Templates Group */}
                {filteredCustom.length > 0 && (
                  <motion.div
                    className="space-y-3"
                    variants={
                      prefersReducedMotion
                        ? undefined
                        : itemAnimations.slideUpFade
                    }
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                        Custom
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground">
                        ({filteredCustom.length})
                      </span>
                    </div>
                    <motion.div
                      className="space-y-2"
                      variants={
                        prefersReducedMotion
                          ? undefined
                          : pageAnimations.containerTightStagger
                      }
                      initial="hidden"
                      animate="show"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredCustom.map((template) => (
                          <motion.div
                            key={template.id}
                            variants={
                              prefersReducedMotion
                                ? undefined
                                : itemAnimations.slideUpFade
                            }
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            layout
                          >
                            <TemplateItem template={template} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
        {/* Tab Content - Preset Templates Only */}
        <TabsContent value="preset" className="flex-1 overflow-y-auto mt-0 p-4">
          <motion.div
            key="preset-tab"
            initial="enter"
            animate="center"
            exit="exit"
            variants={
              prefersReducedMotion
                ? undefined
                : templateAnimations.tabContentSlideSmooth
            }
            custom={tabDirection}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
            }}
          >
            {filteredPresets.length === 0 ? (
              <motion.p
                initial="hidden"
                animate="show"
                variants={itemAnimations.slideUpFade}
                className="text-xs text-muted-foreground text-center py-8"
              >
                No preset templates found
              </motion.p>
            ) : (
              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="show"
                variants={
                  prefersReducedMotion
                    ? undefined
                    : templateAnimations.sidebarLoadStagger
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredPresets.map((template) => (
                    <motion.div
                      key={template.id}
                      variants={
                        prefersReducedMotion
                          ? undefined
                          : itemAnimations.slideUpFade
                      }
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      layout
                    >
                      <TemplateItem template={template} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* Tab Content - Custom Templates Only */}
        <TabsContent value="custom" className="flex-1 overflow-y-auto mt-0 p-4">
          <motion.div
            key="custom-tab"
            initial="enter"
            animate="center"
            exit="exit"
            variants={
              prefersReducedMotion
                ? undefined
                : templateAnimations.tabContentSlideSmooth
            }
            custom={tabDirection}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
            }}
          >
            {filteredCustom.length === 0 ? (
              <motion.p
                initial="hidden"
                animate="show"
                variants={itemAnimations.slideUpFade}
                className="text-xs text-muted-foreground text-center py-8"
              >
                No custom templates yet. Create one from the page header.
              </motion.p>
            ) : (
              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="show"
                variants={
                  prefersReducedMotion
                    ? undefined
                    : templateAnimations.sidebarLoadStagger
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredCustom.map((template) => (
                    <motion.div
                      key={template.id}
                      variants={
                        prefersReducedMotion
                          ? undefined
                          : itemAnimations.slideUpFade
                      }
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      layout
                    >
                      <TemplateItem template={template} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
