# LIB Generation Guide

## Overview

LIB generation is initiated by the API endpoint:

- POST /api/planning/documents/lib/{libId}/generate?format=Pdf|Excel

The generation pipeline is:

1. Controller parses format by enum name and creates command.
2. Command handler loads LIB aggregate and maps it into LibDataDto.
3. DocumentRendererService chooses renderer by DocumentType + ExportFormat.
4. Renderer creates file bytes (PDF or Excel).
5. GeneratedDocument record is persisted.

## Variants

The system currently distinguishes variants through LineItemBudget.Scope:

- Activity Level: Scope == ActivityLevel
- Project Level: any non-ActivityLevel scope uses legacy rendering path
- Amendment: currently routed through the same non-ActivityLevel legacy rendering path

Important: there is no separate amendment-only renderer class in the current implementation. Amendment output therefore shares the legacy branch unless a dedicated branch is implemented in the future.

## Data Loading and Source Tables

The command handler uses ILineItemBudgetRepository.GetByIdWithDetailsAsync which hydrates:

- LineItemBudget
- FiscalYearEntity
- FundCluster (FundSource)
- Office
- DeliveryUnit
- LineItemBudgetActivities
- LineItemBudgetActivity.OPCRActivity.OPCRItem.KPIAssignment.FYActiveKPI.MFOPAP
- LineItemBudgetActivity.WFPObjectiveActivity.WFPObjective.WFP
- LineItemBudgetActivity.LineItemBudgetDetails.Object.ObjectExpenseClasses.ExpenseClass
- LineItemBudget.LineItemBudgetDetails.Object.ObjectExpenseClasses.ExpenseClass

### Core Header Fields

- LIB number: LineItemBudget.LIBNumber
- Fiscal year label: LineItemBudget.FiscalYearEntity.Year
- Agency label: LineItemBudget.Office.Name
- Fund source label: LineItemBudget.FundCluster.Name
- Scope discriminator: LineItemBudget.Scope
- Source discriminator: LineItemBudget.SourceType
- Report total: LineItemBudget.TotalAmount (fallback sum of LineItemBudgetDetail.Budget)

## Activity Level Mapping (Section-by-Section)

### Section I: Line Item Budget by API

Per activity group (LineItemBudgetActivity):

- API label: LineItemBudgetActivity.Name
- NEP/GAA label: static text "NEP/GAA"
- PREXC/DYNAMIC/KRA: preference order
  - OPCRActivity.OPCRItem.KPIAssignment.FYActiveKPI.MFOPAP.Name
  - OPCRActivity.OPCRItem.KPIAssignment.FYActiveKPI.Name
  - WFPObjectiveActivity.WFPObjective.Description
  - LineItemBudgetActivity.Name
- GOALS/OUTCOME: preference order
  - OPCRActivity.Description
  - WFPObjectiveActivity.WFPObjective.Outcome

Rows are grouped by expense class and object:

- Expense class name/type:
  - LineItemBudgetDetail.Object.ObjectExpenseClasses[].ExpenseClass.Name
  - LineItemBudgetDetail.Object.ObjectExpenseClasses[].ExpenseClass.Type
- UACS code: LineItemBudgetDetail.Object.Code
- Item name: LineItemBudgetDetail.Object.Name
- Amount source: LineItemBudgetDetail.Budget
- Quarter distribution:
  - If StartDate exists, quarter is derived from StartDate.Month
  - If StartDate is null and TimelineType is Quarterly or Monthly, amount is split equally by quarter
  - Else fallback puts amount in Q1

### Section II: Line Item Budget by Target

Per activity group:

- NEP/GAA, PREXC/DYNAMIC/KRA, GOALS/OUTCOME from same mapping as Section I
- KPI label: preference order
  - OPCRActivity.OPCRItem.KPIAssignment.FYActiveKPI.Name
  - WFPObjectiveActivity.Indicator
  - LineItemBudgetActivity.Name
- Targets list (deduplicated):
  - OPCRActivity.Name
  - WFPObjectiveActivity.Indicator
  - WFPObjectiveActivity.ActivityName

Monthly row amounts use LineItemBudgetDetail.Budget with rules:

- If StartDate exists, amount goes to StartDate.Month
- If StartDate is null and TimelineType == Quarterly, amount is split into Jan/Apr/Jul/Oct
- If StartDate is null and TimelineType == Monthly, amount is spread across 12 months
- Else fallback puts amount in January

### Section III: Summary by Account Group and by Quarter

Grouped by expense class type and object name:

- Allotment class: ExpenseClass.Type
- Account group row: LineItemBudgetDetail.Object.Name
- Quarter totals from same quarter logic used in Section I

### Section IV: Summary by Quarter

Aggregates Section III rows by allotment class (expense class type):

- Q1/Q2/Q3/Q4 totals
- Total per allotment class

### Section V: Summary by Fund Source

Uses single selected fund source from LineItemBudget.FundCluster.Name and account-group totals:

- Allotment class: ExpenseClass.Type
- Account group: LineItemBudgetDetail.Object.Name
- Amount: summed row total

## Project Level and Amendment Behavior

Project Level and Amendment generation are currently rendered by the legacy LIB paths in:

- LibPdfRenderer legacy branch
- LibExcelRenderer legacy branch

These branches are selected when Scope != ActivityLevel.

## Format Selection (Post-Refactor)

Controller parsing now accepts enum names only:

- Pdf
- Excel

Numeric values (0/1) are intentionally rejected with a 400 response.

The parsed value is still stored in GeneratedDocument.Format as ExportFormat.

## Status Visibility

Indicative/Final is retained in domain data (LineItemBudget.Status) but removed from report payload and templates:

- LibDataDto no longer contains IsFinal
- LIB PDF renderer does not print indicative/final checkboxes
- LIB Excel renderer does not print indicative/final labels

This exclusion is at generation-layer data mapping and template rendering, not only UI-level hiding.

## Files Involved

- API controller: ERPEZ/ERPEZ.Api/Controllers/GeneratedDocumentsController.cs
- Command: ERPEZ/ERPEZ.Application/Features/Planning/Document/Commands/GenerateLIB/GenerateLibDocumentCommand.cs
- Validator: ERPEZ/ERPEZ.Application/Features/Planning/Document/Commands/GenerateLIB/GenerateLibDocumentCommandValidator.cs
- Handler/mapping: ERPEZ/ERPEZ.Application/Features/Planning/Document/Commands/GenerateLIB/GenerateLibDocumentCommandHandler.cs
- DTOs: ERPEZ/ERPEZ.Application/Common/Dtos/LibDataDto.cs
- Repository load graph: ERPEZ/ERPEZ.Infrastructure/Persistence/Repositories/LineItemBudgetRepository.cs
- PDF renderer: ERPEZ/ERPEZ.Infrastructure/Services/Renderers/Pdf/LibPdfRenderer.cs
- Excel renderer: ERPEZ/ERPEZ.Infrastructure/Services/Renderers/Excel/LibExcelRenderer.cs
- Renderer selection: ERPEZ/ERPEZ.Infrastructure/Services/DocumentGeneration/DocumentRendererService.cs
- DI wiring: ERPEZ/ERPEZ.Infrastructure/DependencyInjection.cs

## Known Constraints

- Signatory data for LIB remains empty unless explicitly populated in mapping.
- Exact visual parity with scanned signed samples depends on asset overlays (logos, signatures, stamp blocks) which are not currently injected by data model fields.
