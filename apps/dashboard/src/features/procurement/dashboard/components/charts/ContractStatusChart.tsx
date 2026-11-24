import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ContractStatusShare } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ContractStatusChartProps {
  data: Array<ContractStatusShare>
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#64748b', '#ef4444', '#a855f7']

export function ContractStatusChart({ data }: ContractStatusChartProps) {
  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
          5. Contract Status Distribution
        </CardTitle>
        <CardDescription className="text-xs">
          Executed vs. ForApproval vs. Draft vs. Cancelled contract instruments
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as any}
              dataKey="percentage"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${value}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
