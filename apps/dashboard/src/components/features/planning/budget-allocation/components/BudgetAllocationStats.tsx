// Budget Allocation Stats Component

import { ChartSpline, HandCoins, Wallet } from "lucide-react";

interface BudgetAllocationStatsProps {
    stats: {
        totalReceivedAmount: number;
        totalRemainingAmount: number;
        totalUtilizedAmount: number;
    } | undefined;
}
export function BudgetAllocationStats({ stats }: BudgetAllocationStatsProps) {
    stats = stats || {
        totalReceivedAmount: 0,
        totalRemainingAmount: 0,
        totalUtilizedAmount: 0,
    };
  return (
    <div className="grid grid-cols-3 gap-4 mb-6 pt-4">
        <div
          className="
          p-6 rounded-xl flex flex-col items-start gap-2 
          bg-green-50/50 border border-green-300 shadow-sm
          hover:shadow-md transition-shadow
        "
        >
          <div className="flex items-center gap-2">
            <HandCoins className="h-6 w-6 text-green-600" />
            <div className="text-base font-medium text-green-700">
              Total Received Funds
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {stats?.totalReceivedAmount.toLocaleString(
              'en-PH',
              { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 },
            ) ?? 'loading...'}
          </div>
        </div>
        <div
          className="
          p-6 rounded-xl flex flex-col items-start gap-2 
          bg-blue-50/50 border border-blue-300 shadow-sm
          hover:shadow-md transition-shadow
        "
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-600" />
            <div className="text-base font-medium text-blue-700">
              Total Funds Available
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {stats?.totalRemainingAmount.toLocaleString(
              'en-PH',
              { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 },
            ) ?? 'loading...'}
          </div>
        </div>
        <div
          className="
          p-6 rounded-xl flex flex-col items-start gap-2 
          bg-amber-50/50 border border-amber-300 shadow-sm
          hover:shadow-md transition-shadow
        "
        >
          <div className="flex items-center gap-2">
            <ChartSpline className="h-6 w-6 text-amber-600" />
            <div className="text-base font-medium text-amber-700">
              Total Budget Utilized
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600 mt-2">
            {stats?.totalUtilizedAmount.toLocaleString(
              'en-PH',
              { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 },
            ) ?? 'loading...'}
          </div>
        </div>
      </div>
    );
};