import { format } from 'date-fns'
import type { BiddingMasterCalendarAgendaGroup } from '../types'
import { escapeHtml } from './exportSanitizers'

export function buildCalendarAgendaPrintHtml(
  agendaGroups: BiddingMasterCalendarAgendaGroup[],
) {
  const body = agendaGroups
    .map(
      (group) => `
        <section style="margin-bottom:16px;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
          <h2 style="margin:0 0 8px 0;font-size:16px;">${escapeHtml(group.label)}</h2>
          <div style="font-size:12px;color:#475569;margin-bottom:8px;">
            Conflicts: ${group.bucket.hardConflictCount} • Events: ${group.bucket.events.length} • Overloaded: ${group.bucket.isOverloaded ? 'Yes' : 'No'}
          </div>
          <ul style="margin:0;padding-left:18px;font-size:12px;">
            ${group.bucket.events
              .map(
                (event) => `
                  <li>
                    ${escapeHtml(event.milestoneName)} - ${escapeHtml(event.primaryProjectName)} (${escapeHtml(event.bacResolutionNumber)})
                    ${event.eventTime ? ` • ${escapeHtml(event.eventTime)}` : ''}
                    • ${escapeHtml(event.officeLabel)}
                    • ${escapeHtml(event.derivedProjectStatus)}
                  </li>
                `,
              )
              .join('')}
          </ul>
        </section>
      `,
    )
    .join('')

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Master BAC Calendar - Agenda Snapshot</title>
      </head>
      <body style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111827;">
        <h1 style="margin:0 0 6px 0;">Master BAC Calendar</h1>
        <p style="margin:0 0 16px 0;color:#475569;">Agenda snapshot generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
        ${body}
      </body>
    </html>
  `
}

export function exportCalendarAgendaPrint(
  agendaGroups: BiddingMasterCalendarAgendaGroup[],
) {
  const printWindow = window.open('', '_blank', 'width=1400,height=900')

  if (!printWindow) {
    return
  }

  printWindow.document.write(buildCalendarAgendaPrintHtml(agendaGroups))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
