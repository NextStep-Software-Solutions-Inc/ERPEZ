/**
 * Development-only toggle for Step 3 mock data
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
      setIsMockEnabled(localStorage.getItem('app_use_mock_step3') === 'true')
    }
  }, [])

  if (!import.meta.env.DEV) return null

  const toggleMock = () => {
    const newValue = !isMockEnabled
    if (newValue) {
      localStorage.setItem('app_use_mock_step3', 'true')
    } else {
      localStorage.removeItem('app_use_mock_step3')
    }
    setIsMockEnabled(newValue)
    // Reload to apply changes
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 flex items-center gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-xs font-medium text-yellow-800">Mock Data</span>
        </div>
        <Button
          size="sm"
          variant={isMockEnabled ? 'soft' : 'outline'}
          onClick={toggleMock}
          className="text-xs h-7"
        >
          {isMockEnabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>
    </div>
  )
}
