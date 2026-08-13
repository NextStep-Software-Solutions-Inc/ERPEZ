import { useState } from 'react'
import { Info, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NGPAGuideModal } from './NGPAGuideModal'

interface NGPAColumnHeaderProps {
  columnNumber?: number
  label: string
}

export function NGPAColumnHeader({ columnNumber, label }: NGPAColumnHeaderProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-1">
        <span className="font-semibold text-gray-800">{label}</span>
        {columnNumber && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsGuideOpen(true)
            }}
            className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title={`View NGPA Guide for Column ${columnNumber}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <NGPAGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialColumn={columnNumber}
      />
    </>
  )
}

export function NGPAGuideButton({ className }: { className?: string }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsGuideOpen(true)}
        className={`border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 font-semibold cursor-pointer transition-all gap-1.5 ${className || ''}`}
      >
        <BookOpen className="w-4 h-4 text-blue-600" />
        APP Guide
      </Button>

      <NGPAGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  )
}
