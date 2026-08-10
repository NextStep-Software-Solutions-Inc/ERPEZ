import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MasterDoc, Profile } from '../types'

interface ProfileDocumentsDialogProps {
  profile: Profile | null
  masterDocs: MasterDoc[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewTemplate: (doc: MasterDoc) => void
}

export function ProfileDocumentsDialog({
  profile,
  masterDocs,
  open,
  onOpenChange,
  onViewTemplate,
}: ProfileDocumentsDialogProps) {
  const includedDocs =
    profile?.documentIds
      .map((docId) => masterDocs.find((doc) => doc.id === docId))
      .filter((doc): doc is MasterDoc => Boolean(doc)) ?? []
  const technicalDocs = includedDocs.filter((doc) => doc.envelope === 1)
  const financialDocs = includedDocs.filter((doc) => doc.envelope === 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profile?.name ?? 'Default Documents'}</DialogTitle>
          <DialogDescription>
            Review the master documents bundled into this reusable checklist
            profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-3 rounded-md border bg-muted/20 p-4 sm:grid-cols-3">
            <div>
              <div className="text-2xs uppercase font-semibold text-muted-foreground">
                Total Documents
              </div>
              <div className="mt-1 text-2xl font-bold">
                {includedDocs.length}
              </div>
            </div>
            <div>
              <div className="text-2xs uppercase font-semibold text-muted-foreground">
                Technical
              </div>
              <div className="mt-1 text-2xl font-bold text-info">
                {technicalDocs.length}
              </div>
            </div>
            <div>
              <div className="text-2xs uppercase font-semibold text-muted-foreground">
                Financial
              </div>
              <div className="mt-1 text-2xl font-bold text-warning">
                {financialDocs.length}
              </div>
            </div>
          </div>

          {[
            { title: 'Envelope 1: Technical', docs: technicalDocs },
            { title: 'Envelope 2: Financial', docs: financialDocs },
          ].map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-sm font-bold text-foreground">
                {group.title}
              </h4>
              <div className="rounded-md border">
                {group.docs.length ? (
                  group.docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between gap-4 border-b p-3 last:border-b-0"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="font-semibold text-sm">{doc.name}</div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                          {doc.description}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className={
                            doc.envelope === 1
                              ? 'bg-info/10 text-info border-info/20'
                              : 'bg-warning/10 text-warning border-warning/20'
                          }
                        >
                          Envelope {doc.envelope}
                        </Badge>
                        {doc.templateFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            title={`View ${doc.templateFile}`}
                            aria-label={`View ${doc.templateFile}`}
                            className="h-7 max-w-[220px] justify-start gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 font-mono text-2xs text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => onViewTemplate(doc)}
                          >
                            <Eye className="h-3 w-3 shrink-0" />
                            <span className="truncate">{doc.templateFile}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm italic text-muted-foreground">
                    No documents assigned to this envelope.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
