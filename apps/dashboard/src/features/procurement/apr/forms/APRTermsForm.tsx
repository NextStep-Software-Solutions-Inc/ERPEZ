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

import { ModeOfDelivery, InsufficientFundsAction } from '../types'

interface APRTermsFormProps {
  form: {
    Field: React.ElementType<{
      name: string
      children: (field: AnyFieldApi) => React.ReactNode
    }>
  }
}

export function APRTermsForm({ form }: APRTermsFormProps) {
  return (
    <div className="space-y-6">
      {/* Mode of Delivery */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Mode of Delivery</CardTitle>
          <CardDescription>
            Select how items will be delivered from PS-DBM
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <form.Field
            name="modeOfDelivery"
            children={(field: AnyFieldApi) => (
              <div className="space-y-2">
                <RadioGroup
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  className="flex flex-wrap items-center gap-x-8 gap-y-3 py-2"
                >
                  <div className="flex items-center space-x-2.5">
                    <RadioGroupItem value={ModeOfDelivery.FAST_LANE} id="fast-lane" />
                    <Label htmlFor="fast-lane" className="cursor-pointer text-sm font-medium text-slate-700">
                      Fast Lane
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <RadioGroupItem
                      value={ModeOfDelivery.SCHEDULED_PICKUP}
                      id="scheduled-pickup"
                    />
                    <Label htmlFor="scheduled-pickup" className="cursor-pointer text-sm font-medium text-slate-700">
                      Scheduled Pick-up
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <RadioGroupItem value={ModeOfDelivery.DOOR_TO_DOOR} id="door-to-door" />
                    <Label htmlFor="door-to-door" className="cursor-pointer text-sm font-medium text-slate-700">
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
        <CardHeader className="pb-2">
          <CardTitle className="text-base">If Funds Are Not Sufficient</CardTitle>
          <CardDescription>
            Select how to handle insufficient budget allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <form.Field
            name="insufficientFundsAction"
            children={(field: AnyFieldApi) => (
              <div className="space-y-2">
                <RadioGroup
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  className="flex flex-wrap items-center gap-x-8 gap-y-3 py-2"
                >
                  <div className="flex items-center space-x-2.5">
                    <RadioGroupItem value={InsufficientFundsAction.REDUCE_QUANTITY} id="reduce" />
                    <Label htmlFor="reduce" className="cursor-pointer text-sm font-medium text-slate-700">
                      Reduce Quantity
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <RadioGroupItem value={InsufficientFundsAction.BILL_US} id="bill" />
                    <Label htmlFor="bill" className="cursor-pointer text-sm font-medium text-slate-700">
                      Bill Us
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <RadioGroupItem value={InsufficientFundsAction.CHARGE_TO_DEPOSIT} id="charge" />
                    <Label htmlFor="charge" className="cursor-pointer text-sm font-medium text-slate-700">
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
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Attachments for Non-Common Items</CardTitle>
          <CardDescription>Check if required for this APR</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6 space-y-3">
          <form.Field
            name="attachments.observationReportRequired"
            children={(field: AnyFieldApi) => (
              <div className="flex items-center space-x-2.5 py-1">
                <Checkbox
                  id="obr"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="obr" className="cursor-pointer text-sm font-medium text-slate-700">
                  Observation Report (ObR)
                </Label>
              </div>
            )}
          />
          <form.Field
            name="attachments.collectiveBarterAgreementRequired"
            children={(field: AnyFieldApi) => (
              <div className="flex items-center space-x-2.5 py-1">
                <Checkbox
                  id="cba"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="cba" className="cursor-pointer text-sm font-medium text-slate-700">
                  Collective Barter Agreement (CBA)
                </Label>
              </div>
            )}
          />
          <form.Field
            name="attachments.completeSpecsRequired"
            children={(field: AnyFieldApi) => (
              <div className="flex items-center space-x-2.5 py-1">
                <Checkbox
                  id="specs"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="specs" className="cursor-pointer text-sm font-medium text-slate-700">
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
