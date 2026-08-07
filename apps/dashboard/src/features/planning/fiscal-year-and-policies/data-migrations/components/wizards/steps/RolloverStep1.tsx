import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types';

interface RolloverStep1FormData {
  sourceYearId: string;
  targetYearId: string;
  copyOrgStructure: boolean;
  copyUACSLibrary: boolean;
  copyRecurringExpenses: boolean;
}

interface RolloverStep1Props {
  formData: RolloverStep1FormData;
  setFormData: (data: RolloverStep1FormData) => void;
  fiscalYears: FiscalYear[];
  errors: {
    sourceYearId?: string;
    targetYearId?: string;
    copyOrgStructure?: string;
  };
}

export default function RolloverStep1({ formData, setFormData, fiscalYears, errors }: RolloverStep1Props) {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sourceYear">Source Fiscal Year</Label>
          <Select value={formData.sourceYearId} onValueChange={(value) => setFormData({ ...formData, sourceYearId: value })}>
            <SelectTrigger id="sourceYear" className={errors.sourceYearId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select source fiscal year" />
            </SelectTrigger>
            <SelectContent>
              {fiscalYears.map((fy) => (
                <SelectItem key={fy.id} value={fy.id}>
                  FY {fy.year} ({fy.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sourceYearId && (
            <p className="text-sm text-destructive">{errors.sourceYearId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetYear">Target Fiscal Year</Label>
          <Select value={formData.targetYearId} onValueChange={(value) => setFormData({ ...formData, targetYearId: value })}>
            <SelectTrigger id="targetYear" className={errors.targetYearId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select target fiscal year" />
            </SelectTrigger>
            <SelectContent>
              {fiscalYears
                .filter((fy) => fy.id !== formData.sourceYearId)
                .map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    FY {fy.year} ({fy.status})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.targetYearId && (
            <p className="text-sm text-destructive">{errors.targetYearId}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Select the source year containing the data you want to copy, then choose the target year where it will be copied.
        </p>
      </div>
    </div>
  );
}
