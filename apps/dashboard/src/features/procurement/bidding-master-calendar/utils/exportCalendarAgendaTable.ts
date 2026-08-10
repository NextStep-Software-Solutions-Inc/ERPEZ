import type { BiddingMasterCalendarAgendaGroup } from '../types'
import { toSafeSpreadsheetCell } from './exportSanitizers'

export function buildCalendarAgendaTableHtml(
  agendaGroups: BiddingMasterCalendarAgendaGroup[],
) {
  const rows = agendaGroups.flatMap((group) =>
    group.bucket.events.map((event) => [
      group.date,
      event.milestoneName,
      event.primaryProjectName,
      event.bacResolutionNumber,
      event.officeLabel,
      event.procurementCategory,
      event.eventTime ?? '',
      event.derivedProjectStatus,
      event.appTargetMonth ?? '',
    ]),
  )

  return `
    <table>
      <tr>
        <th>Date</th>
        <th>Milestone</th>
        <th>Project</th>
        <th>BAC Resolution</th>
        <th>Office</th>
        <th>Category</th>
        <th>Time</th>
        <th>Status</th>
        <th>APP Target Month</th>
      </tr>
      ${rows
        .map(
          (columns) =>
            `<tr>${columns.map((value) => `<td>${toSafeSpreadsheetCell(String(value))}</td>`).join('')}</tr>`,
        )
        .join('')}
    </table>
  `
}

export function exportCalendarAgendaTable(
  agendaGroups: BiddingMasterCalendarAgendaGroup[],
) {
  const html = buildCalendarAgendaTableHtml(agendaGroups)

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'master-bac-calendar-agenda.xls'
  link.click()
  window.URL.revokeObjectURL(url)
}
