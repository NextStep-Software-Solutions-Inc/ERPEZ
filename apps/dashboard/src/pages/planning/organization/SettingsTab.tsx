import { useState } from 'react'
import { Building2, Users, TrendingUp, ChevronRight, KeyRound, FileText } from 'lucide-react'
import type { SettingsTabProps } from '@/components/features/planning/organizational-structure/types'
import { StructureManagementSettings } from '@/components/features/planning/organizational-structure/settings/StructureManagementSettings'
import { StaffingPlantillaSettings } from '@/components/features/planning/organizational-structure/settings/StaffingPlantillaSettings'
import { PersonnelReportingSettings } from '@/components/features/planning/organizational-structure/settings/PersonnelReportingSettings'
import { LicenseStatusCard } from '@/components/ams/LicenseStatusCard'
import { AgencyLetterheadSettings } from '@/components/features/planning/organizational-structure/settings/AgencyLetterheadSettings'
import { cn } from '@/lib/utils'

interface SettingItem {
  id: string
  label: string
  icon: React.ReactNode
  description: string
}

const SETTINGS_ITEMS: SettingItem[] = [
  {
    id: 'agency-letterhead',
    label: 'Agency Letterhead & Branding',
    icon: <FileText className="h-5 w-5" />,
    description: 'Configure official agency legal name, address, and logo for documents & POs',
  },
  {
    id: 'structural-management',
    label: 'Structure Management',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Manage office types and organizational hierarchy',
  },
  {
    id: 'staffing-and-plantilla',
    label: 'Staffing & Plantilla',
    icon: <Users className="h-5 w-5" />,
    description: 'Configure position types, salary grades, and plantilla settings',
  },
  {
    id: 'personnel-reporting',
    label: 'Personnel Reporting',
    icon: <TrendingUp className="h-5 w-5" />,
    description: 'Set up PMT configurations and reporting structures',
  },
  {
    id: 'license-entitlements',
    label: 'Subscription & License',
    icon: <KeyRound className="h-5 w-5" />,
    description: 'Manage workspace activation key, tier, and enabled modules',
  },
]

function SettingsTab(_props: SettingsTabProps) {
  const [activeTab, setActiveTab] = useState('agency-letterhead')

  const renderContent = () => {
    switch (activeTab) {
      case 'agency-letterhead':
        return <AgencyLetterheadSettings />
      case 'structural-management':
        return <StructureManagementSettings />
      case 'staffing-and-plantilla':
        return <StaffingPlantillaSettings />
      case 'personnel-reporting':
        return <PersonnelReportingSettings />
      case 'license-entitlements':
        return <LicenseStatusCard />
      default:
        return null
    }
  }

  const activeItem = SETTINGS_ITEMS.find((item) => item.id === activeTab)

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-default-900">Organization Settings</h1>
        <p className="text-sm text-default-600 mt-1">Manage office types, staffing structures, and personnel reporting configurations</p>
      </div>

      <div className="flex gap-6">
        {/* Side Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-2">
            {SETTINGS_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 group',
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-default-700 hover:bg-default-100 border border-transparent'
                )}
              >
                <span className={cn('flex-shrink-0', activeTab === item.id ? 'text-primary-foreground' : 'text-default-500')}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium text-sm', activeTab === item.id ? 'text-primary-foreground' : 'text-default-900')}>
                    {item.label}
                  </p>
                  <p className={cn('text-xs mt-0.5 truncate', activeTab === item.id ? 'text-primary-foreground/80' : 'text-default-500')}>
                    {item.description}
                  </p>
                </div>
                {activeTab === item.id && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-default-200 rounded-lg p-6">
            {activeItem && (
              <div className="mb-6 pb-6 border-b border-default-200">
                <h2 className="text-xl font-semibold text-default-900 flex items-center gap-3">
                  <span className="p-2 bg-primary/10 text-primary rounded-lg">{activeItem.icon}</span>
                  {activeItem.label}
                </h2>
                <p className="text-sm text-default-600 mt-2">{activeItem.description}</p>
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsTab