import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Building } from 'lucide-react'
import type { OfficeSpendingItem } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TopOfficesChartProps {
  data: Array<OfficeSpendingItem>
  selectedOffice?: string
  onSelectOffice?: (officeName: string, officeId?: string) => void
}

function formatCurrency(val: any) {
  const num = typeof val === 'number' ? val : 0
  if (num >= 1_000_000) return `₱${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `₱${(num / 1_000).toFixed(0)}K`
  return `₱${num}`
}

export function TopOfficesChart({ data, selectedOffice, onSelectOffice }: TopOfficesChartProps) {
  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-sky-600" />
            4. Top Requesting Offices / Units
          </CardTitle>
          <CardDescription className="text-xs">
            Offices with highest total Purchase Request volume and value
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] text-sky-700 bg-sky-50 dark:bg-sky-950/40 border-sky-300"
        >
          {selectedOffice ? `Filtered: ${selectedOffice}` : 'Click bar to filter'}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-1 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="officeName"
              tick={{ fontSize: 10, cursor: 'pointer' }}
              width={80}
              onClick={(e: any) => {
                if (e && e.value) {
                  const match = data.find((d) => d.officeName === e.value)
                  onSelectOffice?.(e.value, match?.officeId)
                }
              }}
            />
            <Tooltip
              formatter={(val: any) => formatCurrency(val)}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as OfficeSpendingItem
                  return (
                    <div className="bg-popover border border-border p-2.5 rounded-lg shadow-md text-xs space-y-1">
                      <div className="font-bold text-foreground">{item.officeName}</div>
                      <div className="text-muted-foreground">Amount: <strong className="text-foreground">{formatCurrency(item.amount)}</strong></div>
                      <div className="text-muted-foreground">Requests: {item.prCount} PRs</div>
                      <div className="text-[10px] text-sky-600 pt-1 border-t border-border/50">
                        {selectedOffice === item.officeName ? 'Click to clear filter' : 'Click to filter entire dashboard'}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="amount"
              name="PR Amount"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(entry: any) => {
                onSelectOffice?.(entry.officeName, entry.officeId)
              }}
            >
              {data.map((entry, index) => {
                const isSelected = selectedOffice === entry.officeName
                const hasSelection = Boolean(selectedOffice)
                const fill = isSelected ? '#0284c7' : hasSelection ? '#94a3b8' : '#0284c7'
                const opacity = hasSelection && !isSelected ? 0.35 : 1
                return <Cell key={`cell-${index}`} fill={fill} fillOpacity={opacity} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
