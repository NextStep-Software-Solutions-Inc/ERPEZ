import { format } from 'date-fns'
import type { BiddingMasterCalendarDayBucket } from '../types'
import { escapeHtml } from './exportSanitizers'

interface ExportCalendarMonthPrintOptions {
  currentMonth: Date
  dayBuckets: BiddingMasterCalendarDayBucket[]
}

export function buildCalendarMonthPrintHtml({
  currentMonth,
  dayBuckets,
}: ExportCalendarMonthPrintOptions) {
  const body = dayBuckets
    .map(
      (bucket) => `
        <section style="margin-bottom:16px;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
          <h3 style="margin:0 0 8px 0;font-size:16px;">${escapeHtml(bucket.date)}</h3>
          <div style="font-size:12px;color:#475569;margin-bottom:8px;">
            Conflicts: ${bucket.hardConflictCount} • Events: ${bucket.events.length} • Overloaded: ${bucket.isOverloaded ? 'Yes' : 'No'}
          </div>
          <ul style="margin:0;padding-left:18px;font-size:12px;">
            ${bucket.events
              .map(
                (event) =>
                  `<li>${escapeHtml(event.milestoneName)} - ${escapeHtml(event.primaryProjectName)} (${escapeHtml(event.bacResolutionNumber)})</li>`,
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
        <title>Master BAC Calendar - ${format(currentMonth, 'MMMM yyyy')}</title>
      </head>
      <body style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111827;">
        <h1 style="margin:0 0 6px 0;">Master BAC Calendar</h1>
        <p style="margin:0 0 16px 0;color:#475569;">Month snapshot for ${format(currentMonth, 'MMMM yyyy')}</p>
        ${body}
      </body>
    </html>
  `
}

export function exportCalendarMonthPrint({
  currentMonth,
  dayBuckets,
}: ExportCalendarMonthPrintOptions) {
  const printWindow = window.open('', '_blank', 'width=1400,height=900')

  if (!printWindow) {
    return
  }

  printWindow.document.write(
    buildCalendarMonthPrintHtml({ currentMonth, dayBuckets }),
  )

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
