/**
 * Development-only toggle for mock data
 * Only visible in development mode
 */

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export function MockToggle() {
  const [isMockEnabled, setIsMockEnabled] = useState(false)

  useEffect(() => {
    // Only show in development
    if (import.meta.env.DEV) {
      setIsMockEnabled(localStorage.getItem('app_use_mock_targets') === 'true')
    }
  }, [])

  if (!import.meta.env.DEV) return null

  const toggleMock = () => {
    const newValue = !isMockEnabled
    if (newValue) {
      localStorage.setItem('app_use_mock_targets', 'true')
    } else {
      localStorage.removeItem('app_use_mock_targets')
    }
    setIsMockEnabled(newValue)
    // Reload to apply changes
    window.location.reload()
  }

  return (
    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2 text-amber-900 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>
          {isMockEnabled ? '📊 Using Mock Target Data' : '🔌 Using Live API'}
        </span>
      </div>
      <Button
        size="sm"
        onClick={toggleMock}
        className="h-8"
      >
        {isMockEnabled ? 'Disable Mock' : 'Enable Mock'}
      </Button>
    </div>
  )
}
