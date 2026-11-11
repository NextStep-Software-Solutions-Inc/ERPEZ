// Budget Allocation Stats Component

import { ChartSpline, HandCoins, Wallet } from "lucide-react";
import { StatCard } from "@/components/StatCard";

interface BudgetAllocationStatsProps {
  stats:
    | {
        totalReceivedAmount: number;
        totalRemainingAmount: number;
        totalUtilizedAmount: number;
      }
    | undefined;
}

const formatPHP = (amount: number) =>
  amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });

export function BudgetAllocationStats({ stats }: BudgetAllocationStatsProps) {
  const resolved = stats || {
    totalReceivedAmount: 0,
    totalRemainingAmount: 0,
    totalUtilizedAmount: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-4">
      <StatCard
        label="Total Received Funds"
        value={formatPHP(resolved.totalReceivedAmount)}
        icon={HandCoins}
        colorScheme="success"
      />
      <StatCard
        label="Total Funds Available"
        value={formatPHP(resolved.totalRemainingAmount)}
        icon={Wallet}
        colorScheme="info"
      />
      <StatCard
        label="Total Budget Utilized"
        value={formatPHP(resolved.totalUtilizedAmount)}
        icon={ChartSpline}
        colorScheme="warning"
      />
    </div>
  );
}