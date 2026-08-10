/**
 * Template Starter Library Component
 * Shows preset templates for users to choose as a starting point
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { RatingScaleTemplate } from '../types';
import { TemplatePreview } from './TemplatePreview';

interface TemplateStarterLibraryProps {
  templates: RatingScaleTemplate[];
  onSelect: (template: RatingScaleTemplate) => void;
  onClose: () => void;
}

export function TemplateStarterLibrary({
  templates,
  onSelect,
  onClose,
}: TemplateStarterLibraryProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle>Choose a Starter Template</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select a preset template to customize as your new template
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="flex flex-col cursor-pointer hover:shadow-lg transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      color={template.scaleType === 'Fixed' ? 'info' : 'warning'}
                      variant="soft"
                      className="text-xs shrink-0"
                    >
                      {template.scaleType}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Rating Scale:
                    </p>
                    <TemplatePreview template={template} compact={true} />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-auto"
                    onClick={() => onSelect(template)}
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No preset templates available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
