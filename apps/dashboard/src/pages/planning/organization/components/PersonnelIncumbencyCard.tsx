import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TemplateTable } from '@/components/TemplateTable'
import { createPersonnelColumns, PersonnelToolbar } from '@/components/features/planning/organizational-structure/table'
import type { MetaActions } from '@/types/global'
import type { OrgUnit } from '@/services/mock/orgUnits'
import { usePersonnelPositions } from '@/pages/planning/organization/hooks/useOrgUnits'

interface PersonnelIncumbencyCardProps {
  unitId?: string | null
  units?: OrgUnit[]
  selectedReportingChainOfficeId?: string | null
}

export default function PersonnelIncumbencyCard({
  unitId,
  units = [],
  selectedReportingChainOfficeId,
}: PersonnelIncumbencyCardProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // fetch live personnel‑positions data
  const { data: apiPersonnel = [] } = usePersonnelPositions()

  const filteredPersonnel = useMemo(() => {
    return apiPersonnel.filter((person) => {
      const fullName = `${person.firstName} ${person.lastName}`.toLowerCase()
      const matchesSearch = fullName.includes(searchQuery.toLowerCase())

      const matchesOffice = !selectedReportingChainOfficeId ||
        person.orgUnitId === selectedReportingChainOfficeId

      return matchesSearch && matchesOffice
    })
  }, [apiPersonnel, searchQuery, selectedReportingChainOfficeId])

  const columns = createPersonnelColumns([] as MetaActions)

  return (
    <Card className="lg:col-span-2 shadow-sm border border-default-200 bg-card overflow-hidden">
      <CardHeader className="bg-default-50/50 border-b py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-default-900 tracking-tight">Personnel Incumbency</CardTitle>
                <CardDescription className="text-default-400 font-medium uppercase text-[10px] tracking-wider mt-0.5">
                  {unitId
                    ? `Staffing Ledger: ${units?.find((u) => u.id === unitId)?.name}`
                    : 'All Offices & Divisions'}
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <TemplateTable
          columns={columns}
          data={filteredPersonnel}
          actions={[] as MetaActions}
          readonly={false}
          toolbar={() => (
            <PersonnelToolbar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              actions={[] as MetaActions}
            />
          )}
          forTab
          fixedPageSize={11}
        />
      </CardContent>
    </Card>
  )
}
