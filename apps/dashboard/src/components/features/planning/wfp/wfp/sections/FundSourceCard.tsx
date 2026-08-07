import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FundSource {
  name: string
  code: string
  isActive: boolean
  fiscalYear?: {
    year: string
    startDate: string
    endDate: string
  }
}

interface FundSourceCardProps {
  fundSource: FundSource | undefined
}

export const FundSourceCard = ({ fundSource }: FundSourceCardProps) => {
  if (!fundSource) return null

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{fundSource.name}</CardTitle>
            <CardDescription className="mt-1">{fundSource.code}</CardDescription>
          </div>
          <Badge color={fundSource.isActive ? 'default' : 'secondary'}>
            {fundSource.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          {fundSource.fiscalYear && (
            <div>
              <p className="text-xs text-gray-600">Fiscal Year: <span className="font-semibold text-gray-900">{fundSource.fiscalYear.year}</span></p>
            </div>
          )}
          <p className="text-xs text-gray-600 italic">Reference funding source - Budget managed through OPCR ceiling</p>
        </div>
      </CardContent>
    </Card>
  )
}
