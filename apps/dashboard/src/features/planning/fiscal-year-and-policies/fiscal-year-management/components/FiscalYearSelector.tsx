import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FiscalYearSelectorProps {
  fiscalYears: FiscalYear[];
  selectedFiscalYearId: string | null;
  onSelect: (fiscalYearId: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

/**
 * Presentational component for fiscal year dropdown
 * Groups fiscal years by status (Active/Planning first, Closed below divider)
 */
export default function FiscalYearSelector({
  fiscalYears,
  selectedFiscalYearId,
  onSelect,
  isLoading = false,
  isDisabled = false,
}: FiscalYearSelectorProps) {
  // Filter and group fiscal years by status
  const activePlanningYears = fiscalYears.filter((fy) => fy.status === 'Active' || fy.status === 'Planning');
  const closedYears = fiscalYears.filter((fy) => fy.status === 'Closed');

  const selectedYear = fiscalYears.find((fy) => fy.id === selectedFiscalYearId);
  const displayValue = selectedYear ? `${selectedYear.status} - FY ${selectedYear.year}` : 'Select a fiscal year';

  return (
    <div className="w-full">
      <label htmlFor="fiscal-year-select" className="text-sm font-medium text-gray-700 block mb-2">
        Fiscal Year
      </label>
      <Select value={selectedFiscalYearId || ''} onValueChange={onSelect} disabled={isLoading || isDisabled}>
        <SelectTrigger 
          id="fiscal-year-select"
          aria-label="Select a fiscal year for function configuration"
          disabled={isLoading || isDisabled}
          className="w-full"
        >
          <SelectValue placeholder={displayValue} />
        </SelectTrigger>
        <SelectContent>
          {activePlanningYears.length > 0 && (
            <SelectGroup>
              <SelectLabel className="px-2 py-1.5 text-xs font-semibold uppercase text-gray-600">
                Editable (Active & Planning)
              </SelectLabel>
              {activePlanningYears.map((fy) => (
                <SelectItem key={fy.id} value={fy.id}>
                  {fy.status} - FY {fy.year} {fy.description && `(${fy.description})`}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          
          {closedYears.length > 0 && (
            <>
              {activePlanningYears.length > 0 && <hr className="my-1" />}
              <SelectGroup>
                <SelectLabel className="px-2 py-1.5 text-xs font-semibold uppercase text-gray-500">
                  Read-Only (Closed)
                </SelectLabel>
                {closedYears.map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    Closed - FY {fy.year} {fy.description && `(${fy.description})`}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
