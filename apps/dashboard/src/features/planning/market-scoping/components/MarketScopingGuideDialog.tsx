/**
 * Market Scoping Reference & Help Guide Dialog
 * Visual slides summarizing RA 12009 guidelines for filling out Market Scoping Forms
 * Location: src/features/planning/market-scoping/components/
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Info,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  DollarSign,
  Truck,
  ShieldAlert,
  Archive,
  Layers,
  X,
} from 'lucide-react'
import { marketScopingGuideOpenAtom } from '../atoms/marketScopingStateAtom'

const SLIDES = [
  {
    id: 'legal',
    title: 'Legal basis and overview',
  },
  {
    id: 'why',
    title: 'Why conduct scoping',
  },
  {
    id: 'how',
    title: 'How and sources',
  },
  {
    id: 'specifications',
    title: 'Specs and checklist guide',
  },
]

export function MarketScopingGuideDialog() {
  const [isOpen, setIsOpen] = useAtom(marketScopingGuideOpenAtom)
  const [activeTab, setActiveTab] = useState('legal')

  const currentIdx = SLIDES.findIndex((s) => s.id === activeTab)

  const handlePrev = () => {
    if (currentIdx > 0) {
      setActiveTab(SLIDES[currentIdx - 1].id)
    }
  }

  const handleNext = () => {
    if (currentIdx < SLIDES.length - 1) {
      setActiveTab(SLIDES[currentIdx + 1].id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl md:max-w-5xl h-fit max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl">
        {/* Banner header - Deep Purple aesthetic strip */}
        <div className="bg-[#3f3883] p-6 text-white shrink-0 relative">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="h-4 w-4 text-indigo-300" /> Reference Guidelines
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Market scoping reference manual
            </DialogTitle>
            <p className="text-xs text-indigo-200 font-medium">
              Legal basis: Republic Act No. 12009 and implementing rules and regulations
            </p>
          </DialogHeader>

          {/* Visible custom close button in the banner */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs switcher - Flat layout that doesn't overflow */}
        <div className="border-b border-slate-200 bg-white shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex justify-start gap-8 bg-transparent border-b border-slate-100 w-full h-12 p-0 px-6 rounded-none">
              {SLIDES.map((slide) => (
                <TabsTrigger
                  key={slide.id}
                  value={slide.id}
                  className="h-full px-1 py-3 text-sm font-semibold rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-650 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all"
                >
                  {slide.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Slide Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
          {/* TAB 1: Legal Basis */}
          {activeTab === 'legal' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="bg-slate-50/60 p-6 rounded-xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-650">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">What is Market Scoping?</h3>
                    <p className="text-xs text-indigo-600 font-semibold">Republic Act No. 12009 Guidelines</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pt-1">
                  A comprehensive document used by the <strong className="text-slate-900 font-semibold">Procuring Entity</strong>, through the <strong className="text-slate-900 font-semibold">End-User</strong> or <strong className="text-slate-900 font-semibold">Implementing Unit</strong>, to systematically gather, assess, and analyze pertinent market information before procuring goods, services, or infrastructure.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-white border border-slate-100">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Time of Scoping</h4>
                    <p className="text-xs text-slate-700 font-medium">Must be conducted <span className="underline decoration-indigo-500 underline-offset-2">before</span> finalizing the Project Procurement Management Plan (PPMP).</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-100">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Applicability</h4>
                    <p className="text-xs text-slate-700 font-medium">Mandatory for <span className="underline decoration-indigo-500 underline-offset-2">ALL modes</span> of public procurement (Competitive Bidding, Alternative Modes, etc.).</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-100">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Principle</h4>
                    <p className="text-xs text-slate-700 font-medium">Observe the principal rule of <span className="underline decoration-indigo-500 underline-offset-2">PROPORTIONALITY</span> relative to the value and complexity of procurement.</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-900">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="font-bold block mb-1">Important Compliance Notice</strong>
                  Failure to conduct and document thorough market scoping prior to PPMP finalization may result in procurement delay, non-alignment of budget estimates, and compliance audit queries under RA 12009.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Why Scope? */}
          {activeTab === 'why' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Purple callout banner */}
              <div className="bg-[#f0effa] border border-[#d6d4f0] p-4 rounded-xl flex gap-3 text-[#3f3883]">
                <Info className="h-5 w-5 shrink-0 text-[#3f3883] mt-0.5" strokeWidth={2.5} />
                <div className="text-xs font-bold leading-relaxed">
                  All six parameters (A–F) must be evaluated and documented in Section 4 of the scoping checklist before submission.
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900">Why conduct market scoping?</h3>
                <p className="text-xs text-slate-500">Six core parameters to evaluate for a complete scoping form.</p>
              </div>

              {/* 2-Column Grid matching suggested redesign */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Parameter A */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 flex gap-4">
                  <div className="p-2 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-0.5">A. Project cost estimate</h4>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      Align with market prices; factor in direct/indirect costs, inflation, and life cycle costing.
                    </p>
                  </div>
                </div>

                {/* Parameter B */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 flex gap-4">
                  <div className="p-2 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-0.5">B. Design and specification</h4>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      Verify suppliers meet technical, financial, and international performance standards.
                    </p>
                  </div>
                </div>

                {/* Parameter C */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 flex gap-4">
                  <div className="p-2 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-0.5">C. Technical criteria</h4>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      Define minimum functional requirements and identify qualified suppliers.
                    </p>
                  </div>
                </div>

                {/* Parameter D */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 flex gap-4">
                  <div className="p-2 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-0.5">D. Delivery lead time</h4>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      Assess supply chain, production rates, and transport channel timelines.
                    </p>
                  </div>
                </div>

                {/* Parameter E */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 flex gap-4">
                  <div className="p-2 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
                    <Archive className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-0.5">E. Storage & Warehousing</h4>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      Identify storage capabilities considering conditions like temperature, humidity, and handling.
                    </p>
                  </div>
                </div>

                {/* Parameter F */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 flex gap-4">
                  <div className="p-2 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-0.5">F. Identified Risk/s</h4>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      List specific market risks (e.g. price volatility, supplier monopoly) and mitigation strategies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: How & Sources */}
          {activeTab === 'how' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <h3 className="font-bold text-lg text-slate-900">How to Conduct Scoping & Where to Get Data</h3>
              <p className="text-xs text-slate-500 -mt-4">Permitted mechanisms and source locations to capture objective market variables.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Methodologies */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Approved Methodologies</h4>
                  <ul className="space-y-2">
                    {[
                      'Direct supplier consultations, professional summits, and conferences.',
                      'Review of technical, financial, or scientific journals & market reports.',
                      'Testing products, demo sessions, proof-of-concept inspections, or factory/showroom visits.',
                      'Detailed canvas lists and quotation sheets from multiple qualified suppliers.',
                    ].map((text, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sources */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Primary Sources of Specifications</h4>
                  <ul className="space-y-2">
                    {[
                      'PhilGEPS registry portals and historical government agency contract postings.',
                      'Specifications issued by relevant government agencies and standards boards.',
                      'Previous records of successful internal procurement projects.',
                      'Technical journals, manufacturer manuals, catalogs, and online databases.',
                    ].map((text, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Specifications & Checklist Guide */}
          {activeTab === 'specifications' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="bg-slate-50/60 p-6 rounded-xl border border-red-100 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Brand Names Restrictions</h3>
                    <p className="text-xs text-red-600 font-semibold">Prohibited Practices under IRR Section 11</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pt-1">
                  Reference to <strong className="text-red-600 font-semibold underline decoration-red-300 underline-offset-2">brand names shall NOT be allowed</strong> in the specifications. All procurement requests must detail functional performance requirements instead.
                </p>

                <div className="bg-white p-4 rounded-lg space-y-2 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Exceptions to the Brand Name Ban:</h4>
                  <ul className="list-disc list-inside text-xs text-slate-650 space-y-1.5 pl-1">
                    <li>Technical compatibility with existing equipment</li>
                    <li>Interoperability of parts or software licensing</li>
                    <li>Maintenance servicing contracts or warranty reservations</li>
                    <li>Supply chain replacement reservation of warranty support</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950">Who Approves the MSF? (Signatories)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 block mb-1">Prepared By:</span>
                    Personnel-in-charge, End-User, or member of the Implementing Unit who conducted the research.
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 block mb-1">Approved By:</span>
                    Head, End-User, or Head of the Implementing Unit.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer slider action bar - Redesigned dots progress and buttons */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex items-center justify-between shrink-0">
          {/* Dot progress indicator + page label */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {SLIDES.map((slide) => (
                <div
                  key={slide.id}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    activeTab === slide.id ? 'w-6 bg-indigo-650' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-slate-500 font-bold">
              Slide {currentIdx + 1} of {SLIDES.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="gap-1 h-9 font-bold text-slate-700 bg-white border-slate-200 px-4"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            {currentIdx < SLIDES.length - 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="gap-1 h-9 font-bold text-slate-700 bg-white border-slate-200 px-4"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 font-bold px-4"
              >
                Got It, Close Guide
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
