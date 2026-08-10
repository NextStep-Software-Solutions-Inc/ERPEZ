import { mockPpmpDatabase } from '../data/mockPpmpData'
import {
  ApprovalRole,
  PPMPState,
  type PPMP,
  type PPMPLineItem,
  type NonProcurableCost,
  type PPMPActivityBlock,
  type PPMPIoEBlock,
  type PPMPAttachment,
  type MonthlyQuantities,
} from '../types/ppmpTypes'
import { QUANTITY_AND_SIZE_LABEL } from './ppmpFieldDefaults'
import { formatCurrency } from './ppmpUtils'

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function humanizeState(state: PPMPState): string {
  switch (state) {
    case PPMPState.DRAFT:
      return 'Draft'
    case PPMPState.PENDING_REVIEW:
      return 'Pending Review'
    case PPMPState.APPROVED:
      return 'Approved'
    case PPMPState.AMENDING:
      return 'Amending'
    case PPMPState.SUPERSEDED:
      return 'Superseded'
    case PPMPState.CONSOLIDATED:
      return 'Consolidated'
    case PPMPState.REJECTED:
      return 'Rejected'
    default:
      return state
  }
}

function formatDate(value: string): string {
  return DATE_TIME_FORMATTER.format(new Date(value))
}

function collectChangeRows(
  current: PPMP,
  parent: PPMP | null,
): Array<{
  section: string
  original: string
  revised: string
  note: string
}> {
  if (!parent) return []

  const rows: Array<{
    section: string
    original: string
    revised: string
    note: string
  }> = []

  // Track finalization status changes
  if (parent.isFinal !== current.isFinal) {
    rows.push({
      section: 'PPMP Document',
      original: parent.isFinal ? 'Final' : 'Indicative',
      revised: current.isFinal ? 'Final' : 'Indicative',
      note: 'Finalization status changed.',
    })
  }

  const parentActivities = new Map(
    parent.activityBlocks.map((activity) => [activity.id, activity]),
  )

  for (const activity of current.activityBlocks) {
    const originalActivity = parentActivities.get(activity.id)
    const activitySection = `${activity.activityCode} · ${activity.activityName}`

    if (!originalActivity) {
      rows.push({
        section: activitySection,
        original: 'Not present',
        revised: `${formatCurrency(activity.totalCost)} total`,
        note: 'Activity added in the amended version.',
      })
      continue
    }

    if (originalActivity.totalCost !== activity.totalCost) {
      rows.push({
        section: activitySection,
        original: formatCurrency(originalActivity.totalCost),
        revised: formatCurrency(activity.totalCost),
        note: 'Activity total changed.',
      })
    }

    const parentBlocks = new Map(
      originalActivity.ioEBlocks.map((block) => [block.id, block]),
    )

    for (const block of activity.ioEBlocks) {
      const originalBlock = parentBlocks.get(block.id)
      const blockSection = `${activity.activityCode} → ${block.ioEName}`

      if (!originalBlock) {
        rows.push({
          section: blockSection,
          original: 'Not present',
          revised: `${formatCurrency(block.totalCost)} total`,
          note: 'Item of Expenditure block added.',
        })
        continue
      }

      if (
        originalBlock.totalCost !== block.totalCost ||
        originalBlock.items.length !== block.items.length ||
        (originalBlock.costs?.length ?? 0) !== (block.costs?.length ?? 0) ||
        originalBlock.budgetLimit !== block.budgetLimit ||
        originalBlock.isProcurable !== block.isProcurable
      ) {
        const originalCount = originalBlock.isProcurable
          ? originalBlock.items.length
          : (originalBlock.costs?.length ?? 0)
        const revisedCount = block.isProcurable
          ? block.items.length
          : (block.costs?.length ?? 0)
        const entryLabel = originalBlock.isProcurable ? 'item' : 'cost row'
        const originalSnapshot = `${formatCurrency(originalBlock.totalCost)} · ${originalCount} ${entryLabel}${originalCount === 1 ? '' : 's'}`
        const revisedSnapshot = `${formatCurrency(block.totalCost)} · ${revisedCount} ${entryLabel}${revisedCount === 1 ? '' : 's'}`

        rows.push({
          section: blockSection,
          original: originalSnapshot,
          revised: revisedSnapshot,
          note: 'Block total, budget limit, or item count changed.',
        })
      }
    }
  }

  return rows
}

