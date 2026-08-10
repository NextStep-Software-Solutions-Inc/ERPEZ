import { Plus, Trash2 } from 'lucide-react'
import {
  createLotGroupingEntry,
  createTechnicalEvaluationCriterion,
  getStructuredFieldValidationMessage,
  getStructuredFieldSections,
  getStructuredFieldValue,
  getTechnicalEvaluationWeightTotal,
  parseLotGroupingBuilderValue,
  parseTechnicalProposalPageLimitBuilderValue,
  parseTechnicalEvaluationBuilderValue,
  serializeLotGroupingBuilderValue,
  serializeTechnicalProposalPageLimitBuilderValue,
  serializeTechnicalEvaluationBuilderValue,
} from '../data/structuredFieldCatalog'
import type {
  BiddingDocumentFieldDefinition,
  BiddingDocumentFieldKey,
  BiddingDocumentRecord,
} from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface BiddingDocumentStructuredFieldsSectionProps {
  document: BiddingDocumentRecord
  disabled: boolean
  onUpdateStructuredField: (
    field: BiddingDocumentFieldKey,
    value: string,
  ) => void
  onSaveDraft: () => void
}

function renderLotGroupingBuilder(
  value: string,
  disabled: boolean,
  onChange: (nextValue: string) => void,
  onBlur: () => void,
) {
  const entries = parseLotGroupingBuilderValue(value)

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-default-200 p-3">
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No lot groupings added yet.
        </p>
      ) : null}
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="grid gap-3 rounded-lg border border-default-200 bg-default-50 p-3 md:grid-cols-[1fr_1.5fr_auto]"
        >
          <Input
            value={entry.lotName}
            placeholder={`Lot ${index + 1} name`}
            disabled={disabled}
            onChange={(event) => {
              const nextEntries = entries.map((current) =>
                current.id === entry.id
                  ? { ...current, lotName: event.target.value }
                  : current,
              )
              onChange(serializeLotGroupingBuilderValue(nextEntries))
            }}
            onBlur={onBlur}
          />
          <Input
            value={entry.scope}
            placeholder="Scope / included items"
            disabled={disabled}
            onChange={(event) => {
              const nextEntries = entries.map((current) =>
                current.id === entry.id
                  ? { ...current, scope: event.target.value }
                  : current,
              )
              onChange(serializeLotGroupingBuilderValue(nextEntries))
            }}
            onBlur={onBlur}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={() => {
              const nextEntries = entries.filter(
                (current) => current.id !== entry.id,
              )
              onChange(serializeLotGroupingBuilderValue(nextEntries))
              onBlur()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className="gap-2"
        onClick={() => {
          const nextEntries = [
            ...entries,
            createLotGroupingEntry(entries.length),
          ]
          onChange(serializeLotGroupingBuilderValue(nextEntries))
          onBlur()
        }}
      >
        <Plus className="h-4 w-4" />
        Add lot grouping
      </Button>
    </div>
  )
}

