import { PageContainerDashtail } from '@/components/v2'
import { Badge } from '@/components/ui/badge'

type ProcurementPlaceholderPageProps = {
  title: string
  description: string
  badge?: string
}

const PROCUREMENT_BADGES: Record<string, string> = {
  Dashboard: 'Overview',
  'Request for Quotation (RFQ)': 'RFQ',
  'Manage RFQ': 'RFQ Admin',
  'Purchase Requests (PR)': 'PR',
  'Purchase Orders (PO)': 'PO',
  'Manage PR': 'PR Admin',
  'Manage PRs': 'PRs Admin',
  'Agency Purchase Requests (APR)': 'APR',
  'Manage APRs': 'APR Admin',
  'Notice to Proceed (NTP)': 'NTP',
  'Manage NTP': 'NTP Admin',
  'Notice of Award (NOA)': 'NOA',
  'Manage NOA': 'NOA Admin',
  'Abstract of Bids (AOB)': 'AOB',
  'Manage AOB': 'AOB Admin',
  'BAC Resolutions': 'BAC Resolutions',
  'Manage BAC Resolutions': 'BAC Resolutions Admin',
  'Consolidate PRs': 'Consolidation',
  'Contracts (For Consulting/Infrastructure)': 'Contracts',
  'Manage Contracts': 'Contracts Admin',
}

function resolveBadge(title: string, badge?: string) {
  return badge ?? PROCUREMENT_BADGES[title] ?? 'Procurement'
}

export function ProcurementPlaceholderPage({
  title,
  description,
  badge,
}: ProcurementPlaceholderPageProps) {
  return (
    <PageContainerDashtail
      title={title}
      description={description}
      headerVariant="branded"
      headerSize="large"
      actions={
        <Badge variant="outline" className="h-fit">
          {resolveBadge(title, badge)}
        </Badge>
      }
      contentClassName="pt-4"
    >
      <div className="rounded-xl border border-dashed border-default-200 bg-default-50 p-6 text-sm text-default-500 dark:bg-default-100/10">
        Procurement workspace placeholder.
      </div>
    </PageContainerDashtail>
  )
}
