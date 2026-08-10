import { useState, useEffect } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Globe, MapPin } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const STORAGE_KEY = 'org_is_multi_site'

export function MultiSiteConfigurationTab() {
  const [isMultiSite, setIsMultiSite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingValue, setPendingValue] = useState(false)

  // Load multi-site setting from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsMultiSite(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  // Handle toggle with confirmation
  const handleToggle = (value: boolean) => {
    setPendingValue(value)
    setShowConfirmation(true)
  }

  // Confirm the change
  const handleConfirm = () => {
    setIsMultiSite(pendingValue)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingValue))
    setShowConfirmation(false)
  }

  if (isLoading) {
    return (
      <TabsContent value="multi-site" className="mt-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </TabsContent>
    )
  }

  return (
    <TabsContent value="multi-site" className="mt-6">
      <div className="space-y-6">
        <Card className="p-6 border border-default-200">
        <div className="space-y-6">
          {/* Multi-Site Configuration Toggle */}
          <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg border border-default-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-default-900 cursor-pointer">
                  Enable Multi-Site Organization
                </Label>
                <p className="text-xs text-default-500 mt-1">
                  {isMultiSite
                    ? 'Organization is configured for multiple sites/satellites'
                    : 'Organization is configured as a single-site entity'}
                </p>
              </div>
            </div>
            <Switch
              checked={isMultiSite}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {pendingValue ? 'Enable' : 'Disable'} Multi-Site Organization?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4 mt-4">
                  <div>
                    <p className="font-semibold text-default-900 mb-2">
                      This will change how the organization is structured:
                    </p>
                    {pendingValue ? (
                      <ul className="list-disc pl-5 space-y-1 text-default-700 text-sm">
                        <li>The <strong>Cluster/Satellite field will become visible and required</strong> when creating new organizations</li>
                        <li>Users will need to <strong>select a satellite cluster</strong> (Main, Satellite A, etc.)</li>
                        <li>This change applies to all <strong>future organization creations</strong></li>
                      </ul>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1 text-default-700 text-sm">
                        <li>The <strong>Cluster/Satellite field will be hidden</strong> from the creation form</li>
                        <li>The default cluster value <strong>&quot;main-agency&quot; will be assigned automatically</strong></li>
                        <li>This change applies to all <strong>future organization creations</strong></li>
                      </ul>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3 justify-end pt-4">
                <AlertDialogCancel className="font-medium border-default-200 text-default-600 hover:bg-default-50">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm} className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                  {pendingValue ? 'Enable' : 'Disable'} Multi-Site
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          {/* Impact Information */}
          {isMultiSite ? (
            <Alert className="border-blue-200 bg-blue-50">
              <MapPin className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                <strong>Multi-Site Mode Enabled:</strong> When creating organizations, the Cluster/Satellite field will be
                <strong> visible and required</strong>. Users must select a satellite cluster (Main, Satellite A, Satellite B, etc.)
                from the dropdown.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                <strong>Single-Site Mode Enabled:</strong> When creating organizations, the Cluster/Satellite field will be
                <strong> automatically hidden</strong>. The default cluster value &quot;main-agency&quot; will be assigned
                automatically without user interaction.
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-default-50 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-default-600 uppercase tracking-wider">Current Mode</p>
              <p className="text-sm font-bold text-default-900 mt-2">
                {isMultiSite ? '🌐 Multi-Site' : '🏢 Single-Site'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-default-600 uppercase tracking-wider">Cluster Field</p>
              <p className="text-sm font-bold text-default-900 mt-2">
                {isMultiSite ? '✓ Visible & Required' : '✗ Hidden (Auto-filled)'}
              </p>
            </div>
          </div>

          {/* Behavior Matrix */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-default-600 uppercase tracking-wider">Impact on Organization Creation</p>
            <div className="border border-default-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-default-50">
                    <th className="text-left px-4 py-3 font-semibold text-default-700">Feature</th>
                    <th className="text-left px-4 py-3 font-semibold text-default-700">Single-Site</th>
                    <th className="text-left px-4 py-3 font-semibold text-default-700">Multi-Site</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-default-900 font-medium">Cluster Field</td>
                    <td className="px-4 py-3 text-default-600">Hidden from UI</td>
                    <td className="px-4 py-3 text-default-600">Visible & Required</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-default-900 font-medium">Field Type</td>
                    <td className="px-4 py-3 text-default-600">N/A (Automatic)</td>
                    <td className="px-4 py-3 text-default-600">Dropdown Selection</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-default-900 font-medium">Default Value</td>
                    <td className="px-4 py-3 text-default-600">&quot;main-agency&quot;</td>
                    <td className="px-4 py-3 text-default-600">User Selection</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-default-900 font-medium">User Action</td>
                    <td className="px-4 py-3 text-default-600">No selection needed</td>
                    <td className="px-4 py-3 text-default-600">Must select cluster</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Implementation Note */}
          <Alert className="border-default-200 bg-default-50">
            <AlertDescription className="text-xs text-default-600">
              💡 <strong>Tip:</strong> This setting is stored locally and will persist across sessions. Changes take effect
              immediately on organization creation forms.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
      </div>
    </TabsContent>  )
}