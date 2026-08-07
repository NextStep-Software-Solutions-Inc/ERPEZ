import type { Activity, ObjectGroup } from '../types/realignment.types'

export const calculateObjectGroupTotal = (group: ObjectGroup): number => {
  return group.descriptionGroups.reduce(
    (sum, dg) =>
      sum +
      dg.items.reduce((itemSum, item) => itemSum + (item.isDeleted ? 0 : item.budget), 0),
    0,
  )
}

export const calculateActivityTotal = (activity: Activity): number => {
  return activity.expenditureTypes.reduce(
    (sum, exp) =>
      sum +
      exp.itemsOfExpenditure.reduce(
        (ioeSum, ioe) =>
          ioeSum +
          ioe.items.reduce(
            (itemSum, item) => itemSum + (item.isDeleted ? 0 : item.total),
            0,
          ),
        0,
      ),
    0,
  )
}

export const exportToCSV = (
  displayedObjectGroups: ObjectGroup[],
  displayedActivities: Activity[],
  selectedFiscalYear: string,
) => {
  const projectRows = displayedObjectGroups.flatMap((group) =>
    group.descriptionGroups.flatMap((dg) =>
      dg.items.map((item) => ({
        Type: 'Project',
        'Object of Expenditure': group.name,
        'Object Code': group.code,
        'Group Description': dg.description,
        'Item Description': item.description,
        Quantity: item.qty,
        'Unit Cost': item.unitCost,
        'Total Budget': item.budget,
        'Timeline Type': item.timelineType,
        'Start Date': item.startDate,
        'End Date': item.endDate,
        Activity: '',
        'Expenditure Class': '',
        'Item Name': '',
        Description: '',
        Q1: 0,
        Q2: 0,
        Q3: 0,
        Q4: 0,
        Total: 0,
      })),
    ),
  )

  const activityRows = displayedActivities.flatMap((act) =>
    act.expenditureTypes.flatMap((exp) =>
      exp.itemsOfExpenditure.flatMap((ioe) =>
        ioe.items.map((item) => ({
          Type: 'Activity',
          'Object of Expenditure': '',
          'Object Code': '',
          'Group Description': '',
          'Item Description': '',
          Quantity: 0,
          'Unit Cost': 0,
          'Total Budget': 0,
          'Timeline Type': '',
          'Start Date': '',
          'End Date': '',
          Activity: act.name,
          'Expenditure Class': exp.name,
          'Item Name': ioe.name,
          Description: item.description,
          Q1: item.q1,
          Q2: item.q2,
          Q3: item.q3,
          Q4: item.q4,
          Total: item.total,
        })),
      ),
    ),
  )

  const combined = [...projectRows, ...activityRows]
  if (combined.length === 0) return

  const headers = [
    'Type',
    'Object of Expenditure',
    'Object Code',
    'Group Description',
    'Item Description',
    'Quantity',
    'Unit Cost',
    'Total Budget',
    'Timeline Type',
    'Start Date',
    'End Date',
    'Activity',
    'Expenditure Class',
    'Item Name',
    'Description',
    'Q1',
    'Q2',
    'Q3',
    'Q4',
    'Total',
  ]

  const csvContent = [
    headers.join(','),
    ...combined.map((row) =>
      headers.map((h) => `"${row[h as keyof typeof row] ?? ''}"`).join(','),
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Realignment-${selectedFiscalYear}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

export const exportToExcel = (
  displayedObjectGroups: ObjectGroup[],
  displayedActivities: Activity[],
  selectedSource: 'all' | 'activity' | 'opcr' | 'project',
  selectedFiscalYear: string,
) => {
  let xlsContent = ''
  if (selectedSource === 'project') {
    const data = displayedObjectGroups.map((group) => ({
      'Object Group': group.name,
      Code: group.code,
      'Total Budget': calculateObjectGroupTotal(group),
      Groups: group.descriptionGroups.length,
    }))
    if (data.length === 0) return
    const headers = Object.keys(data[0])
    xlsContent = [
      headers.join('\t'),
      ...data.map((row) =>
        headers.map((header) => row[header as keyof typeof row]).join('\t'),
      ),
    ].join('\n')
  } else {
    const data = displayedActivities.map((activity) => ({
      Activity: activity.name,
      'Total Budget': calculateActivityTotal(activity),
      'Expenditure Types': activity.expenditureTypes.length,
    }))
    if (data.length === 0) return
    const headers = Object.keys(data[0])
    xlsContent = [
      headers.join('\t'),
      ...data.map((row) =>
        headers.map((header) => row[header as keyof typeof row]).join('\t'),
      ),
    ].join('\n')
  }

  const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Realignment-${selectedSource}-${selectedFiscalYear}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}

export const exportToPDF = (
  selectedSource: 'all' | 'activity' | 'opcr' | 'project',
  selectedFiscalYear: string,
  viewingVersion: number | null,
  projectVersionsList: any[],
  versions: any[],
  projectGroups: ObjectGroup[],
  activities: Activity[],
) => {
  const currentVersionNum =
    viewingVersion ||
    (selectedSource === 'project'
      ? projectVersionsList[projectVersionsList.length - 1]?.version
      : versions[versions.length - 1]?.version) ||
    1

  const formatCurrency = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const renderHeader = (pageNo: number) => `
    <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 15px;">
      <tr style="border: none;">
        <td style="border: none; padding: 0; vertical-align: middle; display: flex; align-items: center;">
          <svg width="45" height="45" viewBox="0 0 100 100" style="margin-right: 12px;">
            <circle cx="50" cy="40" r="30" stroke="#1d4ed8" stroke-width="2" fill="none" stroke-dasharray="2,2"/>
            <ellipse cx="50" cy="40" rx="30" ry="10" stroke="#1d4ed8" stroke-width="2" fill="none" stroke-dasharray="3,1"/>
            <ellipse cx="50" cy="40" rx="10" ry="30" stroke="#1d4ed8" stroke-width="2" fill="none" stroke-dasharray="3,1"/>
            <path d="M20,40 L80,40" stroke="#1d4ed8" stroke-width="2" stroke-dasharray="2,2"/>
            <path d="M50,10 L50,70" stroke="#1d4ed8" stroke-width="2" stroke-dasharray="2,2"/>
            <text x="50" y="90" font-family="'Arial Black', Impact, sans-serif" font-size="24" font-weight="900" fill="#eab308" stroke="#ca8a04" stroke-width="1" text-anchor="middle">USTP</text>
          </svg>
          <div style="font-family: Arial, sans-serif; color: #000; font-size: 11px; font-weight: bold; line-height: 1.3; letter-spacing: 0.5px;">
            UNIVERSITY OF SCIENCE AND TECHNOLOGY<br/>OF SOUTHERN PHILIPPINES
          </div>
        </td>
        <td style="border: none; padding: 0; text-align: right; vertical-align: middle; width: 200px;">
          <table style="width: 200px; border-collapse: collapse; font-size: 8px; font-family: Arial, sans-serif; border: 1.5px solid #002060; margin-left: auto;">
            <tr>
              <td colspan="3" style="background-color: #002060; color: white; text-align: center; font-weight: bold; padding: 2px; border: 1px solid #002060; font-size: 8px;">Document Code No.</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: center; font-weight: bold; padding: 3px; font-size: 9px; border: 1px solid #002060; background-color: #fff;">FM-USTP-FDP-002</td>
            </tr>
            <tr style="background-color: #002060; color: white; text-align: center; font-weight: bold; font-size: 7px;">
              <td style="width: 33%; border: 1px solid #002060; padding: 1px;">Rev. No.</td>
              <td style="width: 34%; border: 1px solid #002060; padding: 1px;">Effective Date</td>
              <td style="width: 33%; border: 1px solid #002060; padding: 1px;">Page No.</td>
            </tr>
            <tr style="text-align: center; font-size: 8px; background-color: #fff;">
              <td style="border: 1px solid #002060; padding: 2px; font-weight: bold;">00</td>
              <td style="border: 1px solid #002060; padding: 2px; font-weight: bold;">04.01.22</td>
              <td style="border: 1px solid #002060; padding: 2px; font-weight: bold;">${pageNo} of 2</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `

  let reasonText = ''
  if (selectedSource === 'project') {
    const ver = projectVersionsList.find((v) => v.version === currentVersionNum)
    reasonText = ver?.reason || ''
  } else {
    const ver = versions.find((v) => v.version === currentVersionNum)
    reasonText = ver?.reason || ''
  }
  if (!reasonText) {
    reasonText = 'Booth Rental for the National Innovation Day 2024- NorMinRIPE- May 24, 2024'
  }

  const approvedProjectVersion =
    projectVersionsList.find((v) => v.approved) || projectVersionsList[0]
  const approvedProjectGroups: ObjectGroup[] = approvedProjectVersion?.objectGroups || []

  const currentProjectVersionData = projectVersionsList.find(
    (v) => v.version === currentVersionNum,
  )
  const proposedProjectGroups: ObjectGroup[] = currentProjectVersionData?.objectGroups || projectGroups

  const renderProjectTable = (groups: ObjectGroup[]) => {
    if (groups.length === 0) {
      return '<tr><td colspan="7" style="text-align: center; padding: 10px;">No project items found.</td></tr>'
    }
    return groups
      .map((group) =>
        group.descriptionGroups
          .map((dg) =>
            dg.items
              .map(
                (item) => `
          <tr>
            <td style="padding: 4px; font-size: 8px;">${group.name} (${group.code})</td>
            <td style="padding: 4px; font-size: 8px;">${dg.description}</td>
            <td style="padding: 4px; font-size: 8px;">${item.description}</td>
            <td class="text-right" style="padding: 4px; font-size: 8px;">${item.qty}</td>
            <td class="text-right" style="padding: 4px; font-size: 8px;">${formatCurrency(item.unitCost)}</td>
            <td class="text-right" style="padding: 4px; font-size: 8px; font-weight: bold;">${formatCurrency(item.budget)}</td>
            <td class="text-center" style="padding: 4px; font-size: 8px;">${item.timelineType}</td>
          </tr>
        `,
              )
              .join(''),
          )
          .join(''),
      )
      .join('')
  }

  const calculateProjectGroupsTotal = (groups: ObjectGroup[]) => {
    return groups.reduce((sum, g) => sum + calculateObjectGroupTotal(g), 0)
  }

  const approvedActivitiesVersion = versions.find((v) => v.approved) || versions[0]
  const approvedActivities: Activity[] = approvedActivitiesVersion?.activities || []

  const currentActivitiesVersionData = versions.find((v) => v.version === currentVersionNum)
  const proposedActivities: Activity[] = currentActivitiesVersionData?.activities || activities

  const calculateActivityColumnTotals = (activity: Activity) => {
    let q1Sum = 0, q2Sum = 0, q3Sum = 0, q4Sum = 0, totalSum = 0
    activity.expenditureTypes.forEach((exp) => {
      exp.itemsOfExpenditure.forEach((ioe) => {
        ioe.items.forEach((item) => {
          if (!item.isDeleted) {
            q1Sum += item.q1 || 0
            q2Sum += item.q2 || 0
            q3Sum += item.q3 || 0
            q4Sum += item.q4 || 0
            totalSum += item.total || 0
          }
        })
      })
    })
    return { q1Sum, q2Sum, q3Sum, q4Sum, totalSum }
  }

  const calculateColumnTotals = (activitiesList: Activity[]) => {
    let q1Sum = 0, q2Sum = 0, q3Sum = 0, q4Sum = 0, totalSum = 0
    activitiesList.forEach((act) => {
      const totals = calculateActivityColumnTotals(act)
      q1Sum += totals.q1Sum
      q2Sum += totals.q2Sum
      q3Sum += totals.q3Sum
      q4Sum += totals.q4Sum
      totalSum += totals.totalSum
    })
    return { q1Sum, q2Sum, q3Sum, q4Sum, totalSum }
  }

  const renderActivityTable = (activitiesList: Activity[]) => {
    if (activitiesList.length === 0) {
      return '<tr><td colspan="6" style="text-align: center; padding: 10px;">No operational activities found.</td></tr>'
    }

    return activitiesList
      .map((activity) => {
        const actTotals = calculateActivityColumnTotals(activity)
        const itemRows = activity.expenditureTypes
          .flatMap((exp) =>
            exp.itemsOfExpenditure.map((ioe) => {
              const item = ioe.items[0]
              return `
            <tr>
              <td style="padding: 4px 6px; font-size: 8.5px; font-weight: 500;">${ioe.name}</td>
              <td class="text-right" style="padding: 4px 6px; font-size: 8.5px;">${formatCurrency(item?.q1 || 0)}</td>
              <td class="text-right" style="padding: 4px 6px; font-size: 8.5px;">${formatCurrency(item?.q2 || 0)}</td>
              <td class="text-right" style="padding: 4px 6px; font-size: 8.5px;">${formatCurrency(item?.q3 || 0)}</td>
              <td class="text-right" style="padding: 4px 6px; font-size: 8.5px;">${formatCurrency(item?.q4 || 0)}</td>
              <td class="text-right" style="padding: 4px 6px; font-size: 8.5px; font-weight: 500;">${formatCurrency(item?.total || 0)}</td>
            </tr>
          `
            }),
          )
          .join('')

        return `
        <tr>
          <td colspan="6" style="background-color: #ffffff; font-weight: bold; padding: 6px; font-size: 9px; border-bottom: 1px solid #333;">${activity.name}</td>
        </tr>
        ${itemRows}
        <tr style="font-weight: bold; background-color: #ffffff;">
          <td style="text-align: right; padding-right: 15px; font-size: 8.5px;">Sub-total</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.q1Sum)}</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.q2Sum)}</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.q3Sum)}</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.q4Sum)}</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.totalSum)}</td>
        </tr>
      `
      })
      .join('')
  }

  const modifiedProjectGroups = proposedProjectGroups.filter((propGroup) => {
    const appGroup = approvedProjectGroups.find((g) => g.id === propGroup.id)
    if (!appGroup) return true
    if (calculateObjectGroupTotal(propGroup) !== calculateObjectGroupTotal(appGroup)) return true
    return false
  })

  const modifiedActivities = proposedActivities.filter((propAct) => {
    const appAct = approvedActivities.find((a) => a.id === propAct.id)
    if (!appAct) return true
    if (calculateActivityTotal(propAct) !== calculateActivityTotal(appAct)) return true
    return false
  })

  const part2Totals = calculateColumnTotals(approvedActivities)

  const renderPart3Activities = () => {
    if (modifiedActivities.length === 0) {
      return '<tr><td colspan="6" style="text-align: center; padding: 10px; font-style: italic;">No proposed modifications found.</td></tr>'
    }
    return modifiedActivities
      .map((activity) => {
        const actTotals = calculateActivityColumnTotals(activity)
        return `
        <tr>
          <td colspan="6" style="background-color: #ffffff; font-weight: bold; padding: 6px; font-size: 9px; border-bottom: 1px solid #333;">Activity: ${activity.name}</td>
        </tr>
        ${activity.expenditureTypes
          .flatMap((exp) =>
            exp.itemsOfExpenditure.map((ioe) => {
              const item = ioe.items[0]
              return `
              <tr>
                <td style="padding: 4px 6px; font-size: 8.5px; font-weight: 500;">${ioe.name}</td>
                <td class="text-right" style="padding: 4px 6px; font-size: 8.5px;">${formatCurrency(item?.q1 || 0)}</td>
                <td class="text-right" style="padding: 4px 6px; font-size: 8.5px;">${formatCurrency(item?.q2 || 0)}</td>
                <td class="text-right" style="padding: 4px 6px; font-size: 8.5px;">${formatCurrency(item?.q3 || 0)}</td>
                <td class="text-right" style="padding: 4px 6px; font-size: 8.5px;">${formatCurrency(item?.q4 || 0)}</td>
                <td class="text-right" style="padding: 4px 6px; font-size: 8.5px; font-weight: 500;">${formatCurrency(item?.total || 0)}</td>
              </tr>
            `
            }),
          )
          .join('')}
        <tr style="font-weight: bold; background-color: #ffffff;">
          <td style="text-align: right; padding-right: 15px; font-size: 8.5px;">TOTAL</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.q1Sum)}</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.q2Sum)}</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.q3Sum)}</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.q4Sum)}</td>
          <td class="text-right" style="font-size: 8.5px;">${formatCurrency(actTotals.totalSum)}</td>
        </tr>
      `
      })
      .join('')
  }

  const renderPart3Projects = () => {
    if (modifiedProjectGroups.length === 0) {
      return '<tr><td colspan="7" style="text-align: center; padding: 10px; font-style: italic;">No proposed modifications found.</td></tr>'
    }
    return modifiedProjectGroups
      .map((group) => {
        return `
        <tr>
          <td colspan="7" style="background-color: #ffffff; font-weight: bold; padding: 6px; font-size: 9px; border-bottom: 1px solid #333;">Object Group: ${group.name} (${group.code})</td>
        </tr>
        ${group.descriptionGroups
          .flatMap((dg) =>
            dg.items.map(
              (item) => `
            <tr>
              <td style="padding: 4px; font-size: 8px;">${group.name}</td>
              <td style="padding: 4px; font-size: 8px;">${dg.description}</td>
              <td style="padding: 4px; font-size: 8px;">${item.description}</td>
              <td class="text-right" style="padding: 4px; font-size: 8px;">${item.qty}</td>
              <td class="text-right" style="padding: 4px; font-size: 8px;">${formatCurrency(item.unitCost)}</td>
              <td class="text-right" style="padding: 4px; font-size: 8px; font-weight: bold;">${formatCurrency(item.budget)}</td>
              <td class="text-center" style="padding: 4px; font-size: 8px;">${item.timelineType}</td>
            </tr>
          `,
            ),
          )
          .join('')}
        <tr style="font-weight: bold; background-color: #ffffff;">
          <td colspan="5" style="text-align: right; padding-right: 15px; font-size: 8px;">TOTAL</td>
          <td class="text-right" style="font-size: 8px;">${formatCurrency(calculateObjectGroupTotal(group))}</td>
          <td></td>
        </tr>
      `
      })
      .join('')
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Modification of Budget - USTP</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #000;
          line-height: 1.3;
          margin: 0;
          padding: 0;
          font-size: 9px;
        }
        .page {
          box-sizing: border-box;
          padding: 10px 0;
        }
        .title-area {
          text-align: center;
          margin-bottom: 12px;
        }
        .title-area h2 {
          margin: 0;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
        .title-area p {
          margin: 2px 0 0 0;
          font-size: 10px;
          font-weight: bold;
        }
        .office-info {
          font-size: 10px;
          margin-bottom: 12px;
        }
        .part-title {
          font-weight: bold;
          font-size: 10px;
          margin-bottom: 8px;
          text-transform: none;
        }
        .checkbox-container {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .checkbox-box {
          width: 25px;
          height: 18px;
          border: 1.5px solid #000;
          margin-right: 12px;
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .checkbox-box.checked {
          background-color: #000;
        }
        .checkbox-line {
          border-bottom: 1px solid #888;
          padding: 1px 0;
          font-style: italic;
          min-height: 16px;
          font-weight: 500;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0 15px 0;
          font-size: 8.5px;
        }
        th, td {
          border: 1px solid #000;
          padding: 5px 6px;
          text-align: left;
          vertical-align: middle;
        }
        th {
          background-color: #ffffff;
          font-weight: bold;
          text-align: center;
        }
        td.text-right {
          text-align: right;
          font-family: 'Courier New', monospace;
          font-weight: bold;
        }
        td.text-center {
          text-align: center;
        }
        .signatures-table {
          width: 100%;
          border-collapse: collapse;
          border: none;
          margin-top: 30px;
          font-size: 9px;
        }
        .signatures-table td {
          border: none;
          padding: 0 0 35px 0;
          vertical-align: top;
        }
        .signature-box {
          text-align: center;
          margin-top: 25px;
        }
        .signature-name {
          font-weight: bold;
          text-decoration: underline;
          font-size: 10px;
        }
        .signature-title {
          font-size: 9px;
          display: block;
          margin-top: 2px;
        }
        @media print {
          .page-break {
            page-break-before: always;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <!-- ================= PAGE 1 ================= -->
      <div class="page">
        ${renderHeader(1)}
        
        <div class="title-area">
          <h2>MODIFICATION OF BUDGET</h2>
          <p>FY ${selectedFiscalYear} BUDGET</p>
        </div>

        <div class="office-info">
          Delivery Unit/Office/: <strong>Innovation and Technology Solutions Division</strong>
        </div>

        <div style="margin-bottom: 15px;">
          <div class="part-title"><strong>Part 1.</strong> Reason for Modification of Budget (choose one and briefly explain the circumstances in the space provided)</div>
          
          <div class="checkbox-container">
            <div class="checkbox-box checked"></div>
            <div style="flex-grow: 1;">
              <div>Unforeseen modification or adjustments in the Activity/Program/Initiative (API):</div>
              <div class="checkbox-line">${reasonText}</div>
            </div>
          </div>

          <div class="checkbox-container">
            <div class="checkbox-box"></div>
            <div style="flex-grow: 1;">
              <div>Re-assessment in the use. Prioritization and/or distribution of resources:</div>
              <div class="checkbox-line">&nbsp;</div>
            </div>
          </div>

          <div class="checkbox-container">
            <div class="checkbox-box"></div>
            <div style="flex-grow: 1;">
              <div>Additional requirements for an API in view of a declaration of a state of calamity:</div>
              <div class="checkbox-line">&nbsp;</div>
            </div>
          </div>
        </div>

        <div>
          <div class="part-title"><strong>Part 2.</strong> Approved Line-Item Budget to be Modified</div>
          <div style="font-size: 8.5px; margin-bottom: 4px;">Goal: Performance of Office Mandate</div>
          <div style="font-size: 8.5px; margin-bottom: 8px;">PREXC: NEP: General Administration and Support (GAS) - General Management & Supervision</div>
          
          <table>
            <thead>
              ${
                selectedSource === 'project'
                  ? `
                <tr>
                  <th>Object of Expenditure</th>
                  <th>Group</th>
                  <th>Item Description</th>
                  <th style="width: 8%;">Qty</th>
                  <th style="width: 12%;">Unit Cost</th>
                  <th style="width: 15%;">Budget</th>
                  <th style="width: 10%;">Timeline</th>
                </tr>
              `
                  : `
                <tr>
                  <th style="width: 40%;">Item of Expenditures</th>
                  <th style="width: 12%;">Q1</th>
                  <th style="width: 12%;">Q2</th>
                  <th style="width: 12%;">Q3</th>
                  <th style="width: 12%;">Q4</th>
                  <th style="width: 12%;">Total</th>
                </tr>
              `
              }
            </thead>
            <tbody>
              ${
                selectedSource === 'project'
                  ? renderProjectTable(approvedProjectGroups)
                  : renderActivityTable(approvedActivities)
              }
              
              ${
                selectedSource === 'project'
                  ? `
                <tr style="font-weight: bold; background-color: #ffffff;">
                  <td colspan="5" style="text-align: right; padding-right: 15px; font-size: 8.5px;">TOTAL</td>
                  <td class="text-right" style="font-size: 8.5px;">${formatCurrency(calculateProjectGroupsTotal(approvedProjectGroups))}</td>
                  <td></td>
                </tr>
              `
                  : `
                <tr style="font-weight: bold; background-color: #ffffff;">
                  <td style="text-align: right; padding-right: 15px; font-size: 8.5px;">TOTAL</td>
                  <td class="text-right" style="font-size: 8.5px;">${formatCurrency(part2Totals.q1Sum)}</td>
                  <td class="text-right" style="font-size: 8.5px;">${formatCurrency(part2Totals.q2Sum)}</td>
                  <td class="text-right" style="font-size: 8.5px;">${formatCurrency(part2Totals.q3Sum)}</td>
                  <td class="text-right" style="font-size: 8.5px;">${formatCurrency(part2Totals.q4Sum)}</td>
                  <td class="text-right" style="font-size: 8.5px;">${formatCurrency(part2Totals.totalSum)}</td>
                </tr>
              `
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= PAGE 2 ================= -->
      <div class="page page-break">
        ${renderHeader(2)}
        
        <div style="margin-top: 10px;">
          <div class="part-title"><strong>Part 3.</strong> Proposed Modification</div>
          <div style="font-size: 8.5px; margin-bottom: 4px;">Goal: Performance of Office Mandate</div>
          <div style="font-size: 8.5px; margin-bottom: 8px;">PREXC: NEP: General Administration and Support (GAS) - General Management & Supervision</div>
          
          <table>
            <thead>
              ${
                selectedSource === 'project'
                  ? `
                <tr>
                  <th>Object of Expenditure</th>
                  <th>Group</th>
                  <th>Item Description</th>
                  <th style="width: 8%;">Qty</th>
                  <th style="width: 12%;">Unit Cost</th>
                  <th style="width: 15%;">Budget</th>
                  <th style="width: 10%;">Timeline</th>
                </tr>
              `
                  : `
                <tr>
                  <th style="width: 40%;">Item of Expenditures</th>
                  <th style="width: 12%;">Q1</th>
                  <th style="width: 12%;">Q2</th>
                  <th style="width: 12%;">Q3</th>
                  <th style="width: 12%;">Q4</th>
                  <th style="width: 12%;">Total</th>
                </tr>
              `
              }
            </thead>
            <tbody>
              ${
                selectedSource === 'project'
                  ? renderPart3Projects()
                  : renderPart3Activities()
              }
            </tbody>
          </table>
        </div>

        <!-- Signatures Section -->
        <table class="signatures-table">
          <tr>
            <td style="width: 50%;">
              <div>[1] Submitted by:</div>
              <div class="signature-box">
                <span class="signature-name">ENGR. ALEX L. MAUREAL</span>
                <span class="signature-title">Director, ITSD</span>
              </div>
            </td>
            <td style="width: 50%;">
              <div>[2] Certified as to availability of budget:</div>
              <div class="signature-box">
                <span class="signature-name">CHERRY ANN S. VILLARTE, CPA</span>
                <span class="signature-title">Director, Financial Management Services</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="width: 50%;">
              <div>[3] RECOMMENDING APPROVAL:</div>
              <div class="signature-box">
                <span class="signature-name">ATTY. DIONEL O. ALBINA</span>
                <span class="signature-title">Chancellor, USTP-CDO</span>
              </div>
            </td>
            <td style="width: 50%;">
              <div>[4] APPROVED:</div>
              <div class="signature-box">
                <span class="signature-name">DR. AMBROSIO B. CULTURA II</span>
                <span class="signature-title">President</span>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}
