import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useKeycloak } from '@/providers/KeycloakProvider'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  ShieldCheck, 
  UserCheck, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Building2, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Package, 
  Settings 
} from 'lucide-react'
import { toast } from 'sonner'

interface PersonaOption {
  id: string
  name: string
  role: string
  badge: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const PERSONAS: PersonaOption[] = [
  {
    id: 'dev_planner',
    name: 'Planning Officer',
    role: 'Central Planning & Calibration',
    badge: 'Planner',
    icon: FileText,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'dev_preparer',
    name: 'End User / Preparer',
    role: 'Dept Preparer (LIB/WFP/OPCR/PPMP)',
    badge: 'Preparer',
    icon: UserCheck,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'dev_approver',
    name: 'Document Approver',
    role: 'Approver (LIB, PPMP, WFP, OPCR)',
    badge: 'Approver',
    icon: CheckCircle2,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'dev_finance',
    name: 'Finance Officer',
    role: 'Ceilings, UACS & Fund Sources',
    badge: 'Finance',
    icon: DollarSign,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'dev_procurement',
    name: 'Procurement Officer',
    role: 'PPMP Consolidation, BAC, RFQ, PO',
    badge: 'Procurement',
    icon: Package,
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
  },
  {
    id: 'dev_admin',
    name: 'Tenant Administrator',
    role: 'Org Structure, Members & Roles',
    badge: 'Admin',
    icon: Settings,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
  },
  {
    id: 'dev_superadmin',
    name: 'Super Administrator',
    role: 'Global Security Bypass',
    badge: 'SuperAdmin',
    icon: Sparkles,
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  },
]

export const DevRoleSwitcher: React.FC = () => {
  const [mounted, setMounted] = React.useState(false)
  const queryClient = useQueryClient()
  const { activeDevUser, switchDevUser } = useKeycloak()
  const { permissions, isLoading } = usePermissions()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const activePersona = PERSONAS.find((p) => p.id === activeDevUser) || PERSONAS[0]
  const ActiveIcon = activePersona.icon

  if (!mounted) return null

  const handleSelect = async (persona: PersonaOption) => {
    if (persona.id === activeDevUser) return
    try {
      setIsSwitching(true)
      await switchDevUser(persona.id)
      await queryClient.invalidateQueries()
      toast.success(`Switched role to ${persona.name}`, {
        description: `Active tenant: ERPEZ Dev Sandbox (${persona.role})`,
      })
    } catch (e) {
      toast.error('Failed to switch role')
    } finally {
      setIsSwitching(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans shadow-2xl">
      {/* Dropdown Panel */}
      {isOpen && (
        <div className="mb-2 w-84 rounded-xl border border-gray-200 bg-white p-3 shadow-2xl backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>RBAC Dev Persona Switcher</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <Building2 className="h-3 w-3" />
              <span>Dev Sandbox</span>
            </div>
          </div>

          <div className="space-y-1">
            {PERSONAS.map((persona) => {
              const isSelected = persona.id === activeDevUser
              const Icon = persona.icon
              return (
                <button
                  key={persona.id}
                  disabled={isSwitching}
                  onClick={() => handleSelect(persona)}
                  className={`w-full flex items-center justify-between rounded-lg p-2 text-left transition-colors text-xs ${
                    isSelected
                      ? 'bg-blue-50/80 font-medium text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1 rounded-md border ${persona.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold">{persona.name}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        {persona.role}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span>Active Permissions:</span>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
              {isLoading ? '...' : `${permissions.length} granted`}
            </span>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-xl backdrop-blur-md transition-all hover:bg-white hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:bg-gray-900"
      >
        <div className={`p-1 rounded-full border ${activePersona.color}`}>
          <ActiveIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
            RBAC Testing
          </span>
          <span className="font-bold leading-tight">{activePersona.badge}</span>
        </div>
        <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {isLoading ? '...' : permissions.length}
        </span>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
        )}
      </button>
    </div>
  )
}

export default DevRoleSwitcher
