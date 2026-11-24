using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetOfficeDashboard;

public class GetOfficeDashboardQueryHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetOfficeDashboardQuery, ApiResponse<DashboardOverviewResponse>>
{
    public async Task<ApiResponse<DashboardOverviewResponse>> Handle(
        GetOfficeDashboardQuery query,
        CancellationToken cancellationToken)
    {
        var currentUserOfficeId = currentUserService.OfficeId;
        var officeId = query.OfficeId ?? currentUserOfficeId;

        if (currentUserService.IsOfficeUser
            && currentUserOfficeId.HasValue
            && query.OfficeId.HasValue
            && query.OfficeId.Value != currentUserOfficeId.Value)
        {
            throw new ValidationException("Office users can only access their assigned office dashboard.");
        }

        if (!officeId.HasValue)
            throw new ValidationException("Office ID is required. User must be assigned to an office.");

        var office = await unitOfWork.OfficeRepository.GetByIdAsync(officeId.Value, cancellationToken)
            ?? throw new NotFoundException($"Office with ID {officeId.Value} not found.");

        var now = DateTime.UtcNow;
        var currentMonthStart  = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd   = currentMonthStart.AddDays(-1);

        var overview = new DashboardOverviewResponse
        {
            KPIStats                     = await GetKPIStatisticsAsync(query.FiscalYearId, officeId.Value, currentMonthStart, previousMonthStart, previousMonthEnd, cancellationToken),
            OPCRStats                    = await GetOPCRStatisticsAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            BudgetStats                  = await GetBudgetStatisticsAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            PPMPStats                    = await GetPPMPStatisticsAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            OPCRCommitments              = await GetOPCRCommitmentsAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            DepartmentBudgetDistribution = await GetDepartmentBudgetDistributionAsync(query.FiscalYearId, officeId.Value, office.Name, cancellationToken),
            ExpenseClassAllocation       = await GetExpenseClassAllocationAsync(query.FiscalYearId, officeId.Value, office.Name, cancellationToken),
            APPProcurementReadiness      = await GetAPPProcurementReadinessAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            KPIClassification            = await GetKPIClassificationAsync(query.FiscalYearId, officeId.Value, cancellationToken)
        };

        return ApiResponse<DashboardOverviewResponse>.Success(overview);
    }

    private async Task<KPIStatistics> GetKPIStatisticsAsync(
        Guid fiscalYearId, Guid officeId,
        DateTime currentMonthStart, DateTime previousMonthStart, DateTime previousMonthEnd,
        CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.FYActiveKPIRepository.Query()
            .Where(x => !x.IsDeleted
                && x.FiscalYearId == fiscalYearId
                && x.KPIAssignments.Any(a => a.OfficeId == officeId));

        var kpis = await unitOfWork.FYActiveKPIRepository.ToListAsync(
            baseQuery.Select(k => new { k.CreatedAt }),
            cancellationToken);

        var total = kpis.Count;
        var thisMonth = kpis.Count(x => x.CreatedAt >= currentMonthStart);
        var lastMonth = kpis.Count(x => x.CreatedAt >= previousMonthStart && x.CreatedAt <= previousMonthEnd);
        var change = lastMonth > 0 ? ((thisMonth - lastMonth) / (decimal)lastMonth) * 100m : 0m;

        return new KPIStatistics
        {
            TotalKPIsEncoded = total,
            EncodedThisMonth = thisMonth,
            MonthOverMonthChange = Math.Round(change, 2)
        };
    }

    private async Task<OPCRStatistics> GetOPCRStatisticsAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var statuses = await unitOfWork.OPCRRepository.ToListAsync(
            unitOfWork.OPCRRepository.Query()
                .Where(x => !x.IsDeleted && x.FiscalYearId == fiscalYearId && x.OfficeId == officeId)
                .Select(x => x.CommitmentStatus),
            cancellationToken);

        var total = statuses.Count;
        var submitted = statuses.Count(s =>
            s.Equals("Submitted", StringComparison.OrdinalIgnoreCase) ||
            s.Equals("Approved", StringComparison.OrdinalIgnoreCase));
        var pending = statuses.Count(s =>
            s.Equals("Draft", StringComparison.OrdinalIgnoreCase) ||
            s.Equals("Returned", StringComparison.OrdinalIgnoreCase));

