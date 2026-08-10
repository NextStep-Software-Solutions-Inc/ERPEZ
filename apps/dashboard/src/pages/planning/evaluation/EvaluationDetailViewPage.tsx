import {
  BarChart3,
  CheckCircle,
  ExternalLink,
  Eye,
  FileText,
  Star,
} from 'lucide-react'
import type { EvaluationDetails } from '@/components/features/planning/evaluation'
import { PageContainer } from '@/components/PageContainer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function EvaluationDetailViewPage() {
  // Mock detailed data - in a real app, you'd fetch this from an API using the id
  const evaluationData: EvaluationDetails = {
    id: '',
    deliveryUnit: 'North Region Company',
    rating: 5,
    status: 'Approved',
    description: 'Review and evaluate delivery unit performance',
    companyName: 'North Region Company',
    overallRating: 5.0,
    maxRating: 5.0,
    verificationMethods: [
      {
        id: 'customer-survey',
        title: 'Customer Survey Result',
        description:
          'Quarterly customer satisfaction survey conducted via online platform',
        uploadedDate: '2024-01-10',
        url: 'https://surveys.example.com/customer-satisfaction',
      },
      {
        id: 'feedback-form',
        title: 'Feedback Form',
        description:
          'Physical and digital feedback form collected at service points',
        uploadedDate: '2024-01-12',
        url: 'https://feedback.example.com/forms',
      },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Returned':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number, maxRating: number = 5) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < maxRating; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />,
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-5 w-5 text-gray-300" />
            <Star
              className="h-5 w-5 fill-yellow-400 text-yellow-400 absolute top-0 left-0 overflow-hidden"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>,
        )
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />)
      }
    }
    return stars
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <PageContainer
      title={evaluationData.companyName}
      description={evaluationData.description}
      backTo={true}
      backLabel="Back to Evaluation"
    >
      <div className="space-y-6">
        {/* Delivery Unit Ratings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Delivery Unit Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Rating
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold">
                    {evaluationData.overallRating} / {evaluationData.maxRating}
                  </span>
                  <div className="flex items-center gap-1">
                    {renderStars(
                      evaluationData.overallRating,
                      evaluationData.maxRating,
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-2">
                  <Badge className={getStatusColor(evaluationData.status)}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {evaluationData.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mode of Verification Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mode of Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {evaluationData.verificationMethods.map((method) => (
              <Card key={method.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(method.url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Uploaded: </span>
                      <span className="font-medium">
                        {formatDate(method.uploadedDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={method.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
                      >
                        {method.url}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Rating
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluationData.overallRating}
              </div>
              <div className="flex items-center mt-1">
                {renderStars(evaluationData.overallRating)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Verification Methods
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluationData.verificationMethods.length}
              </div>
              <p className="text-xs text-muted-foreground">Active methods</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {evaluationData.status}
              </div>
              <p className="text-xs text-muted-foreground">Current status</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
            <CardDescription>
              Detailed performance breakdown and insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Customer Satisfaction
                </label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Excellent</span>
                    <div className="flex items-center gap-1">
                      {renderStars(5)}
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: '95%' }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Quality</label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Excellent</span>
                    <div className="flex items-center gap-1">
                      {renderStars(5)}
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: '98%' }}
                  ></div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">
                Key Achievements
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Exceeded customer satisfaction targets by 15%</li>
                <li>• Maintained 100% service delivery compliance</li>
                <li>• Implemented 3 process improvement initiatives</li>
                <li>• Achieved zero customer complaints in Q4</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

export default EvaluationDetailViewPage