function buildChangeRows(
  rows: Array<{
    section: string
    original: string
    revised: string
    note: string
  }>,
): string {
  if (rows.length === 0) {
    return `
      <tr>
        <td colspan="4" class="empty-state">No amendment differences were detected.</td>
      </tr>
    `
  }

  return rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.section)}</td>
          <td>${escapeHtml(row.note)}</td>
          <td>${escapeHtml(row.original)}</td>
          <td>${escapeHtml(row.revised)}</td>
        </tr>
      `,
    )
    .join('')
}

function getMonthlyValue(
  quantities: Partial<MonthlyQuantities> | undefined,
  monthKey: string,
): number {
  return quantities?.[monthKey as keyof MonthlyQuantities] ?? 0
}

type MetadataDisplayValue = {
  text: string
  isNA: boolean
}

function formatMetadataValue(
  value: string | null | undefined,
): MetadataDisplayValue {
  if (!value?.trim()) {
    return { text: 'N/A', isNA: true }
  }

  return { text: value.trim(), isNA: false }
}

function formatNumberMetadata(
  value: number | null | undefined,
): MetadataDisplayValue {
  if (value == null) {
    return { text: 'N/A', isNA: true }
  }

  return { text: formatCurrency(value), isNA: false }
}

function formatPreProcMetadata(
  value: string | boolean | null | undefined,
): MetadataDisplayValue {
  if (value === true || value === 'yes') {
    return { text: 'Yes', isNA: false }
  }

  if (value === false || value === 'no') {
    return { text: 'No', isNA: false }
  }

  return { text: 'N/A', isNA: true }
}

function renderMetadataValue(value: MetadataDisplayValue): string {
  return `<strong>${escapeHtml(value.text)}</strong>`
}

function formatAttachmentSummary(
  attachments: PPMPAttachment[] | null | undefined,
): MetadataDisplayValue {
  if (!attachments || attachments.length === 0) {
    return { text: 'N/A', isNA: true }
  }

  return {
    text: attachments
      .map((attachment) => `${attachment.fileName} (${attachment.category})`)
      .join(', '),
    isNA: false,
  }
}

function buildLineItemMetadataRow(
  item: PPMPLineItem,
  columnCount: number,
): string {
  const metadata: Array<[string, MetadataDisplayValue]> = [
    ['Project Type', formatMetadataValue(item.projectType)],
    [QUANTITY_AND_SIZE_LABEL, formatMetadataValue(item.sizeSpecification)],
    [
      'Pre-Procurement Conference',
      formatPreProcMetadata(item.preProcurementConference),
    ],
    [
      'Start of Procurement Activity',
      formatMetadataValue(item.procurementStart),
    ],
    ['End of Procurement Activity', formatMetadataValue(item.procurementEnd)],
    ['Expected Delivery', formatMetadataValue(item.expectedDelivery)],
    ['Remarks', formatMetadataValue(item.remarks)],
    ['Supporting Documents', formatAttachmentSummary(item.attachments)],
  ]

  return `
    <tr class="item-metadata-row">
      <td colspan="${columnCount}">
        <div class="item-metadata-grid">
          ${metadata
            .map(
              ([label, value]) => `
                <div class="item-metadata-chip">
                  <span class="item-metadata-label">${escapeHtml(label.toString())}</span>
                  ${renderMetadataValue(value)}
                </div>
              `,
            )
            .join('')}
        </div>
      </td>
    </tr>
  `
}

function buildNonProcurableCostMetadataRow(
  cost: NonProcurableCost,
  columnCount: number,
): string {
  const metadata: Array<[string, MetadataDisplayValue]> = [
    ['Project Type', formatMetadataValue(cost.projectType)],
    [QUANTITY_AND_SIZE_LABEL, formatMetadataValue(cost.sizeSpecification)],
    [
      'Pre-Procurement Conference',
      formatPreProcMetadata(cost.preProcurementConference),
    ],
    [
      'Start of Procurement Activity',
      formatMetadataValue(cost.procurementStart),
    ],
    ['End of Procurement Activity', formatMetadataValue(cost.procurementEnd)],
    ['Market Scoping Ref', formatMetadataValue(cost.marketScopingRef)],
    [
      'Market Scoping Cost Estimate',
      formatNumberMetadata(cost.marketScopingCostEstimate),
    ],
    ['Expected Delivery', formatMetadataValue(cost.expectedDelivery)],
    ['Remarks', formatMetadataValue(cost.remarks)],
    ['Supporting Documents', formatAttachmentSummary(cost.attachments)],
  ]

  return `
    <tr class="item-metadata-row">
      <td colspan="${columnCount}">
        <div class="item-metadata-grid">
          ${metadata
            .map(
              ([label, value]) => `
                <div class="item-metadata-chip">
                  <span class="item-metadata-label">${escapeHtml(label.toString())}</span>
                  ${renderMetadataValue(value)}
                </div>
              `,
            )
            .join('')}
        </div>
      </td>
    </tr>
  `
}

function buildLineItemTable(activity: PPMPActivityBlock): string {
  const months = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ]

  return activity.ioEBlocks
    .map((block: PPMPIoEBlock) => {
      const itemRows = block.isProcurable
        ? block.items
            .map(
              (item: PPMPLineItem) => `
              <tr>
                <td colspan="1">${escapeHtml(item.itemName)}</td>
                <td>${escapeHtml(item.unitOfMeasure)}</td>
                <td style="text-align: right;">${item.totalQuantity}</td>
                <td style="text-align: right;">${escapeHtml(formatCurrency(item.unitPrice))}</td>
                <td style="text-align: right;">${escapeHtml(formatCurrency(item.estimatedBudget))}</td>
                ${months.map((m) => `<td style="text-align: center; font-size: 10px;">${getMonthlyValue(item.monthlyQuantities, m)}</td>`).join('')}
                <td>${escapeHtml(item.mopOverride || item.suggestedMoP || '—')}</td>
              </tr>
              ${buildLineItemMetadataRow(item, 18)}
            `,
            )
            .join('')
        : (block.costs ?? [])
            .map(
              (cost: NonProcurableCost) => `
              <tr>
                <td colspan="1">${escapeHtml(cost.costItemName)}</td>
                <td>—</td>
                <td style="text-align: right;">1.00</td>
                <td style="text-align: right;">—</td>
                <td style="text-align: right;">${escapeHtml(formatCurrency(cost.totalCost))}</td>
                ${months.map((_m) => `<td style="text-align: center; font-size: 10px;">—</td>`).join('')}
                <td>—</td>
              </tr>
              ${buildNonProcurableCostMetadataRow(cost, 18)}
            `,
            )
            .join('')

      const blockTotal = `
        <tr style="background: #f1f5f9; font-weight: 600;">
          <td colspan="1">${escapeHtml(block.ioEName)} Subtotal</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td style="text-align: right;">${escapeHtml(formatCurrency(block.totalCost))}</td>
          ${months.map((_m) => `<td style="text-align: center;">—</td>`).join('')}
          <td>—</td>
        </tr>
      `
      return `
        <tr style="background: #e0f2fe; font-weight: 700;">
          <td colspan="${7 + months.length}"><strong>${escapeHtml(block.ioEName)}</strong> (${block.isProcurable ? 'Procurable' : 'Non-Procurable'}) · Budget Limit: ${escapeHtml(formatCurrency(block.budgetLimit))}</td>
        </tr>
        ${itemRows}
        ${blockTotal}
      `
    })
    .join('')
}

function buildApprovalSignatureBlock(ppmp: PPMP): string {
  const roleSequence = [
    { role: ApprovalRole.BUDGET_OFFICER, position: 'Budget Officer' },
    { role: ApprovalRole.BAC_SECRETARIAT, position: 'BAC Secretariat' },
    { role: ApprovalRole.HOPE, position: 'HOPE' },
  ]

  const approvalMap = new Map(
    ppmp.approvalHistory.map((event) => [event.role, event]),
  )

  const signatureRows = roleSequence
    .map(({ role, position }) => {
      const event = approvalMap.get(role)
      const statusLabel = event
        ? event.action === 'approved'
          ? `Approved on ${formatDate(event.timestamp)}`
          : `Rejected on ${formatDate(event.timestamp)}`
        : 'Pending'
      const actorName = event?.actorName ?? '___________________'

      return `
        <tr>
          <td style="width: 25%;">
            <strong>${position}</strong>
            <div style="margin-top: 4px; color: #64748b; font-size: 11px;">${statusLabel}</div>
          </td>
          <td style="width: 25%; text-align: center;">
            <div style="min-height: 50px; border-bottom: 1px solid #0f172a; margin-bottom: 4px;"></div>
            <div style="font-size: 10px; color: #475569;">Signature</div>
          </td>
          <td style="width: 25%; text-align: center;">
            <div style="min-height: 50px;"></div>
            <div style="font-size: 10px; color: #475569;">${escapeHtml(actorName)}</div>
          </td>
          <td style="width: 25%; text-align: center;">
            <div style="min-height: 50px;"></div>
            <div style="font-size: 10px; color: #475569;">${event ? formatDate(event.timestamp) : '___________'}</div>
          </td>
        </tr>
      `
    })
    .join('')

  return `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="text-align: left; padding: 10px 8px; border: 1px solid #e2e8f0;">Role</th>
          <th style="text-align: center; padding: 10px 8px; border: 1px solid #e2e8f0;">Signature</th>
          <th style="text-align: center; padding: 10px 8px; border: 1px solid #e2e8f0;">Name</th>
          <th style="text-align: center; padding: 10px 8px; border: 1px solid #e2e8f0;">Date</th>
        </tr>
      </thead>
      <tbody>
        ${signatureRows}
      </tbody>
    </table>
  `
}

export function buildDocumentHtml(ppmp: PPMP, parent: PPMP | null): string {
  const changeRows = collectChangeRows(ppmp, parent)
  const documentDate = formatDate(ppmp.updatedAt)
  const amendmentLabel =
    ppmp.amendmentVersion > 1
      ? `Amendment v${ppmp.amendmentVersion}`
      : 'Original'
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(ppmp.documentName)} - PPMP Report</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #0f172a;
            background: #f8fafc;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.45;
            font-size: 11px;
          }

          .page {
            background: #ffffff;
            padding: 16px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }

          .header h1 {
            margin: 0;
            font-size: 18px;
            letter-spacing: 0.02em;
          }

          .header p {
            margin: 2px 0 0;
            color: #475569;
            font-size: 10px;
          }

          .title-status-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 6px;
            font-size: 10px;
            color: #334155;
          }

          .title-status-option {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .title-status-box {
            width: 12px;
            height: 12px;
            border: 1px solid #334155;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            line-height: 1;
          }

          .title-status-box.checked {
            background: #0f172a;
            color: #ffffff;
          }

          .meta-grid,
          .summary-grid {
            display: grid;
            gap: 8px;
            margin-bottom: 12px;
          }

          .meta-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .summary-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .metric,
          .panel {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #ffffff;
            padding: 8px;
            font-size: 10px;
          }

          .metric-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
          }

          .metric-value {
            margin-top: 4px;
            font-size: 13px;
            font-weight: 700;
          }

          .section-title {
            margin: 8px 0 6px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #334155;
            font-weight: 700;
          }

          .table-card {
            margin-top: 8px;
            overflow: visible;
            page-break-inside: avoid;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          th,
          td {
            border: 1px solid #e2e8f0;
            padding: 6px 4px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f8fafc;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #475569;
            font-weight: 700;
          }

          .pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            border-radius: 999px;
            background: #eff6ff;
            color: #1d4ed8;
            padding: 2px 8px;
            font-size: 10px;
            font-weight: 700;
          }

          .item-metadata-row td {
            background: #f8fafc;
            padding: 6px 8px;
          }

          .item-metadata-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 6px;
          }

          .item-metadata-chip {
            border: 1px solid #dbeafe;
            background: #eff6ff;
            border-radius: 6px;
            padding: 4px 6px;
          }

          .item-metadata-label {
            display: block;
            margin-bottom: 2px;
            color: #64748b;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }

          .metadata-na {
            color: #64748b;
            text-decoration: line-through;
          }

          .muted {
            color: #64748b;
            font-size: 9px;
          }

          .note {
            margin-top: 8px;
            padding: 8px 10px;
            border-radius: 8px;
            background: #f8fafc;
            color: #475569;
            font-size: 9px;
            border-left: 2px solid #64748b;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div>
              <span class="pill">PPMP DETAILED REPORT</span>
              <h1>${escapeHtml(ppmp.documentName)}</h1>
              <div class="title-status-row">
                <span class="title-status-option">
                  <span class="title-status-box${ppmp.isFinal ? ' checked' : ''}">${ppmp.isFinal ? '✓' : ''}</span>
                  <span>Final</span>
                </span>
                <span class="title-status-option">
                  <span class="title-status-box${!ppmp.isFinal ? ' checked' : ''}">X</span>
                  <span>Indicative</span>
                </span>
              </div>
              <p>${escapeHtml(ppmp.ppmpNumber)} · FY ${ppmp.fiscalYear} · ${escapeHtml(humanizeState(ppmp.state))}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>${escapeHtml(amendmentLabel)}</strong></p>
              <p class="muted">Generated ${escapeHtml(documentDate)}</p>
            </div>
          </div>

          <div class="meta-grid">
            <div class="panel">
              <div class="metric-label">Office/LIB</div>
              <div class="metric-value">${escapeHtml(ppmp.libName)}</div>
              <div class="muted">${escapeHtml(ppmp.officeId)}</div>
            </div>
            <div class="panel">
              <div class="metric-label">Document Version</div>
              <div class="metric-value">v${ppmp.amendmentVersion}</div>
              <div class="muted">Created: ${formatDate(ppmp.createdAt)}</div>
            </div>
            <div class="panel">
              <div class="metric-label">Total Budget</div>
              <div class="metric-value">${escapeHtml(formatCurrency(ppmp.totalBudget))}</div>
              <div class="muted">Across ${ppmp.activityBlocks.length} activities</div>
            </div>
          </div>

          ${ppmp.activityBlocks
            .map(
              (activity, _actIdx) => `
              <section style="margin-top: 12px; page-break-inside: avoid;">
                <div style="background: #e0f2fe; padding: 8px; border-radius: 6px; margin-bottom: 6px;">
                  <div style="font-weight: 700; font-size: 11px;">${escapeHtml(activity.activityCode)} · ${escapeHtml(activity.activityName)}</div>
                  <div class="muted">Activity Total: ${escapeHtml(formatCurrency(activity.totalCost))} across ${activity.ioEBlocks.length} Item(s) of Expenditure</div>
                </div>

                <div class="table-card">
                  <table>
                    <thead>
                      <tr>
                        <th style="width: 20%;">Item Description</th>
                        <th style="width: 6%;">Unit</th>
                        <th style="width: 6%;">Qty</th>
                        <th style="width: 8%;">Unit Price</th>
                        <th style="width: 8%;">Est. Budget</th>
                        ${months.map((m) => `<th style="width: 3%; text-align: center;">${m}</th>`).join('')}
                        <th style="width: 6%;">MOP</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${buildLineItemTable(activity)}
                    </tbody>
                  </table>
                </div>
              </section>
            `,
            )
            .join('')}

          <section class="table-card" style="margin-top: 16px; page-break-inside: avoid;">
            <h2 class="section-title">Approval and Signatures</h2>
            ${buildApprovalSignatureBlock(ppmp)}
            <div class="note">
              All three approval roles must sign off before this PPMP can be finalized and submitted.
            </div>
          </section>

          ${
            changeRows.length > 0
              ? `
            <section class="table-card" style="margin-top: 16px; page-break-inside: avoid;">
              <h2 class="section-title">Amendment History</h2>
              <table>
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>What Changed</th>
                    <th>Original Value</th>
                    <th>Amended Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildChangeRows(changeRows)}
                </tbody>
              </table>
            </section>
          `
              : ''
          }
        </div>

        <script>
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.focus();
              window.print();
            }, 250);
          });
        </script>
      </body>
    </html>
  `
}

export function openPpmpDocumentPreview(ppmp: PPMP): boolean {
  const parent = ppmp.parentPpmpId
    ? (mockPpmpDatabase.find((item) => item.id === ppmp.parentPpmpId) ?? null)
    : null

  const previewWindow = window.open('', '_blank', 'width=1200,height=900')
  if (!previewWindow) {
    return false
  }

  previewWindow.document.open()
  previewWindow.document.write(buildDocumentHtml(ppmp, parent))
  previewWindow.document.close()
  previewWindow.focus()

  return true
}
