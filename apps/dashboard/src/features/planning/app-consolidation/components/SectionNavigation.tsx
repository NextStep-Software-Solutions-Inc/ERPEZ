import { Button } from '@/components/ui/button'
import { BarChart3, Settings, Signature } from 'lucide-react'

interface SectionNavigationProps {
  activeSection: 'aggregations' | 'bac' | 'signatories'
  onSectionChange: (section: 'aggregations' | 'bac' | 'signatories') => void
}

export function SectionNavigation({ activeSection, onSectionChange }: SectionNavigationProps) {
  const handleNavigate = (section: 'aggregations' | 'bac' | 'signatories') => {
    onSectionChange(section)
    // Manually scroll with offset to account for sticky header/nav (approx 160px total)
    const element = document.getElementById(`${section}-section`)
    if (element) {
      const offset = 160 // Account for page header + sticky nav height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="bg-gradient-to-r from-slate-50 via-white to-slate-100 border-y border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 p-5 px-6">
        <span className="text-xs font-black text-gray-700 uppercase mr-3 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-300">
          📑 Navigate:
        </span>

        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={() => handleNavigate('aggregations')}
            className={`px-5 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-1.5 border-b-2 ${
              activeSection === 'aggregations'
                ? 'bg-purple-100 text-purple-700 border-b-purple-600 hover:bg-purple-150'
                : 'bg-transparent text-gray-600 border-b-transparent hover:bg-gray-100 hover:border-b-purple-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Summary
          </Button>

          <Button
            onClick={() => handleNavigate('bac')}
            className={`px-5 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-1.5 border-b-2 ${
              activeSection === 'bac'
                ? 'bg-orange-100 text-orange-700 border-b-orange-600 hover:bg-orange-150'
                : 'bg-transparent text-gray-600 border-b-transparent hover:bg-gray-100 hover:border-b-orange-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            APP Item Details
          </Button>

          <Button
            onClick={() => handleNavigate('signatories')}
            className={`px-5 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-1.5 border-b-2 ${
              activeSection === 'signatories'
                ? 'bg-red-100 text-red-700 border-b-red-600 hover:bg-red-150'
                : 'bg-transparent text-gray-600 border-b-transparent hover:bg-gray-100 hover:border-b-red-300'
            }`}
          >
            <Signature className="w-4 h-4" />
            Signatories
          </Button>
        </div>
      </div>
    </div>
  )
}
