import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BookOpen, FileText, Info, Scale, CheckCircle2 } from 'lucide-react'
import {
  NGPA_APP_TYPE_GUIDELINES,
  NGPA_COLUMN_GUIDELINES_DATA,
} from '../data/appGuideData'

interface NGPAGuideModalProps {
  isOpen: boolean
  onClose: () => void
  initialColumn?: number
}

export function NGPAGuideModal({
  isOpen,
  onClose,
  initialColumn,
}: NGPAGuideModalProps) {
  const [activeTab, setActiveTab] = useState<string>('columns')
  const [selectedColumn, setSelectedColumn] = useState<number>(initialColumn || 1)

  useEffect(() => {
    if (initialColumn) {
      setSelectedColumn(initialColumn)
      setActiveTab('columns')
    }
  }, [initialColumn, isOpen])

  const currentGuide = NGPA_COLUMN_GUIDELINES_DATA.find(
    (g) => g.columnNumber === selectedColumn
  ) || NGPA_COLUMN_GUIDELINES_DATA[0]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl bg-slate-50">
        <DialogHeader className="p-6 bg-slate-900 text-white rounded-t-lg border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                NGPA Annual Procurement Plan (APP) Guide
                <Badge className="bg-blue-600 hover:bg-blue-700 text-xs">
                  GPPB Standard
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-1">
                Official guide to filling out the APP form under Republic Act No. 12009 & IRR
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-200 p-1 rounded-xl mb-6">
              <TabsTrigger value="columns" className="font-semibold text-xs py-2">
                <FileText className="w-4 h-4 mr-2" />
                Columns 1 — 12 Guidance
              </TabsTrigger>
              <TabsTrigger value="types" className="font-semibold text-xs py-2">
                <Info className="w-4 h-4 mr-2" />
                APP Submission Types & Rules
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: COLUMNS 1 - 12 */}
            <TabsContent value="columns" className="space-y-6">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                {NGPA_COLUMN_GUIDELINES_DATA.map((col) => (
                  <button
                    key={col.columnNumber}
                    onClick={() => setSelectedColumn(col.columnNumber as number)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedColumn === col.columnNumber
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Col {col.columnNumber}
                  </button>
                ))}
              </div>

              {currentGuide && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Column {currentGuide.columnNumber}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        {currentGuide.particular}
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-300 font-medium text-[11px]">
                      <Scale className="w-3 h-3 mr-1 text-slate-400" />
                      {currentGuide.legalBasis}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Notes & Instructions
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {currentGuide.notes}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Illustrations / Examples by Category
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                          Goods & General Services
                        </span>
                        <p className="text-xs text-slate-700 leading-snug">
                          {currentGuide.examples.goods}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                        <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
                          Infrastructure Projects
                        </span>
                        <p className="text-xs text-slate-700 leading-snug">
                          {currentGuide.examples.infrastructure}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/60">
                        <span className="text-[11px] font-bold text-purple-800 uppercase block mb-1">
                          Consulting Services
                        </span>
                        <p className="text-xs text-slate-700 leading-snug">
                          {currentGuide.examples.consulting}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: APP SUBMISSION TYPES */}
            <TabsContent value="types" className="space-y-4">
              {NGPA_APP_TYPE_GUIDELINES.map((typeGuide) => (
                <div
                  key={typeGuide.type}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      {typeGuide.title}
                    </h3>
                    <Badge
                      className={`${
                        typeGuide.type === 'Indicative'
                          ? 'bg-amber-500'
                          : typeGuide.type === 'Final'
                          ? 'bg-emerald-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {typeGuide.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {typeGuide.description}
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Key Lifecycle Rules
                    </span>
                    {typeGuide.keyRules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
