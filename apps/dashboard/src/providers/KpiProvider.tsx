import { createContext, useContext } from 'react'
import type { ReactNode } from 'react';
import type { KPIDetails } from '@/components/features/planning/kpi/types'

interface KpiContextType {
    kpiData: KPIDetails
}

const KpiContext = createContext<KpiContextType | undefined>(undefined)

interface KpiProviderProps {
    children: ReactNode
    kpiData: KPIDetails
}

export function KpiProvider({ children, kpiData }: KpiProviderProps) {
    return (
        <KpiContext.Provider value={{ kpiData }}>
            {children}
        </KpiContext.Provider>
    )
}

export function useKpiData() {
    const context = useContext(KpiContext)
    if (context === undefined) {
        throw new Error('useKpiData must be used within a KpiProvider')
    }
    return context.kpiData
}