import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  Building2Icon,
  GripVertical,
  Plus,
  ChevronDown
} from 'lucide-react'
import { getPositions } from '@/services/mock/positions'
import { getPersonnel } from '@/services/mock/personnel'
import { getOrgUnits } from '@/services/mock/orgUnits'
import type { OrgUnit } from '@/services/mock/orgUnits'

export interface PMTMember {
  id: string
  name: string
  position: string
  office: string
  officeId: string
  email: string
  phone?: string
  role: 'Chair' | 'Vice Chair' | 'Member'
  appointmentDate?: string
}

export interface PMTBodyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationUacsCode?: string
  allOrgUnits?: OrgUnit[]
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Chair':
      return 'bg-primary/10 text-primary border-primary/20'
    case 'Vice Chair':
      return 'bg-success/10 text-success border-success/20'
    default:
      return 'bg-info/10 text-info border-info/20'
  }
}

// Generate PMT members dynamically based on organizational structure
export function generatePMTMembers(): PMTMember[] {
  const pmtMembers: PMTMember[] = []
  const positions = getPositions()
  const personnel = getPersonnel()
  const orgUnits = getOrgUnits()

  // Find Secretary (Chair) - SG-33 position
  const secretaryPosition = positions.find(p => p.title === 'Secretary' && p.salaryGrade === 'SG-33')
  if (secretaryPosition) {
    const secretary = personnel.find(p => p.positionId === secretaryPosition.id)
    if (secretary) {
      const officeUnit = orgUnits.find(o => o.id === secretaryPosition.orgUnitId)
      pmtMembers.push({
        id: `pmt-${secretary.id}`,
        name: secretary.name,
        position: secretaryPosition.title,
        office: officeUnit?.name || 'Office of the Secretary',
        officeId: secretaryPosition.orgUnitId,
        email: secretary.email || '',
        phone: '',
        role: 'Chair',
        appointmentDate: secretary.startDate
      })
    }
  }

  // Find Undersecretary (Vice Chair) - SG-31 position
  const underSecretaryPosition = positions.find(p => p.title === 'Undersecretary' && p.salaryGrade === 'SG-31')
  if (underSecretaryPosition) {
    const underSecretary = personnel.find(p => p.positionId === underSecretaryPosition.id)
    if (underSecretary) {
      const officeUnit = orgUnits.find(o => o.id === underSecretaryPosition.orgUnitId)
      pmtMembers.push({
        id: `pmt-${underSecretary.id}`,
        name: underSecretary.name,
        position: underSecretaryPosition.title,
        office: officeUnit?.name || 'Office of the Secretary',
        officeId: underSecretaryPosition.orgUnitId,
        email: underSecretary.email || '',
        phone: '',
        role: 'Vice Chair',
        appointmentDate: underSecretary.startDate
      })
    }
  }

  // Find top 2 Directors (Members) - SG-29 positions
  const directorPositions = positions
    .filter(p => p.salaryGrade === 'SG-29' && p.title.includes('Director'))
    .slice(0, 2)

  directorPositions.forEach(directorPos => {
    const director = personnel.find(p => p.positionId === directorPos.id)
    if (director) {
      const officeUnit = orgUnits.find(o => o.id === directorPos.orgUnitId)
      pmtMembers.push({
        id: `pmt-${director.id}`,
        name: director.name,
        position: directorPos.title,
        office: officeUnit?.name || 'Department',
        officeId: directorPos.orgUnitId,
        email: director.email || '',
        phone: '',
        role: 'Member',
        appointmentDate: director.startDate
      })
    }
  })

  return pmtMembers
}