function renderTechnicalEvaluationBuilder(
  value: string,
  disabled: boolean,
  onChange: (nextValue: string) => void,
  onBlur: () => void,
) {
  const entries = parseTechnicalEvaluationBuilderValue(value)
  const totalWeight = getTechnicalEvaluationWeightTotal(value)

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-default-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Define each criterion, its weight, and the minimum required score.
        </p>
        <Badge
          variant="outline"
          color={totalWeight === 100 ? 'success' : 'warning'}
        >
          Total weight: {totalWeight}%
        </Badge>
      </div>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="grid gap-3 rounded-lg border border-default-200 bg-default-50 p-3 md:grid-cols-[1.6fr_0.7fr_0.7fr_auto]"
        >
          <Input
            value={entry.criterion}
            placeholder="Criterion label"
            disabled={disabled}
            onChange={(event) => {
              const nextEntries = entries.map((current) =>
                current.id === entry.id
                  ? { ...current, criterion: event.target.value }
                  : current,
              )
              onChange(serializeTechnicalEvaluationBuilderValue(nextEntries))
            }}
            onBlur={onBlur}
          />
          <Input
            type="number"
            value={entry.weightPercent}
            placeholder="Weight %"
            disabled={disabled}
            onChange={(event) => {
              const nextEntries = entries.map((current) =>
                current.id === entry.id
                  ? { ...current, weightPercent: event.target.value }
                  : current,
              )
              onChange(serializeTechnicalEvaluationBuilderValue(nextEntries))
            }}
            onBlur={onBlur}
          />
          <Input
            type="number"
            value={entry.minimumScore}
            placeholder="Min score"
            disabled={disabled}
            onChange={(event) => {
              const nextEntries = entries.map((current) =>
                current.id === entry.id
                  ? { ...current, minimumScore: event.target.value }
                  : current,
              )
              onChange(serializeTechnicalEvaluationBuilderValue(nextEntries))
            }}
            onBlur={onBlur}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={() => {
              const nextEntries = entries.filter(
                (current) => current.id !== entry.id,
              )
              onChange(serializeTechnicalEvaluationBuilderValue(nextEntries))
              onBlur()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className="gap-2"
        onClick={() => {
          const nextEntries = [
            ...entries,
            createTechnicalEvaluationCriterion(entries.length),
          ]
          onChange(serializeTechnicalEvaluationBuilderValue(nextEntries))
          onBlur()
        }}
      >
        <Plus className="h-4 w-4" />
        Add evaluation criterion
      </Button>
    </div>
  )
}

function renderTechnicalProposalPageLimitBuilder(
  value: string,
  disabled: boolean,
  onChange: (nextValue: string) => void,
  onBlur: () => void,
) {
  const entries = parseTechnicalProposalPageLimitBuilderValue(value)

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-default-200 p-3">
      <p className="text-sm text-muted-foreground">
        Capture the maximum allowable page count per required Technical Proposal
        form section.
      </p>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="grid gap-3 rounded-lg border border-default-200 bg-default-50 p-3 md:grid-cols-[1.6fr_0.7fr]"
        >
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Technical Proposal section
            </Label>
            <p className="rounded-md border border-default-200 bg-white px-3 py-2 text-sm text-default-900">
              {entry.sectionName}
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`page-limit-${entry.id}`}>Maximum pages</Label>
            <Input
              id={`page-limit-${entry.id}`}
              type="number"
              value={entry.maxPages}
              placeholder="Pages"
              disabled={disabled}
              onChange={(event) => {
                const nextEntries = entries.map((current) =>
                  current.id === entry.id
                    ? { ...current, maxPages: event.target.value }
                    : current,
                )
                onChange(
                  serializeTechnicalProposalPageLimitBuilderValue(nextEntries),
                )
              }}
              onBlur={onBlur}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function renderField(
  field: BiddingDocumentFieldDefinition,
  value: string,
  disabled: boolean,
  onChange: (nextValue: string) => void,
  onBlur: () => void,
) {
  const isReadOnly = Boolean(field.readOnly)

  if (field.key === 'partialBidsLotGroupingDetails') {
    return renderLotGroupingBuilder(
      value,
      disabled || isReadOnly,
      onChange,
      onBlur,
    )
  }

  if (field.key === 'technicalEvaluationWeightsAndMinimumScores') {
    return renderTechnicalEvaluationBuilder(
      value,
      disabled || isReadOnly,
      onChange,
      onBlur,
    )
  }

  if (field.key === 'maximumPagesPerTechnicalProposalSection') {
    return renderTechnicalProposalPageLimitBuilder(
      value,
      disabled || isReadOnly,
      onChange,
      onBlur,
    )
  }

  if (field.inputType === 'select') {
    return (
      <Select
        value={value}
        onValueChange={(nextValue) => {
          onChange(nextValue)
          onBlur()
        }}
        disabled={disabled || isReadOnly}
      >
        <SelectTrigger id={field.key}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (field.inputType === 'textarea') {
    return (
      <Textarea
        id={field.key}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={isReadOnly ? undefined : onBlur}
        placeholder={field.placeholder}
        rows={4}
        disabled={disabled}
        readOnly={isReadOnly}
      />
    )
  }

  return (
    <Input
      id={field.key}
      type={field.inputType === 'textarea' ? 'text' : field.inputType}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={isReadOnly ? undefined : onBlur}
      placeholder={field.placeholder}
      disabled={disabled}
      readOnly={isReadOnly}
    />
  )
}

export function BiddingDocumentStructuredFieldsSection({
  document,
  disabled,
  onUpdateStructuredField,
  onSaveDraft,
}: BiddingDocumentStructuredFieldsSectionProps) {
  const groupedFields = getStructuredFieldSections(document)

  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">
          Phase 0A - Structured Inputs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Draft values persist locally and autosave every 30 seconds plus on
          field blur.
        </p>
        {groupedFields.map((section) => (
          <div
            key={section.key}
            className="space-y-4 rounded-lg border border-default-200 p-4"
          >
            <div>
              <p className="font-medium text-default-900">{section.label}</p>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <div
                  key={field.key}
                  className={
                    field.inputType === 'textarea'
                      ? 'md:col-span-2 space-y-2'
                      : 'space-y-2'
                  }
                >
                  {(() => {
                    const validationMessage =
                      getStructuredFieldValidationMessage(document, field)

                    return (
                      <>
                        <Label htmlFor={field.key}>
                          {field.label}
                          {field.required ? ' *' : ''}
                        </Label>
                        {field.source ? (
                          <Badge
                            variant="outline"
                            color={
                              field.source === 'computed'
                                ? 'info'
                                : field.source === 'schedule'
                                  ? 'secondary'
                                  : 'success'
                            }
                          >
                            {field.source === 'computed'
                              ? 'Computed'
                              : field.source === 'schedule'
                                ? 'From TC-01'
                                : 'Auto-filled'}
                          </Badge>
                        ) : null}
                        {validationMessage ? (
                          <Badge variant="outline" color="warning">
                            Validation required
                          </Badge>
                        ) : null}
                        {renderField(
                          field,
                          getStructuredFieldValue(document, field.key),
                          disabled,
                          (nextValue) =>
                            onUpdateStructuredField(field.key, nextValue),
                          onSaveDraft,
                        )}
                        {(field.helperText || field.sourceNote) && (
                          <p className="text-xs text-muted-foreground">
                            {field.helperText ?? field.sourceNote}
                          </p>
                        )}
                        {validationMessage ? (
                          <p className="text-xs text-warning">
                            {validationMessage}
                          </p>
                        ) : null}
                      </>
                    )
                  })()}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
