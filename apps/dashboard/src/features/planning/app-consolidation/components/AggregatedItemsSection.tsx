import { useState } from 'react'
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { AppMaster } from '../types'

interface AggregatedItemsSectionProps {
  app: AppMaster
  isDraft?: boolean
  onEdit?: () => void
}

export function AggregatedItemsSection({ app }: AggregatedItemsSectionProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())

  const toggleUnit = (unitKey: string) => {
    const newSet = new Set(expandedUnits)
    if (newSet.has(unitKey)) {
      newSet.delete(unitKey)
    } else {
      newSet.add(unitKey)
    }
    setExpandedUnits(newSet)
  }

  return (
    <div id="aggregations-section" className="border-0 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-purple-50/80 to-purple-100/40 border-t-4 border-t-purple-500">
      <Card className="border-0 bg-transparent shadow-none rounded-none">
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-black text-sm shadow-lg">
              5
            </div>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Aggregated Items by Unit
            </h2>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-12 h-12 bg-purple-200/30 rounded-lg flex items-center justify-center">
                📈
              </div>
            </div>
          </div>
        </div>
        <CardContent className="px-6 pb-6">
          {app.aggregationResults?.items && app.aggregationResults.items.length > 0 ? (
            <div className="space-y-4">
              {app.aggregationResults.items.map((item, idx) => {
                const unitKey = `unit-${idx}`
                const isExpanded = expandedUnits.has(unitKey)
                return (
                  <div
                    key={idx}
                    className="border-l-4 border-purple-300 rounded-xl p-5 bg-white/80 hover:shadow-lg transition-all cursor-pointer hover:border-purple-500 hover:-translate-y-1 hover:bg-white"
                    onClick={() => toggleUnit(unitKey)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700">{idx + 1}</Badge>
                          <p className="font-semibold text-lg text-gray-900">{item.unit}</p>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.items.length} item(s) • {item.totalQuantity} unit(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                        <p className="text-lg font-bold text-purple-600">
                          ₱{item.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    {isExpanded && (
                      <>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          {item.items.map((subItem, subIdx) => (
                            <div
                              key={subIdx}
                              onClick={(e) => {
                                e.stopPropagation()
                                toast.info('Item details coming soon')
                              }}
                              className="flex items-center justify-between text-sm py-2 px-3 rounded cursor-pointer hover:bg-purple-50 transition-colors border-l-2 border-transparent hover:border-purple-400"
                            >
                              <span className="text-gray-700 text-xs flex-1">
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-2">
                                  {subItem.code}
                                </span>
                                {subItem.description}
                              </span>
                              <div className="flex gap-4 text-right">
                                <span className="text-gray-600">
                                  {subItem.quantity} {subItem.unit}
                                </span>
                                <span className="font-medium min-w-[140px]">
                                  ₱{subItem.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No aggregated items</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
