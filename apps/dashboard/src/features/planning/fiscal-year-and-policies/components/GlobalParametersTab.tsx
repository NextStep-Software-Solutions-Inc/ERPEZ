import { useState } from 'react';
import { BudgetCallSection } from '@/features/planning/fiscal-year-and-policies/components/BudgetCallSection';
import { ProcurementThresholdsSection } from '@/features/planning/fiscal-year-and-policies/components/ProcurementThresholdsSection';
import { EconomicIndicatorsSection } from '@/features/planning/fiscal-year-and-policies/components/EconomicIndicatorsSection';
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types';

export default function GlobalParametersTab() {
  const [activeFiscalYear, setActiveFiscalYear] = useState<FiscalYear | null>(null);
  const [budgetCalls, setBudgetCalls] = useState([]);
  const [policyConfigs, setPolicyConfigs] = useState([]);

  const activePolicyConfig = policyConfigs.find(
    (config) => config.fiscalYearId === activeFiscalYear?.id
  );

  if (!activeFiscalYear) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No active fiscal year. Please activate a fiscal year first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BudgetCallSection
        activeFiscalYear={activeFiscalYear}
        budgetCalls={budgetCalls}
        setBudgetCalls={setBudgetCalls}
      />

      <ProcurementThresholdsSection
        activeFiscalYear={activeFiscalYear}
        activePolicyConfig={activePolicyConfig}
      />

      <EconomicIndicatorsSection
        activeFiscalYear={activeFiscalYear}
        activePolicyConfig={activePolicyConfig}
        policyConfigs={policyConfigs}
        setPolicyConfigs={setPolicyConfigs}
      />
    </div>
  );
}
