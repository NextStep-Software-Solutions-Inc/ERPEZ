/**
 * Rating Scale Template Page
 * Main page for managing rating scale templates
 */

import { useEffect, useMemo, useRef } from 'react'
import { useAtom } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { PageContainerDashtail } from '@/components/v2'
import { TemplateListSidebar } from '../components/TemplateListSidebar'
import { TemplateDetailPanel } from '../components/TemplateDetailPanel'
import { CreateTemplateWizardDialog } from '../dialogs'
import { DeleteTemplateDialog } from '../dialogs'
import { EditTemplateDialog } from '../dialogs'
import { selectedTemplateAtom, createTemplateDialogOpenAtom } from '../atoms'
import { useRatingScaleTemplates } from '../useRatingScaleTemplates'

export function RatingScaleTemplatePage() {
  const [selectedTemplate, setSelectedTemplate] = useAtom(selectedTemplateAtom)
  const [, setCreateDialogOpen] = useAtom(createTemplateDialogOpenAtom)
  const isInitialMountRef = useRef(true)
  const queryClient = useQueryClient()

  // const templatesQuery = useRatingScaleTemplates({
  //   pathParams: {},
  //   queryParams: {},
  // })

  const {
    data: allTemplates,
    isPending,
    refetch,
  } = useRatingScaleTemplates({
    pathParams: {},
    queryParams: {},
  })
  const presetTemplates = useMemo(
    () => allTemplates?.data.filter((template) => template.isDefault),
    [allTemplates],
  )
  const customTemplates = useMemo(
    () => allTemplates?.data.filter((template) => !template.isDefault),
    [allTemplates],
  )
  useEffect(() => {
    // Auto-select first preset on initial mount if none selected
    if (isInitialMountRef.current && !selectedTemplate) {
      const initialTemplate =
        (presetTemplates ?? [])[0] ?? allTemplates?.data[0]

      if (!initialTemplate) {
        return
      }

      setSelectedTemplate(initialTemplate)
      isInitialMountRef.current = false
    }
  }, [allTemplates, presetTemplates, selectedTemplate, setSelectedTemplate])

  const handleTemplateUpdated = async (createdTemplateId?: string) => {
    await queryClient.invalidateQueries({
      queryKey: ['/rating-scale-templates'],
    })
    const refreshedTemplates = await refetch()
    const allData = refreshedTemplates.data?.data ?? []

    if (createdTemplateId) {
      // After a create: auto-select the newly created template
      const newTemplate = allData.find((t) => t.id === createdTemplateId)
      if (newTemplate) {
        setSelectedTemplate(newTemplate)
        return
      }
    }

    if (selectedTemplate) {
      // After an update/delete: keep the same template selected if it still exists
      const stillExists = allData.find((t) => t.id === selectedTemplate.id)
      if (stillExists) {
        setSelectedTemplate(stillExists)
        return
      }
    }

    // Fallback: select the most recently created custom template, or first available
    const sorted = [...allData]
      .filter((t) => !t.isDefault)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    const fallback = sorted[0] ?? allData[0] ?? null
    setSelectedTemplate(fallback)
  }

  return (
    <PageContainerDashtail contentType="default" mode="simple">
      {/* Main Content Card */}
      <Card>
        <CardHeader className="border-b-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Rating Scale Templates</CardTitle>
              <CardDescription>
                Create and manage reusable rating scale templates for success
                indicators
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setCreateDialogOpen(true)}
              disabled={isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex overflow-hidden h-[calc(100vh-280px)]">
            {/* Left Sidebar */}
            <div className="w-80 shrink-0 border-r">
              <TemplateListSidebar
                presetTemplates={presetTemplates ?? []}
                customTemplates={customTemplates ?? []}
                isLoading={isPending}
              />
            </div>

            {/* Right Detail Panel */}
            <TemplateDetailPanel
              template={selectedTemplate}
              isLoading={isPending}
              onTemplateUpdated={handleTemplateUpdated}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateTemplateWizardDialog onSuccess={handleTemplateUpdated} />
      <EditTemplateDialog onSuccess={handleTemplateUpdated} />
      <DeleteTemplateDialog onSuccess={handleTemplateUpdated} />
    </PageContainerDashtail>
  )
}
