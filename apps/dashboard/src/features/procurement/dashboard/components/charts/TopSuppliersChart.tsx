import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Building2 } from 'lucide-react'
import type { SupplierConcentration } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SupplierIntelligenceDrawer } from '../SupplierIntelligenceDrawer'

interface TopSuppliersChartProps {
  data: Array<SupplierConcentration>
}

function formatCurrency(val: any) {
  const num = typeof val === 'number' ? val : 0
  if (num >= 1_000_000) return `₱${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `₱${(num / 1_000).toFixed(0)}K`
  return `₱${num}`
}

export function TopSuppliersChart({ data }: TopSuppliersChartProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierConcentration | null>(null)

  return (
    <>
      <Card className="border border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              6. Top 10 Suppliers by Award Value
            </CardTitle>
            <CardDescription className="text-xs">
              Vendors with highest cumulative contract awards and win concentration
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] text-teal-700 bg-teal-50 dark:bg-teal-950/40 border-teal-300">
            Click bar for Rating Matrix
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
                dataKey="supplierName"
                tick={{ fontSize: 10, cursor: 'pointer' }}
                width={80}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(val)}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as SupplierConcentration
                    return (
                      <div className="bg-popover border border-border p-2.5 rounded-lg shadow-md text-xs space-y-1">
                        <div className="font-bold text-foreground">{item.supplierName}</div>
                        <div className="text-muted-foreground">Awarded: <strong className="text-foreground">{formatCurrency(item.totalAwarded)}</strong></div>
                        <div className="text-muted-foreground">Contracts: {item.contractCount} ({item.percentage}% share)</div>
                        <div className="text-[10px] text-teal-600 pt-1 border-t border-border/50">Click to open Vendor Performance Scorecard</div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="totalAwarded"
                name="Awarded Amount"
                fill="#14b8a6"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(entry: any) => setSelectedSupplier(entry)}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <SupplierIntelligenceDrawer
        supplier={selectedSupplier}
        open={Boolean(selectedSupplier)}
        onClose={() => setSelectedSupplier(null)}
      />
    </>
  )
}