function PMTBodyDialog({
  open,
  onOpenChange,
  organizationUacsCode = '100010100001',
  allOrgUnits = [],
}: PMTBodyDialogProps) {
  const pmtMembers = generatePMTMembers()
  const orgUnits = allOrgUnits.length > 0 ? allOrgUnits : getOrgUnits()

  // Get the top-level organization
  const topLevelOrg = orgUnits.find((u) => u.parentId === null)
  
  // Filter all offices/divisions under this organization by UACS code prefix
  const calibrationOffices = orgUnits.filter((unit) => {
    if (!unit.uacsCode) return false
    // Extract base organization code (first 12 digits)
    const baseUacs = unit.uacsCode.substring(0, 12)
    const orgBaseUacs = organizationUacsCode.substring(0, 12)
    return baseUacs === orgBaseUacs
  })

  // Build hierarchical structure of offices (parent-child relationships)
  const getChildUnits = (parentId: string | null) => {
    return calibrationOffices.filter((u) => u.parentId === parentId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Performance Management Team (PMT) Body
          </DialogTitle>
          <DialogDescription className="text-sm mt-2">
            <div className="space-y-1">
              <p>Authorized members responsible for OPCR/IPCR evaluation and calibration</p>
              <p className="text-[10px] text-default-500">
                UACS Code: <span className="font-semibold">{organizationUacsCode}</span> • 
                <span className="ml-2">Calibrating <span className="font-semibold">{calibrationOffices.length}</span> units</span>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* PMT Overview */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-primary/5 border-primary/10">
              <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider">Authorized Seats</p>
              <p className="text-3xl font-bold text-primary mt-2">4</p>
              <p className="text-[9px] text-default-400 mt-1">As per CSC MC No. 6, s. 2012</p>
            </Card>
            <Card className="p-4 bg-success/5 border-success/10">
              <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider">Filled Seats</p>
              <p className="text-3xl font-bold text-success mt-2">{pmtMembers.length}</p>
              <p className="text-[9px] text-default-400 mt-1">All positions filled</p>
            </Card>
          </div>

          {/* PMT Members Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-default-900">Members</h3>
              <Button size="sm" variant="ghost" className="h-8 text-[10px] font-semibold gap-1.5">
                <Plus className="h-3 w-3" />
                Add Member
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pmtMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 border border-default-200 rounded-lg hover:bg-default-50/50 transition-all group"
                >
                  <div className="flex items-start gap-4 justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 bg-default-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                        <User className="h-5 w-5 text-default-600 group-hover:text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-default-900 text-sm">{member.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-[9px] font-semibold uppercase tracking-wider border ${getRoleColor(member.role)}`}
                          >
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-default-500 font-medium mt-1">{member.position}</p>
                        <p className="text-[9px] text-default-400 flex items-center gap-1.5 mt-1.5">
                          <Building2Icon className="h-3 w-3" />
                          {member.office}
                        </p>
                      </div>
                    </div>
                    
                    <div className="hidden group-hover:flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-default-400 hover:text-primary">
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contact Information - Collapsible */}
                  <details className="mt-3 cursor-pointer">
                    <summary className="text-[9px] font-semibold text-primary hover:text-primary/80 uppercase tracking-wider select-none">
                      Contact Details
                    </summary>
                    <div className="mt-2 space-y-1.5 text-[9px] text-default-600 bg-default-50/50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-default-400" />
                        <a href={`mailto:${member.email}`} className="text-primary hover:underline truncate">
                          {member.email}
                        </a>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-default-400" />
                          <a href={`tel:${member.phone}`} className="text-primary hover:underline">
                            {member.phone}
                          </a>
                        </div>
                      )}
                      {member.appointmentDate && (
                        <div className="text-[8px] text-default-400 pt-1 border-t border-default-200 mt-1.5">
                          Appointed: {new Date(member.appointmentDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* Calibration Scope */}
          <div className="border border-default-200 rounded-lg p-4 bg-default-50/50">
            <div className="flex items-center gap-2 mb-3">
              <ChevronDown className="h-4 w-4 text-default-400" />
              <h3 className="text-sm font-semibold text-default-900">Organizational Units</h3>
            </div>
            
            <div className="space-y-1 text-[9px]">
              {/* Top level org */}
              {topLevelOrg && (
                <div className="pl-2 py-1">
                  <span className="font-semibold text-default-900">📋 {topLevelOrg.name}</span>
                  <span className="text-default-400 ml-2">({topLevelOrg.code})</span>
                </div>
              )}
              
              {/* Child offices */}
              {getChildUnits(topLevelOrg?.id || null).map((office) => (
                <div key={office.id} className="pl-6">
                  <div className="py-1">
                    <span className="font-medium text-default-700">├─ {office.name}</span>
                    <span className="text-default-400 ml-2">({office.code})</span>
                  </div>
                  
                  {/* Sub-divisions */}
                  {getChildUnits(office.id).map((division) => (
                    <div key={division.id} className="pl-4 text-default-600">
                      <span>└─ {division.name}</span>
                      <span className="text-default-400 ml-2">({division.code})</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* CSC Reference */}
          <div className="p-3 bg-info/5 border border-info/10 rounded-lg">
            <p className="text-[9px] font-semibold text-info uppercase tracking-wider mb-1">Legal Basis</p>
            <p className="text-[9px] text-default-600 leading-relaxed">
              CSC Memorandum Circular No. 6, Series of 2012 - The PMT evaluates OPCR/IPCR ratings for objective assessment and organization-wide calibration across all offices under the same organizational code (UACS), ensuring fairness and preventing rating inflation
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t">
          <p className="text-[9px] text-default-400">Last updated: January 2024</p>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PMTBodyDialog
