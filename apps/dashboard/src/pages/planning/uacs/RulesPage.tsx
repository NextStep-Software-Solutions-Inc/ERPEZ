import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TestTube } from 'lucide-react'
import { useAtom } from 'jotai'
import { ruleBuilderDialogOpenAtom, selectedRuleAtom } from '@/features/uacs/rules/atoms/codeRulesAtom'
import { RuleBuilderDialog } from '@/features/uacs/rules/dialogs/RuleBuilderDialog'
import { CodeRulesTable } from '@/features/uacs/rules/tables/CodeRulesTable'

/**
 * Rules & Validation Page
 * 
 * Manages three types of validation rules:
 * 1. Expense Class Auto-Mapping
 * 2. Fiscal Year Validity
 * 3. Code Combination Validator
 */
export default function RulesPage() {
  const [, setIsRuleDialogOpen] = useAtom(ruleBuilderDialogOpenAtom)
  const [, setSelectedRule] = useAtom(selectedRuleAtom)

  const handleAddRule = () => {
    setSelectedRule(undefined)
    setIsRuleDialogOpen(true)
  }
  return (
    <TabsContent value="rules" className="space-y-4">
      {/* Code Segment Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Rules & Validation</h1>
        <p className="text-sm text-gray-600">
          Define and manage validation rules for UACS code segments, including auto-mapping, fiscal validity, and combination rules to ensure data integrity and prevent budget errors.
        </p>
      </div>

      {/* Sub-tabs for each rule type */}
      <Tabs defaultValue="expense-mapping" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expense-mapping">Expense Mapping</TabsTrigger>
          <TabsTrigger value="fiscal-validity">Fiscal Validity</TabsTrigger>
          <TabsTrigger value="combination">Code Combinations</TabsTrigger>
        </TabsList>

        {/* Expense Mapping Tab */}
        <TabsContent value="expense-mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expense Class Auto-Mapping Rules</CardTitle>
                  <CardDescription>
                    Define rules to automatically map Object Codes to Expense Classes (PS, MOOE, CO, FE)
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mapping Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Example: Object Codes starting with "501" → Auto-map to "PS" (Personal Services)
                </p>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Current Mapping Rules:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• <code>501*</code> → <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800">PS</span></li>
                    <li>• <code>502*</code> → <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800">MOOE</span></li>
                    <li>• <code>106*</code> → <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800">CO</span></li>
                    <li>• <code>503*</code> → <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800">FE</span></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fiscal Validity Tab */}
        <TabsContent value="fiscal-validity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fiscal Year Validity Rules</CardTitle>
                  <CardDescription>
                    Define which codes are active for specific fiscal years (temporal validity)
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Validity Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage code lifecycle: activate/deactivate codes for specific fiscal years without
                breaking historical data references.
              </p>
              <div className="mt-4 border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Batch Actions Available:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Activate multiple codes for FY 2026</li>
                  <li>• Deactivate retired codes for FY 2026</li>
                  <li>• View codes by fiscal year context</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Combination Tab */}
        <TabsContent value="combination" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Code Combination Validation Rules</CardTitle>
                  <CardDescription>
                    Define valid/invalid combinations of UACS codes to prevent budget errors
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled>
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Rules
                  </Button>
                  <Button onClick={handleAddRule}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How Rules Work:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• <strong>IF</strong> Fund Source = "01" (General Fund)</li>
                  <li>• <strong>THEN</strong> Object Code ≠ "106*" (Capital Outlay)</li>
                  <li>• <strong>Error:</strong> "Cannot charge Construction expenses to General Administration fund"</li>
                </ul>
              </div>

              <CodeRulesTable />
            </CardContent>
          </Card>

          <RuleBuilderDialog />
        </TabsContent>
      </Tabs>
    </TabsContent>
  )
}