        return new OPCRStatistics
        {
            TotalOPCRs = total,
            SubmittedCount = submitted,
            PendingCount = pending,
            SubmittedPercentage = total > 0 ? Math.Round((submitted / (decimal)total) * 100m, 2) : 0m
        };
    }

    private async Task<BudgetStatistics> GetBudgetStatisticsAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        // 1. Check SubOfficeCeiling first
        var subCeilings = await unitOfWork.SubOfficeCeilingRepository.ToListAsync(
            unitOfWork.SubOfficeCeilingRepository.Query()
                .Where(s => !s.IsDeleted && s.FiscalYearId == fiscalYearId && s.SubOfficeId == officeId)
                .Select(s => s.PSAmount + s.MOOEAmount + s.COAmount),
            cancellationToken);
        var totalPlannedCeiling = subCeilings.Sum();

        // 2. Check OfficeCeiling if no SubOfficeCeiling
        if (totalPlannedCeiling == 0)
        {
            var officeCeilings = await unitOfWork.OfficeCeilingRepository.ToListAsync(
                unitOfWork.OfficeCeilingRepository.Query()
                    .Where(c => !c.IsDeleted && c.FiscalYearId == fiscalYearId && c.OfficeId == officeId)
                    .Select(c => c.PSAmount + c.MOOEAmount + c.COAmount),
                cancellationToken);
            totalPlannedCeiling = officeCeilings.Sum();
        }

        var details = await unitOfWork.LineItemBudgetDetailRepository.ToListAsync(
            unitOfWork.LineItemBudgetDetailRepository.Query()
                .Where(d => !d.IsDeleted && d.LineItemBudget.FiscalYearId == fiscalYearId && !d.LineItemBudget.IsDeleted && d.LineItemBudget.OfficeId == officeId)
                .Select(d => d.Budget),
            cancellationToken);
        var totalProgrammed = details.Sum();

        var pct = totalPlannedCeiling > 0
            ? Math.Round((totalProgrammed / totalPlannedCeiling) * 100m, 2)
            : 0m;

        return new BudgetStatistics
        {
            PlannedAmount = totalPlannedCeiling,
            UtilizedAmount = totalProgrammed,
            UtilizationPercentage = pct,
            Currency = "PHP"
        };
    }

    private async Task<PPMPStatistics> GetPPMPStatisticsAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var ppmps = await unitOfWork.PPMPRepository.ToListAsync(
            unitOfWork.PPMPRepository.Query()
                .Where(x => !x.IsDeleted && x.FiscalYearId == fiscalYearId && x.OfficeId == officeId)
                .Select(x => new
                {
                    x.Id,
                    x.Status,
                    x.ConsolidatedIntoId,
                    x.IsFinal
                }),
            cancellationToken);

        var total = ppmps.Count;
        var consolidated = ppmps.Count(p =>
            p.ConsolidatedIntoId.HasValue ||
            p.IsFinal ||
            p.Status == StatusEnum.Approved);
        var inProgress = ppmps.Count(p =>
            !p.ConsolidatedIntoId.HasValue && !p.IsFinal && (
                p.Status == StatusEnum.Submitted ||
                p.Status == StatusEnum.Draft));

        return new PPMPStatistics
        {
            TotalPPMPs = total,
            ConsolidatedCount = consolidated,
            InProgressCount = inProgress,
            PendingItemsCount = total - consolidated,
            ConsolidatedPercentage = total > 0 ? Math.Round((consolidated / (decimal)total) * 100m, 2) : 0m
        };
    }

    private async Task<List<OPCRPlannedActual>> GetOPCRCommitmentsAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var opcrItems = await unitOfWork.OPCRItemRepository.ToListAsync(
            unitOfWork.OPCRItemRepository.Query()
                .Where(i => !i.IsDeleted && i.OPCR.FiscalYearId == fiscalYearId && !i.OPCR.IsDeleted && i.OPCR.OfficeId == officeId)
                .Select(i => new
                {
                    i.Q1Target,
                    i.Q2Target,
                    i.Q3Target,
                    i.Q4Target,
                    i.ActualAccomplishment
                }),
            cancellationToken);

        static decimal ParseActual(string? actualAccomplishment, decimal target)
        {
            if (string.IsNullOrWhiteSpace(actualAccomplishment)) return 0m;
            var trimmed = actualAccomplishment.Trim();
            if (trimmed.EndsWith('%') && decimal.TryParse(trimmed.TrimEnd('%'), out var pct))
            {
                return target * (pct / 100m);
            }
            if (decimal.TryParse(trimmed, out var val))
            {
                return val;
            }
            return 0m;
        }

        var quarters = new[]
        {
            ("Q1", opcrItems.Select(i => new { 
                Target = i.Q1Target, 
                Actual = ParseActual(i.ActualAccomplishment, i.Q1Target),
                HasAccomplishment = !string.IsNullOrWhiteSpace(i.ActualAccomplishment)
            }).ToList()),
            ("Q2", opcrItems.Select(i => new { 
                Target = i.Q2Target, 
                Actual = ParseActual(i.ActualAccomplishment, i.Q2Target),
                HasAccomplishment = !string.IsNullOrWhiteSpace(i.ActualAccomplishment)
            }).ToList()),
            ("Q3", opcrItems.Select(i => new { 
                Target = i.Q3Target, 
                Actual = ParseActual(i.ActualAccomplishment, i.Q3Target),
                HasAccomplishment = !string.IsNullOrWhiteSpace(i.ActualAccomplishment)
            }).ToList()),
            ("Q4", opcrItems.Select(i => new { 
                Target = i.Q4Target, 
                Actual = ParseActual(i.ActualAccomplishment, i.Q4Target),
                HasAccomplishment = !string.IsNullOrWhiteSpace(i.ActualAccomplishment)
            }).ToList()),
        };

        var result = new List<OPCRPlannedActual>();
        foreach (var (qName, items) in quarters)
        {
            var activeItems = items.Where(x => x.Target > 0).ToList();
            if (activeItems.Count == 0)
            {
                result.Add(new OPCRPlannedActual
                {
                    Month = qName,
                    PlannedAmount = 0m,
                    ActualAmount = 0m,
                    Variance = 0m,
                    HasData = false,
                    HasAccomplishmentReported = false
                });
                continue;
            }

            var totalTarget = activeItems.Sum(x => x.Target);
            var totalActual = activeItems.Sum(x => x.Actual);
            var hasAccomplishment = activeItems.Any(x => x.HasAccomplishment);

            var plannedBaseline = 100m;
            var accomplishmentRate = totalTarget > 0 && hasAccomplishment
                ? Math.Round((totalActual / totalTarget) * 100m, 2)
                : 0m;

            result.Add(new OPCRPlannedActual
            {
                Month = qName,
                PlannedAmount = plannedBaseline,
                ActualAmount = accomplishmentRate,
                Variance = hasAccomplishment ? Math.Round(accomplishmentRate - plannedBaseline, 2) : 0m,
                HasData = true,
                HasAccomplishmentReported = hasAccomplishment
            });
        }

        return result;
    }

    private async Task<List<DepartmentBudgetDistributionDto>> GetDepartmentBudgetDistributionAsync(
        Guid fiscalYearId, Guid officeId, string officeName, CancellationToken cancellationToken)
    {
        var subCeilings = await unitOfWork.SubOfficeCeilingRepository.ToListAsync(
            unitOfWork.SubOfficeCeilingRepository.Query()
                .Where(s => !s.IsDeleted && s.FiscalYearId == fiscalYearId && s.SubOfficeId == officeId)
                .Select(s => s.PSAmount + s.MOOEAmount + s.COAmount),
            cancellationToken);
        var subCeil = subCeilings.Sum();

        var parentCeilings = await unitOfWork.OfficeCeilingRepository.ToListAsync(
            unitOfWork.OfficeCeilingRepository.Query()
                .Where(c => !c.IsDeleted && c.FiscalYearId == fiscalYearId && c.OfficeId == officeId)
                .Select(c => c.PSAmount + c.MOOEAmount + c.COAmount),
            cancellationToken);
        var parentCeil = parentCeilings.Sum();

        var hasSubCeiling = subCeil > 0;
        var hasParentCeiling = parentCeil > 0;
        var ceilingAmount = hasSubCeiling ? subCeil : parentCeil;
        var hasCeilingAllocated = hasSubCeiling || hasParentCeiling;

        var details = await unitOfWork.LineItemBudgetDetailRepository.ToListAsync(
            unitOfWork.LineItemBudgetDetailRepository.Query()
                .Where(d => !d.IsDeleted && d.LineItemBudget.FiscalYearId == fiscalYearId && !d.LineItemBudget.IsDeleted && d.LineItemBudget.OfficeId == officeId)
                .Select(d => d.Budget),
            cancellationToken);
        var programmedAmount = details.Sum();

        var programmingPct = hasCeilingAllocated && ceilingAmount > 0
            ? Math.Round((programmedAmount / ceilingAmount) * 100m, 2)
            : 0m;

        var status = !hasCeilingAllocated
            ? (programmedAmount > 0 ? "No Ceiling Allocated (Programmed)" : "No Ceiling Allocated")
            : (programmedAmount > ceilingAmount
                ? "Over-Programmed"
                : (programmingPct >= 90m ? "Approaching Ceiling" : "On Track"));

        var qBudget = Math.Round(programmedAmount / 4m, 2);

        return
        [
            new DepartmentBudgetDistributionDto
            {
                Department = officeName,
                DepartmentId = officeId,
                ProgrammedAmount = programmedAmount,
                CeilingAmount = ceilingAmount,
                ProgrammingPercentage = programmingPct,
                HasCeilingAllocated = hasCeilingAllocated,
                Status = status,
                QuarterlyProgrammed = [qBudget, qBudget, qBudget, qBudget]
            }
        ];
    }

    private async Task<ExpenseClassAllocationSummary> GetExpenseClassAllocationAsync(
        Guid fiscalYearId, Guid officeId, string officeName, CancellationToken cancellationToken)
    {
        var details = await unitOfWork.LineItemBudgetDetailRepository.ToListAsync(
            unitOfWork.LineItemBudgetDetailRepository.Query()
                .Where(d => !d.IsDeleted && d.LineItemBudget.FiscalYearId == fiscalYearId && !d.LineItemBudget.IsDeleted && d.LineItemBudget.OfficeId == officeId)
                .Select(d => new
                {
                    d.Budget,
                    ExpenseClassType = d.Object != null && d.Object.ObjectExpenseClasses.Any()
                        ? d.Object.ObjectExpenseClasses.Select(oec => oec.ExpenseClass != null ? (ExpenseClassTypeEnum?)oec.ExpenseClass.Type : null).FirstOrDefault()
                        : (ExpenseClassTypeEnum?)null
                }),
            cancellationToken);

        var subCeilings = await unitOfWork.SubOfficeCeilingRepository.ToListAsync(
            unitOfWork.SubOfficeCeilingRepository.Query()
                .Where(s => !s.IsDeleted && s.FiscalYearId == fiscalYearId && s.SubOfficeId == officeId)
                .Select(s => new { s.PSAmount, s.MOOEAmount, s.COAmount }),
            cancellationToken);

        decimal totalCeilingPS;
        decimal totalCeilingMOOE;
        decimal totalCeilingCO;
        decimal totalCeilingFE = 0m;

        if (subCeilings.Count > 0)
        {
            totalCeilingPS = subCeilings.Sum(s => s.PSAmount);
            totalCeilingMOOE = subCeilings.Sum(s => s.MOOEAmount);
            totalCeilingCO = subCeilings.Sum(s => s.COAmount);
        }
        else
        {
            var officeCeilings = await unitOfWork.OfficeCeilingRepository.ToListAsync(
                unitOfWork.OfficeCeilingRepository.Query()
                    .Where(c => !c.IsDeleted && c.FiscalYearId == fiscalYearId && c.OfficeId == officeId)
                    .Select(c => new { c.PSAmount, c.MOOEAmount, c.COAmount }),
                cancellationToken);
            totalCeilingPS = officeCeilings.Sum(c => c.PSAmount);
            totalCeilingMOOE = officeCeilings.Sum(c => c.MOOEAmount);
            totalCeilingCO = officeCeilings.Sum(c => c.COAmount);
        }

        var progPS = details.Where(d => d.ExpenseClassType == ExpenseClassTypeEnum.PersonnelServices).Sum(d => d.Budget);
        var progMOOE = details.Where(d => d.ExpenseClassType == ExpenseClassTypeEnum.MaintenanceAndOperatingExpenses).Sum(d => d.Budget);
        var progCO = details.Where(d => d.ExpenseClassType == ExpenseClassTypeEnum.CapitalOutlay).Sum(d => d.Budget);
        var progFE = details.Where(d => d.ExpenseClassType == ExpenseClassTypeEnum.FinancialExpenses).Sum(d => d.Budget);
        var unassigned = details.Where(d => d.ExpenseClassType == null).Sum(d => d.Budget);
        progMOOE += unassigned;

        static string GetRowStatus(decimal programmed, decimal ceiling)
        {
            if (ceiling == 0) return "No Allotment";
            if (programmed > ceiling) return "Over-Programmed";
            var pct = (programmed / ceiling) * 100m;
            return pct >= 90m ? "Warning" : "On Track";
        }

        var rows = new List<ExpenseClassRowDto>
        {
            new()
            {
                Code = "PS",
                Label = "Personnel Services",
                ProgrammedAmount = progPS,
                AllotmentAmount = totalCeilingPS,
                ObligationPercent = totalCeilingPS > 0 ? Math.Round((progPS / totalCeilingPS) * 100m, 2) : 0m,
                AllotmentLabel = totalCeilingPS > 0 ? $"P {totalCeilingPS:N0}" : "P 0",
                Status = GetRowStatus(progPS, totalCeilingPS),
                Color = "#3b82f6"
            },
            new()
            {
                Code = "MOOE",
                Label = "Maintenance & Other Operating Expenses",
                ProgrammedAmount = progMOOE,
                AllotmentAmount = totalCeilingMOOE,
                ObligationPercent = totalCeilingMOOE > 0 ? Math.Round((progMOOE / totalCeilingMOOE) * 100m, 2) : 0m,
                AllotmentLabel = totalCeilingMOOE > 0 ? $"P {totalCeilingMOOE:N0}" : "P 0",
                Status = GetRowStatus(progMOOE, totalCeilingMOOE),
                Color = "#10b981"
            },
            new()
            {
                Code = "CO",
                Label = "Capital Outlay",
                ProgrammedAmount = progCO,
                AllotmentAmount = totalCeilingCO,
                ObligationPercent = totalCeilingCO > 0 ? Math.Round((progCO / totalCeilingCO) * 100m, 2) : 0m,
                AllotmentLabel = totalCeilingCO > 0 ? $"P {totalCeilingCO:N0}" : "P 0",
                Status = GetRowStatus(progCO, totalCeilingCO),
                Color = "#f59e0b"
            },
            new()
            {
                Code = "FE",
                Label = "Financial Expenses",
                ProgrammedAmount = progFE,
                AllotmentAmount = totalCeilingFE,
                ObligationPercent = totalCeilingFE > 0 ? Math.Round((progFE / totalCeilingFE) * 100m, 2) : 0m,
                AllotmentLabel = totalCeilingFE > 0 ? $"P {totalCeilingFE:N0}" : "P 0",
                Status = GetRowStatus(progFE, totalCeilingFE),
                Color = "#8b5cf6"
            }
        };

        var deptProg = details.Sum(d => d.Budget);
        var deptCeiling = totalCeilingPS + totalCeilingMOOE + totalCeilingCO + totalCeilingFE;
        var deptBarData = new List<ExpenseClassDepartmentComparisonDto>
        {
            new()
            {
                Department = officeName,
                DepartmentId = officeId,
                Obligated = deptProg,
                Allotment = deptCeiling
            }
        };

        var overallProgrammingPercentage = deptCeiling > 0
            ? Math.Round((deptProg / deptCeiling) * 100m, 2)
            : 0m;

        return new ExpenseClassAllocationSummary
        {
            Quarter = "All",
            Year = DateTime.UtcNow.Year,
            TotalProgrammed = deptProg,
            TotalAllotment = deptCeiling,
            OverallProgrammingPercentage = overallProgrammingPercentage,
            Rows = rows,
            BarChartData = deptBarData
        };
    }

    private async Task<APPProcurementReadinessSummary> GetAPPProcurementReadinessAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var appItems = await unitOfWork.APPItemRepository.ToListAsync(
            unitOfWork.APPItemRepository.Query()
                .Where(i => !i.IsDeleted
                    && i.APP.FiscalYearId == fiscalYearId
                    && !i.APP.IsDeleted
                    && i.OfficeId == officeId)
                .Select(i => new
                {
                    i.Id,
                    i.ProcurementModeId,
                    ProcurementModeName = i.ProcurementMode != null ? i.ProcurementMode.Name : "Unclassified",
                    EstimatedBudget = i.EstimatedBudgetOverride ?? (i.PPMPItem != null ? i.PPMPItem.UnitPrice * i.PPMPItem.PlannedQuantity : 0m),
                    IsEPA = i.IsEarlyProcurementActivity,
                    HasSchedule = i.StartOfProcurementOverride != null || (i.PPMPItem != null && (i.PPMPItem.ProcurementStartDate != null || i.PPMPItem.APPProcurementSchedules.Any()))
                }),
            cancellationToken);

        var totalItems = appItems.Count;
        var totalBudget = appItems.Sum(i => i.EstimatedBudget);

        var modeAssignedCount = appItems.Count(i => i.ProcurementModeId != Guid.Empty);
        var fullyEncodedCount = appItems.Count(i => i.EstimatedBudget > 0);
        var scheduledCount = appItems.Count(i => i.HasSchedule);
        var missingScheduleCount = totalItems - scheduledCount;
        var epaReadyCount = appItems.Count(i => i.IsEPA);

        var stages = new List<ProcurementReadinessStageDto>
        {
            new()
            {
                StageKey = "procurement_mode",
                Label = "Mode of Procurement",
                CompletedCount = modeAssignedCount,
                TotalCount = totalItems,
                Percent = totalItems > 0 ? Math.Round((modeAssignedCount / (decimal)totalItems) * 100m, 1) : 0m,
                Color = "#10b981",
                Status = modeAssignedCount == totalItems ? "complete" : (modeAssignedCount > 0 ? "in-progress" : "action-needed"),
                ActionLabel = modeAssignedCount < totalItems ? $"{totalItems - modeAssignedCount} items missing mode" : null
            },
            new()
            {
                StageKey = "item_encoding",
                Label = "Item Details & Budget",
                CompletedCount = fullyEncodedCount,
                TotalCount = totalItems,
                Percent = totalItems > 0 ? Math.Round((fullyEncodedCount / (decimal)totalItems) * 100m, 1) : 0m,
                Color = "#3b82f6",
                Status = fullyEncodedCount == totalItems ? "complete" : (fullyEncodedCount > 0 ? "in-progress" : "action-needed"),
                ActionLabel = fullyEncodedCount < totalItems ? $"{totalItems - fullyEncodedCount} items missing budget" : null
            },
            new()
            {
                StageKey = "procurement_schedules",
                Label = "Procurement Schedules",
                CompletedCount = scheduledCount,
                TotalCount = totalItems,
                Percent = totalItems > 0 ? Math.Round((scheduledCount / (decimal)totalItems) * 100m, 1) : 0m,
                Color = "#f59e0b",
                Status = scheduledCount == totalItems ? "complete" : (missingScheduleCount > 0 ? "action-needed" : "in-progress"),
                ActionLabel = missingScheduleCount > 0 ? $"{missingScheduleCount} items missing schedule" : null
            },
            new()
            {
                StageKey = "early_procurement_activity",
                Label = "Early Procurement (EPA)",
                CompletedCount = epaReadyCount,
                TotalCount = totalItems,
                Percent = totalItems > 0 ? Math.Round((epaReadyCount / (decimal)totalItems) * 100m, 1) : 0m,
                Color = "#8b5cf6",
                Status = epaReadyCount > 0 ? "complete" : "in-progress",
                ActionLabel = $"{epaReadyCount} EPA items marked"
            }
        };

        var modeColors = new[] { "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4" };
        var colorIdx = 0;
        var byMode = appItems
            .GroupBy(i => new { i.ProcurementModeId, i.ProcurementModeName })
            .Select(g => new ProcurementModeReadinessDto
            {
                Mode = g.Key.ProcurementModeName,
                ModeId = g.Key.ProcurementModeId,
                Count = g.Count(),
                TotalAmount = g.Sum(x => x.EstimatedBudget),
                Percent = totalBudget > 0 ? Math.Round((g.Sum(x => x.EstimatedBudget) / totalBudget) * 100m, 2) : 0m,
                Color = modeColors[colorIdx++ % modeColors.Length]
            })
            .OrderByDescending(m => m.TotalAmount)
            .ToList();

        var readinessScore = stages.Count > 0 ? stages.Average(s => s.Percent) : 0m;
        var overallStatus = readinessScore >= 75m ? "on-track" : (readinessScore >= 40m ? "warning" : "critical");

        return new APPProcurementReadinessSummary
        {
            OverallStatus = overallStatus,
            TotalItems = totalItems,
            ModeAssignedCount = modeAssignedCount,
            FullyEncodedCount = fullyEncodedCount,
            ScheduledCount = scheduledCount,
            MissingScheduleCount = missingScheduleCount,
            EpaCount = epaReadyCount,
            TotalEstimatedBudget = totalBudget,
            Stages = stages,
            ByMode = byMode
        };
    }

    private async Task<KPIClassificationSummary> GetKPIClassificationAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var kpiData = await unitOfWork.FYActiveKPIRepository.ToListAsync(
            unitOfWork.FYActiveKPIRepository.Query()
                .Where(k => !k.IsDeleted
                    && k.FiscalYearId == fiscalYearId
                    && k.KPIAssignments.Any(a => a.OfficeId == officeId))
                .Select(k => new
                {
                    k.Id,
                    k.FunctionCategory,
                    k.Status
                }),
            cancellationToken);

        var totalKPIs = kpiData.Count;

        var strategicKpis = kpiData.Where(k => (k.FunctionCategory ?? string.Empty).Equals("Strategic", StringComparison.OrdinalIgnoreCase)).ToList();
        var coreKpis = kpiData.Where(k => (k.FunctionCategory ?? string.Empty).Equals("Core", StringComparison.OrdinalIgnoreCase)).ToList();
        var supportKpis = kpiData.Where(k => (k.FunctionCategory ?? string.Empty).Equals("Support", StringComparison.OrdinalIgnoreCase)).ToList();

        var items = new List<KPIClassificationItemDto>
        {
            new()
            {
                Type = "strategic",
                Label = "Strategic Functions",
                Description = "Major organizational goals, outcomes, and high-level mandates",
                Count = strategicKpis.Count,
                Percent = totalKPIs > 0 ? Math.Round((strategicKpis.Count / (decimal)totalKPIs) * 100m, 1) : 0m,
                ActiveCount = strategicKpis.Count(k => (k.Status ?? string.Empty).Equals("Active", StringComparison.OrdinalIgnoreCase)),
                Color = "#3b82f6",
                Divisions = []
            },
            new()
            {
                Type = "core",
                Label = "Core Functions",
                Description = "Primary mandated deliverables and operational services",
                Count = coreKpis.Count,
                Percent = totalKPIs > 0 ? Math.Round((coreKpis.Count / (decimal)totalKPIs) * 100m, 1) : 0m,
                ActiveCount = coreKpis.Count(k => (k.Status ?? string.Empty).Equals("Active", StringComparison.OrdinalIgnoreCase)),
                Color = "#10b981",
                Divisions = []
            },
            new()
            {
                Type = "support",
                Label = "Support Functions",
                Description = "Administrative, financial, and logistical support functions",
                Count = supportKpis.Count,
                Percent = totalKPIs > 0 ? Math.Round((supportKpis.Count / (decimal)totalKPIs) * 100m, 1) : 0m,
                ActiveCount = supportKpis.Count(k => (k.Status ?? string.Empty).Equals("Active", StringComparison.OrdinalIgnoreCase)),
                Color = "#f59e0b",
                Divisions = []
            }
        };

        return new KPIClassificationSummary
        {
            Total = totalKPIs,
            FiscalYear = DateTime.UtcNow.Year,
            Items = items
        };
    }
}