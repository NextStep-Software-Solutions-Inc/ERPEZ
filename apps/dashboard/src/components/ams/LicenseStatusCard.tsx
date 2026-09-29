import * as React from 'react'
import {
  fetchLicenseStatus,
  activateLicenseKey,
  type LicenseStatusDto,
} from '@/services/api/amsLicense'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Key, Lock, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'

export function LicenseStatusCard() {
  const [license, setLicense] = React.useState<LicenseStatusDto | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [activating, setActivating] = React.useState(false)
  const [newKey, setNewKey] = React.useState('')
  const [modalOpen, setModalOpen] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [isError, setIsError] = React.useState(false)

  const loadStatus = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchLicenseStatus()
      setLicense(data)
    } catch {
      setIsError(true)
      setMessage('Failed to load license details.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKey.trim()) return

    try {
      setActivating(true)
      setMessage(null)
      const result = await activateLicenseKey(newKey.trim())
      if (result.success) {
        setIsError(false)
        setMessage(result.message || 'License activated successfully!')
        setNewKey('')
        setModalOpen(false)
        await loadStatus()
      } else {
        setIsError(true)
        setMessage(result.message || 'License activation failed.')
      }
    } catch (err: any) {
      setIsError(true)
      setMessage(err?.response?.data?.message || 'Failed to activate license key.')
    } finally {
      setActivating(false)
    }
  }

  const allModules = [
    { code: 'ams', name: 'AMS', description: 'Access & IAM' },
    { code: 'sams', name: 'SAMS', description: 'Planning & Org' },
    { code: 'pms', name: 'PMS', description: 'Procurement' },
    { code: 'pbms', name: 'PBMS', description: 'Budget & Finance' },
  ]

  if (loading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-72 bg-gray-100 dark:bg-gray-800 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-t-4 border-t-emerald-600 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            License & Capacity Engine
          </CardTitle>
          <CardDescription>
            Cryptographic licensing, capacity thresholds, and module entitlements.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={license?.isValid ? 'default' : 'destructive'}
            className="text-xs px-2.5 py-0.5 uppercase font-semibold"
          >
            {license?.plan ?? 'Unlicensed'}
          </Badge>
          {license?.isAirGapped && (
            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700">
              Air-Gapped
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {message && (
          <div
            className={`p-3 rounded-md text-sm flex items-center gap-2 ${
              isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
            }`}
          >
            {isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
            <div className="text-xs text-muted-foreground font-medium">Active Key</div>
            <div className="text-sm font-mono font-semibold mt-1 truncate">
              {license?.licenseKey || 'None'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
            <div className="text-xs text-muted-foreground font-medium">Days Remaining</div>
            <div className="text-sm font-semibold mt-1 flex items-center gap-1.5">
              <span className={license && license.remainingDays < 30 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                {license?.remainingDays ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">days until renewal</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
            <div className="text-xs text-muted-foreground font-medium">User Capacity</div>
            <div className="text-sm font-semibold mt-1">
              {license?.activeUsersCount ?? 0} / {license?.maxUsers ?? 0} Users
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Module Entitlements
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allModules.map((mod) => {
              const isEnabled = license?.enabledModules?.some(
                (m) => m.toLowerCase() === mod.code.toLowerCase(),
              )
              return (
                <div
                  key={mod.code}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                    isEnabled
                      ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20'
                      : 'bg-gray-50 border-gray-200 opacity-60 dark:bg-gray-900'
                  }`}
                >
                  {isEnabled ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold leading-tight">{mod.name}</div>
                    <div className="text-[11px] text-muted-foreground">{mod.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {modalOpen && (
          <form onSubmit={handleActivate} className="p-4 border rounded-lg bg-slate-50/80 dark:bg-slate-900/80 space-y-3">
            <div className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              Enter License Activation Key
            </div>
            <div className="text-xs text-muted-foreground">
              Paste the cryptographic license key provided by your Tenant Management portal or sovereign license certificate.
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="EPZ-PRO-20261231-..."
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="font-mono text-xs"
                disabled={activating}
              />
              <Button type="submit" disabled={activating || !newKey.trim()} size="sm">
                {activating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Activate'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                disabled={activating}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-3">
        <Button variant="ghost" size="sm" onClick={loadStatus} className="text-xs text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Status
        </Button>
        {!modalOpen && (
          <Button size="sm" onClick={() => setModalOpen(true)} className="text-xs">
            <Key className="w-3.5 h-3.5 mr-1" /> Update License Key
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
