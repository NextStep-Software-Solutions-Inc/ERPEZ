/**
 * APR Terms Configuration Form Component
 * Handles selection of Mode of Delivery, Insufficient Funds action, and Attachments
 * 
 * Max 200 lines - composite component using TanStack Form + Zod
 */

import type { AnyFieldApi } from '@tanstack/react-form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface APRTermsFormProps {
  /** TanStack Form instance from useForm<APRTermsFormSchema> */
  form: {
    Field: (props: { name: string; children: (field: AnyFieldApi) => React.ReactNode }) => React.ReactNode
  }
}

export function APRTermsForm({ form }: APRTermsFormProps) {
  return (
    <div className="space-y-6">
      {/* Mode of Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mode of Delivery</CardTitle>
          <CardDescription>
            Select how items will be delivered from PS-DBM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.Field
            name="modeOfDelivery"
            children={(field: AnyFieldApi) => (
              <div className="space-y-2">
                <RadioGroup
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FAST_LANE" id="fast-lane" />
                    <Label htmlFor="fast-lane" className="cursor-pointer">
                      Fast Lane
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="SCHEDULED_PICKUP"
                      id="scheduled-pickup"
                    />
                    <Label htmlFor="scheduled-pickup" className="cursor-pointer">
                      Scheduled Pick-up
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DOOR_TO_DOOR" id="door-to-door" />
                    <Label htmlFor="door-to-door" className="cursor-pointer">
                      Door-to-Door
                    </Label>
                  </div>
                </RadioGroup>
                {field.state.meta.errors[0] && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Insufficient Funds Handling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">If Funds Are Not Sufficient</CardTitle>
          <CardDescription>
            Select how to handle insufficient budget allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.Field
            name="insufficientFundsAction"
            children={(field: AnyFieldApi) => (
              <div className="space-y-2">
                <RadioGroup
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="REDUCE_QUANTITY" id="reduce" />
                    <Label htmlFor="reduce" className="cursor-pointer">
                      Reduce Quantity
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BILL_US" id="bill" />
                    <Label htmlFor="bill" className="cursor-pointer">
                      Bill Us
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CHARGE_TO_DEPOSIT" id="charge" />
                    <Label htmlFor="charge" className="cursor-pointer">
                      Charge to Unutilized Deposit
                    </Label>
                  </div>
                </RadioGroup>
                {field.state.meta.errors[0] && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Attachments for Non-Common Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attachments for Non-Common Items</CardTitle>
          <CardDescription>Check if required for this APR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form.Field
            name="attachments.observationReportRequired"
            children={(field: AnyFieldApi) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="obr"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="obr" className="cursor-pointer">
                  Observation Report (ObR)
                </Label>
              </div>
            )}
          />
          <form.Field
            name="attachments.collectiveBarterAgreementRequired"
            children={(field: AnyFieldApi) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cba"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="cba" className="cursor-pointer">
                  Collective Barter Agreement (CBA)
                </Label>
              </div>
            )}
          />
          <form.Field
            name="attachments.completeSpecsRequired"
            children={(field: AnyFieldApi) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="specs"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="specs" className="cursor-pointer">
                  Complete Specifications
                </Label>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Remarks */}
      <form.Field
        name="remarks"
        children={(field: AnyFieldApi) => (
          <div className="space-y-2">
            <Label>Additional Remarks</Label>
            <Textarea
              placeholder="Enter any additional remarks or notes"
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full min-h-20"
            />
          </div>
        )}
      />
    </div>
  )
}
