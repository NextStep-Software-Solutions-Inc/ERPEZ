import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface ViewSignedDocumentButtonProps {
  documentUrl: string
}

export function ViewSignedDocumentButton({
  documentUrl,
}: ViewSignedDocumentButtonProps) {
  if (!documentUrl) return null

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-purple-600" />
          Signed Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-600 mb-4">
          Download or view the digitally signed APR document
        </p>
        <Button
          asChild
          variant="outline"
          className="w-full border-purple-300 hover:bg-purple-50 text-purple-700"
        >
          <a 
            target="_blank" 
            rel="noopener noreferrer" 
            href={documentUrl}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            View Signed Document
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
