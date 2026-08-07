import { useState } from 'react'
import { useAtom } from 'jotai'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { ruleBuilderDialogOpenAtom, selectedRuleAtom, codeRulesAtom } from '../atoms/codeRulesAtom'
import type { CodeCombinationRule, RuleCondition, RuleConditionType } from '../types/codeCombinationRuleTypes'
import { toast } from 'sonner'

const ruleSchema = z.object({
  name: z.string().min(3, 'Rule name must be at least 3 characters'),
  description: z.string().optional(),
  errorMessage: z.string().min(10, 'Error message must be at least 10 characters'),
  action: z.enum(['block', 'warn']),
})

type RuleFormData = z.infer<typeof ruleSchema>

/**
 * Rule Builder Dialog Component
 * Allows users to create and edit code combination validation rules
 */
export function RuleBuilderDialog() {
  const [isOpen, setIsOpen] = useAtom(ruleBuilderDialogOpenAtom)
  const [selectedRule, setSelectedRule] = useAtom(selectedRuleAtom)
  const [codeRules, setCodeRules] = useAtom(codeRulesAtom)
  const [conditions, setConditions] = useState<RuleCondition[]>([])
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: selectedRule
      ? {
          name: selectedRule.name,
          description: selectedRule.description,
          errorMessage: selectedRule.consequence.errorMessage,
          action: selectedRule.consequence.action,
        }
      : {
          name: '',
          description: '',
          errorMessage: '',
          action: 'block',
        },
  })

  const handleAddCondition = () => {
    const newCondition: RuleCondition = {
      codeSegment: 'objectCode',
      conditionType: 'equals',
      value: '',
      field: 'code',
    }
    setConditions([...conditions, newCondition])
  }

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const handleConditionChange = (index: number, field: string, value: any) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], [field]: value }
    setConditions(newConditions)
  }

  const onSubmit = async (data: RuleFormData) => {
    if (conditions.length === 0) {
      toast.error('Please add at least one condition')
      return
    }

    try {
      const newRule: CodeCombinationRule = {
        id: selectedRule?.id || Date.now().toString(),
        name: data.name,
        description: data.description || '',
        conditions,
        consequence: {
          action: data.action as any,
          errorMessage: data.errorMessage,
          severity: data.action === 'block' ? 'error' : 'warning',
        },
        isActive: true,
        createdAt: selectedRule?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (selectedRule) {
        setCodeRules(
          codeRules.map((r) => (r.id === selectedRule.id ? newRule : r))
        )
        toast.success('Rule updated successfully')
      } else {
        setCodeRules([...codeRules, newRule])
        toast.success('Rule created successfully')
      }

      handleClose()
    } catch (error) {
      toast.error('Failed to save rule')
      console.error(error)
    }
  }

  const handleClose = () => {
    if (form.formState.isDirty && conditions.length > 0) {
      setShowUnsavedWarning(true)
    } else {
      setIsOpen(false)
      setSelectedRule(undefined)
      form.reset()
      setConditions([])
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRule ? 'Edit Validation Rule' : 'Create Validation Rule'}
            </DialogTitle>
            <DialogDescription>
              Define a rule to validate combinations of UACS code segments. Rules use If/Then logic
              to prevent budgeting errors.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="rule-details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rule-details">Rule Details</TabsTrigger>
              <TabsTrigger value="conditions">Conditions ({conditions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="rule-details" className="space-y-4 mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., No CO with General Fund"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe when and why this rule applies..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="block">Block (Prevent Save)</SelectItem>
                            <SelectItem value="warn">Warn (Allow with Warning)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Block will prevent the transaction; Warn allows it with a warning
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="errorMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Error/Warning Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Message shown to users when this rule is violated..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4 mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Add conditions using IF logic. All conditions must be met for the rule to apply.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {conditions.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      No conditions added yet
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCondition}
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      Add First Condition
                    </Button>
                  </div>
                ) : (
                  <>
                    {conditions.map((condition, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono">
                                IF
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <Select
                                value={condition.codeSegment}
                                onValueChange={(value) =>
                                  handleConditionChange(
                                    index,
                                    'codeSegment',
                                    value
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fundingSource">Funding Source</SelectItem>
                                  <SelectItem value="organization">Organization</SelectItem>
                                  <SelectItem value="location">Location</SelectItem>
                                  <SelectItem value="mfoPap">MFO/PAP</SelectItem>
                                  <SelectItem value="objectCode">Object Code</SelectItem>
                                </SelectContent>
                              </Select>

                              <Select
                                value={condition.conditionType}
                                onValueChange={(value) =>
                                  handleConditionChange(
                                    index,
                                    'conditionType',
                                    value as RuleConditionType
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="not_equals">Not Equals</SelectItem>
                                  <SelectItem value="starts_with">Starts With</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                  <SelectItem value="in_list">In List</SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                placeholder="Value (comma-separated for list)"
                                value={
                                  Array.isArray(condition.value)
                                    ? condition.value.join(', ')
                                    : condition.value
                                }
                                onChange={(e) =>
                                  handleConditionChange(
                                    index,
                                    'value',
                                    condition.conditionType === 'in_list'
                                      ? e.target.value.split(',').map((v) => v.trim())
                                      : e.target.value
                                  )
                                }
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleRemoveCondition(index)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCondition}
                      className="w-full"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      Add Another Condition
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)}>
              {selectedRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to this rule. Do you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedWarning(false)
                setIsOpen(false)
                setSelectedRule(undefined)
                form.reset()
                setConditions([])
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
