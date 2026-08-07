import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileSpreadsheet, ArrowRight } from 'lucide-react'

export function OPCRSelectionRequired() {
  const navigate = useNavigate()

  const handleGoToSelfRating = () => {
    navigate({
      to: '/v2/performance-review',
      search: (prev: any) => ({
        ...prev,
        tab: 'SelfRating',
      }),
      replace: true,
    })
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/5 max-w-lg mx-auto my-12 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary transition-transform hover:scale-105">
          <FileSpreadsheet className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-800">No Active OPCR Session</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Please select or initialize an OPCR session first in the <strong>Self-Rating</strong> tab to view performance metrics, calculation logic, and rankings.
          </p>
        </div>
        <Button onClick={handleGoToSelfRating} className="gap-2 group shadow-sm cursor-pointer">
          Select OPCR Session
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  )
}
