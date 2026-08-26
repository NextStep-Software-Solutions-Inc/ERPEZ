using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetPlanningDashboard;

public class GetPlanningDashboardQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPlanningDashboardQuery, ApiResponse<DashboardOverviewResponse>>
{
    public async Task<ApiResponse<DashboardOverviewResponse>> Handle(
        GetPlanningDashboardQuery query,
        CancellationToken cancellationToken)
    {
        var currentDate = DateTime.UtcNow;
        var currentMonthStart = new DateTime(currentDate.Year, currentDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd = currentMonthStart.AddDays(-1);

        var overview = new DashboardOverviewResponse
        {
            KPIStats = await GetKPIStatisticsAsync(
                query.FiscalYearId,
                query.OrganizationId,
                currentMonthStart,
                previousMonthStart,
                previousMonthEnd,
                cancellationToken),
            OPCRStats = await GetOPCRStatisticsAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            BudgetStats = await GetBudgetStatisticsAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            PPMPStats = await GetPPMPStatisticsAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            OPCRCommitments = await GetOPCRCommitmentsAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            DepartmentBudgetDistribution = await GetDepartmentBudgetDistributionAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            ExpenseClassAllocation = await GetExpenseClassAllocationAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            APPProcurementReadiness = await GetAPPProcurementReadinessAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            KPIClassification = await GetKPIClassificationAsync(query.FiscalYearId, query.OrganizationId, cancellationToken)
        };

        return ApiResponse<DashboardOverviewResponse>.Success(overview);
    }

    private async Task<KPIStatistics> GetKPIStatisticsAsync(
        Guid fiscalYearId,
        Guid? organizationId,
        DateTime currentMonthStart,
        DateTime previousMonthStart,
        DateTime previousMonthEnd,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var baseQuery = unitOfWork.FYActiveKPIRepository.Query()
            .Where(k => !k.IsDeleted && k.FiscalYearId == fiscalYearId);

        if (scopedOfficeIds != null)
            baseQuery = baseQuery.Where(k => k.KPIAssignments.Any(a => scopedOfficeIds.Contains(a.OfficeId)));

        var kpis = await unitOfWork.FYActiveKPIRepository.ToListAsync(
            baseQuery.Select(k => new { k.CreatedAt }),
            cancellationToken);

        var totalKPIs = kpis.Count;
        var thisMonthKPIs = kpis.Count(k => k.CreatedAt >= currentMonthStart);
        var lastMonthKPIs = kpis.Count(k => k.CreatedAt >= previousMonthStart && k.CreatedAt <= previousMonthEnd);

        var monthOverMonthChange = lastMonthKPIs > 0
            ? ((thisMonthKPIs - lastMonthKPIs) / (decimal)lastMonthKPIs) * 100m
            : 0m;

        return new KPIStatistics
        {
            TotalKPIsEncoded = totalKPIs,
            EncodedThisMonth = thisMonthKPIs,
            MonthOverMonthChange = Math.Round(monthOverMonthChange, 2)
        };
    }

    private async Task<OPCRStatistics> GetOPCRStatisticsAsync(
        Guid fiscalYearId,
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var opcrs = await unitOfWork.OPCRRepository.ToListAsync(
            unitOfWork.OPCRRepository.Query()
                .Where(o => o.FiscalYearId == fiscalYearId && !o.IsDeleted)
                .Where(o => scopedOfficeIds == null || scopedOfficeIds.Contains(o.OfficeId))
                .Select(o => o.CommitmentStatus),
            cancellationToken);

        var totalOPCRs = opcrs.Count;

        var submittedOPCRs = opcrs.Count(s =>
            s.Equals("Submitted", StringComparison.OrdinalIgnoreCase) ||
            s.Equals("Approved", StringComparison.OrdinalIgnoreCase));

        var pendingOPCRs = opcrs.Count(s =>
            s.Equals("Draft", StringComparison.OrdinalIgnoreCase) ||
            s.Equals("Returned", StringComparison.OrdinalIgnoreCase));

        var submittedPercentage = totalOPCRs > 0
            ? (submittedOPCRs / (decimal)totalOPCRs) * 100m
            : 0m;

        return new OPCRStatistics
        {
            TotalOPCRs = totalOPCRs,
            SubmittedCount = submittedOPCRs,
            PendingCount = pendingOPCRs,
            SubmittedPercentage = Math.Round(submittedPercentage, 2)
        };
    }

    private async Task<BudgetStatistics> GetBudgetStatisticsAsync(
        Guid fiscalYearId,
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        decimal totalPlannedCeiling = 0m;

        if (organizationId == null)
        {
            // Global Agency View: Use AgencyMasterBudget (GAA total)
            var agencyBudgets = await unitOfWork.AgencyMasterBudgetRepository.ToListAsync(
                unitOfWork.AgencyMasterBudgetRepository.Query()
                    .Where(b => !b.IsDeleted && b.FiscalYearId == fiscalYearId)
                    .Select(b => b.PSAmount + b.MOOEAmount + b.COAmount),
                cancellationToken);
            totalPlannedCeiling = agencyBudgets.Sum();

            if (totalPlannedCeiling == 0)
            {
                // Fallback to top-level OfficeCeilings
                var officeCeilings = await unitOfWork.OfficeCeilingRepository.ToListAsync(
                    unitOfWork.OfficeCeilingRepository.Query()
                        .Where(c => !c.IsDeleted && c.FiscalYearId == fiscalYearId)
                        .Select(c => c.PSAmount + c.MOOEAmount + c.COAmount),
                    cancellationToken);
                totalPlannedCeiling = officeCeilings.Sum();
            }
        }
        else if (scopedOfficeIds != null)
        {
            // Scoped View: Check SubOfficeCeilings first, then OfficeCeilings
            var subCeilings = await unitOfWork.SubOfficeCeilingRepository.ToListAsync(
                unitOfWork.SubOfficeCeilingRepository.Query()
                    .Where(s => !s.IsDeleted && s.FiscalYearId == fiscalYearId && scopedOfficeIds.Contains(s.SubOfficeId))
                    .Select(s => s.PSAmount + s.MOOEAmount + s.COAmount),
                cancellationToken);
            totalPlannedCeiling = subCeilings.Sum();

            if (totalPlannedCeiling == 0)
            {
                var officeCeilings = await unitOfWork.OfficeCeilingRepository.ToListAsync(
                    unitOfWork.OfficeCeilingRepository.Query()
                        .Where(c => !c.IsDeleted && c.FiscalYearId == fiscalYearId && scopedOfficeIds.Contains(c.OfficeId))
                        .Select(c => c.PSAmount + c.MOOEAmount + c.COAmount),
                    cancellationToken);
                totalPlannedCeiling = officeCeilings.Sum();
            }
        }

        var programmedQuery = unitOfWork.LineItemBudgetDetailRepository.Query()
            .Where(d => !d.IsDeleted && d.LineItemBudget.FiscalYearId == fiscalYearId && !d.LineItemBudget.IsDeleted);

        if (scopedOfficeIds != null)
            programmedQuery = programmedQuery.Where(d => d.LineItemBudget.OfficeId.HasValue && scopedOfficeIds.Contains(d.LineItemBudget.OfficeId.Value));

        var details = await unitOfWork.LineItemBudgetDetailRepository.ToListAsync(
            programmedQuery.Select(d => d.Budget),
            cancellationToken);

        var totalProgrammed = details.Sum();

        var utilizationPercentage = totalPlannedCeiling > 0
            ? Math.Round((totalProgrammed / totalPlannedCeiling) * 100m, 2)
            : 0m;

        return new BudgetStatistics
        {
            PlannedAmount = totalPlannedCeiling,
            UtilizedAmount = totalProgrammed,
            UtilizationPercentage = utilizationPercentage,
            Currency = "PHP"
        };
    }

    private async Task<PPMPStatistics> GetPPMPStatisticsAsync(
        Guid fiscalYearId,
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var ppmpQuery = unitOfWork.PPMPRepository.Query()
            .Where(p => !p.IsDeleted && p.FiscalYearId == fiscalYearId);

        if (scopedOfficeIds != null)
            ppmpQuery = ppmpQuery.Where(p => scopedOfficeIds.Contains(p.OfficeId));

        var ppmps = await unitOfWork.PPMPRepository.ToListAsync(
            ppmpQuery.Select(p => new
            {
                p.Id,
                p.Status,
                p.ConsolidatedIntoId,
                p.IsFinal
            }),
            cancellationToken);

        var totalPPMPs = ppmps.Count;

        var consolidatedCount = ppmps.Count(p =>
            p.ConsolidatedIntoId.HasValue ||
            p.IsFinal ||
            p.Status == StatusEnum.Approved);

        var inProgressCount = ppmps.Count(p =>
            !p.ConsolidatedIntoId.HasValue && !p.IsFinal && (
                p.Status == StatusEnum.Submitted ||
                p.Status == StatusEnum.Draft));

        var pendingItemsCount = totalPPMPs - consolidatedCount;

        var consolidatedPercentage = totalPPMPs > 0
            ? (consolidatedCount / (decimal)totalPPMPs) * 100m
            : 0m;

        return new PPMPStatistics
        {
            TotalPPMPs = totalPPMPs,
            ConsolidatedCount = consolidatedCount,
            InProgressCount = inProgressCount,
            PendingItemsCount = pendingItemsCount,
            ConsolidatedPercentage = Math.Round(consolidatedPercentage, 2)
        };
    }

    private async Task<List<OPCRPlannedActual>> GetOPCRCommitmentsAsync(
        Guid fiscalYearId,
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var opcrItemQuery = unitOfWork.OPCRItemRepository.Query()
            .Where(i => !i.IsDeleted && i.OPCR.FiscalYearId == fiscalYearId && !i.OPCR.IsDeleted);

        if (scopedOfficeIds != null)
            opcrItemQuery = opcrItemQuery.Where(i => scopedOfficeIds.Contains(i.OPCR.OfficeId));

        var opcrItems = await unitOfWork.OPCRItemRepository.ToListAsync(
            opcrItemQuery.Select(i => new
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
        Guid fiscalYearId,
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var offices = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => !o.IsDeleted && (scopedOfficeIds == null || scopedOfficeIds.Contains(o.Id)))
                .Select(o => new { o.Id, o.Name, o.ParentId }),
            cancellationToken);

        // 1. Fetch SubOfficeCeilings (Authoritative ceiling for Sub-Offices/Departments)
        var subCeilings = await unitOfWork.SubOfficeCeilingRepository.ToListAsync(
            unitOfWork.SubOfficeCeilingRepository.Query()
                .Where(s => !s.IsDeleted && s.FiscalYearId == fiscalYearId && (scopedOfficeIds == null || scopedOfficeIds.Contains(s.SubOfficeId)))
                .Select(s => new { s.SubOfficeId, TotalCeiling = s.PSAmount + s.MOOEAmount + s.COAmount }),
            cancellationToken);
        var subCeilingDict = subCeilings.GroupBy(s => s.SubOfficeId).ToDictionary(g => g.Key, g => g.Sum(x => x.TotalCeiling));

        // 2. Fetch OfficeCeilings (Authoritative ceiling for Operating/Parent Units)
        var parentCeilings = await unitOfWork.OfficeCeilingRepository.ToListAsync(
            unitOfWork.OfficeCeilingRepository.Query()
                .Where(c => !c.IsDeleted && c.FiscalYearId == fiscalYearId && (scopedOfficeIds == null || scopedOfficeIds.Contains(c.OfficeId)))
                .Select(c => new { c.OfficeId, TotalCeiling = c.PSAmount + c.MOOEAmount + c.COAmount }),
            cancellationToken);
        var parentCeilingDict = parentCeilings.GroupBy(c => c.OfficeId).ToDictionary(g => g.Key, g => g.Sum(x => x.TotalCeiling));

        // 3. Fetch LineItemBudgetDetails
        var budgetDetails = await unitOfWork.LineItemBudgetDetailRepository.ToListAsync(
            unitOfWork.LineItemBudgetDetailRepository.Query()
                .Where(d => !d.IsDeleted && d.LineItemBudget.FiscalYearId == fiscalYearId && !d.LineItemBudget.IsDeleted)
                .Where(d => scopedOfficeIds == null || (d.LineItemBudget.OfficeId.HasValue && scopedOfficeIds.Contains(d.LineItemBudget.OfficeId.Value)))
                .Select(d => new
                {
                    OfficeId = d.LineItemBudget.OfficeId,
                    d.Budget
                }),
            cancellationToken);

        var result = new List<DepartmentBudgetDistributionDto>();
        foreach (var office in offices)
        {
            var officeDetails = budgetDetails.Where(d => d.OfficeId == office.Id).ToList();
            var programmedAmount = officeDetails.Sum(d => d.Budget);

            subCeilingDict.TryGetValue(office.Id, out var subCeiling);
            parentCeilingDict.TryGetValue(office.Id, out var parentCeiling);

            var hasSubCeiling = subCeiling > 0;
            var hasParentCeiling = parentCeiling > 0;
            var ceilingAmount = hasSubCeiling ? subCeiling : parentCeiling;
            var hasCeilingAllocated = hasSubCeiling || hasParentCeiling;

            if (programmedAmount == 0 && !hasCeilingAllocated && offices.Count > 15)
                continue;

            var programmingPct = hasCeilingAllocated && ceilingAmount > 0
                ? Math.Round((programmedAmount / ceilingAmount) * 100m, 2)
                : 0m;

            var status = !hasCeilingAllocated
                ? (programmedAmount > 0 ? "No Ceiling Allocated (Programmed)" : "No Ceiling Allocated")
                : (programmedAmount > ceilingAmount
                    ? "Over-Programmed"
                    : (programmingPct >= 90m ? "Approaching Ceiling" : "On Track"));

            var qBudget = Math.Round(programmedAmount / 4m, 2);

            result.Add(new DepartmentBudgetDistributionDto
            {
                Department = office.Name,
                DepartmentId = office.Id,
                ProgrammedAmount = programmedAmount,
                CeilingAmount = ceilingAmount,
                ProgrammingPercentage = programmingPct,
                HasCeilingAllocated = hasCeilingAllocated,
                Status = status,
                QuarterlyProgrammed = [qBudget, qBudget, qBudget, qBudget]
            });
        }

        return result.OrderByDescending(r => r.ProgrammedAmount).ToList();
    }

    private async Task<ExpenseClassAllocationSummary> GetExpenseClassAllocationAsync(
        Guid fiscalYearId,
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var details = await unitOfWork.LineItemBudgetDetailRepository.ToListAsync(
            unitOfWork.LineItemBudgetDetailRepository.Query()
                .Where(d => !d.IsDeleted && d.LineItemBudget.FiscalYearId == fiscalYearId && !d.LineItemBudget.IsDeleted)
                .Where(d => scopedOfficeIds == null || (d.LineItemBudget.OfficeId.HasValue && scopedOfficeIds.Contains(d.LineItemBudget.OfficeId.Value)))
                .Select(d => new
                {
                    d.Budget,
                    OfficeId = d.LineItemBudget.OfficeId ?? Guid.Empty,
                    OfficeName = d.LineItemBudget.Office != null ? d.LineItemBudget.Office.Name : "Unassigned",
                    ExpenseClassType = d.Object != null && d.Object.ObjectExpenseClasses.Any()
                        ? d.Object.ObjectExpenseClasses.Select(oec => oec.ExpenseClass != null ? (ExpenseClassTypeEnum?)oec.ExpenseClass.Type : null).FirstOrDefault()
                        : (ExpenseClassTypeEnum?)null
                }),
            cancellationToken);

        decimal totalCeilingPS = 0m;
        decimal totalCeilingMOOE = 0m;
        decimal totalCeilingCO = 0m;
        decimal totalCeilingFE = 0m;

        if (organizationId == null)
        {
            // Global Agency View: Use AgencyMasterBudget (GAA total)
            var masterBudgets = await unitOfWork.AgencyMasterBudgetRepository.ToListAsync(
                unitOfWork.AgencyMasterBudgetRepository.Query()
                    .Where(b => !b.IsDeleted && b.FiscalYearId == fiscalYearId)
                    .Select(b => new { b.PSAmount, b.MOOEAmount, b.COAmount }),
                cancellationToken);

            if (masterBudgets.Count > 0)
            {
                totalCeilingPS = masterBudgets.Sum(b => b.PSAmount);
                totalCeilingMOOE = masterBudgets.Sum(b => b.MOOEAmount);
                totalCeilingCO = masterBudgets.Sum(b => b.COAmount);
            }
            else
            {
                // Fallback to sum of top-level OfficeCeilings
                var ceilings = await unitOfWork.OfficeCeilingRepository.ToListAsync(
                    unitOfWork.OfficeCeilingRepository.Query()
                        .Where(c => !c.IsDeleted && c.FiscalYearId == fiscalYearId)
                        .Select(c => new { c.PSAmount, c.MOOEAmount, c.COAmount }),
                    cancellationToken);
                totalCeilingPS = ceilings.Sum(c => c.PSAmount);
                totalCeilingMOOE = ceilings.Sum(c => c.MOOEAmount);
                totalCeilingCO = ceilings.Sum(c => c.COAmount);
            }
        }
        else if (scopedOfficeIds != null)
        {
            // Scoped View: Match allocated ceiling for the scoped offices
            var subCeilings = await unitOfWork.SubOfficeCeilingRepository.ToListAsync(
                unitOfWork.SubOfficeCeilingRepository.Query()
                    .Where(s => !s.IsDeleted && s.FiscalYearId == fiscalYearId && scopedOfficeIds.Contains(s.SubOfficeId))
                    .Select(s => new { s.PSAmount, s.MOOEAmount, s.COAmount }),
                cancellationToken);

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
                        .Where(c => !c.IsDeleted && c.FiscalYearId == fiscalYearId && scopedOfficeIds.Contains(c.OfficeId))
                        .Select(c => new { c.PSAmount, c.MOOEAmount, c.COAmount }),
                    cancellationToken);
                totalCeilingPS = officeCeilings.Sum(c => c.PSAmount);
                totalCeilingMOOE = officeCeilings.Sum(c => c.MOOEAmount);
                totalCeilingCO = officeCeilings.Sum(c => c.COAmount);
            }
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

        // Department Bar Data
        var subCeilingsList = await unitOfWork.SubOfficeCeilingRepository.ToListAsync(
            unitOfWork.SubOfficeCeilingRepository.Query()
                .Where(s => !s.IsDeleted && s.FiscalYearId == fiscalYearId)
                .Select(s => new { s.SubOfficeId, Total = s.PSAmount + s.MOOEAmount + s.COAmount }),
            cancellationToken);
        var subCeilDict = subCeilingsList.GroupBy(s => s.SubOfficeId).ToDictionary(g => g.Key, g => g.Sum(x => x.Total));

        var parentCeilingsList = await unitOfWork.OfficeCeilingRepository.ToListAsync(
            unitOfWork.OfficeCeilingRepository.Query()
                .Where(c => !c.IsDeleted && c.FiscalYearId == fiscalYearId)
                .Select(c => new { c.OfficeId, Total = c.PSAmount + c.MOOEAmount + c.COAmount }),
            cancellationToken);
        var parentCeilDict = parentCeilingsList.GroupBy(c => c.OfficeId).ToDictionary(g => g.Key, g => g.Sum(x => x.Total));

        var deptBarData = new List<ExpenseClassDepartmentComparisonDto>();
        var deptGroups = details.GroupBy(d => new { d.OfficeId, d.OfficeName });
        foreach (var dg in deptGroups)
        {
            var deptProg = dg.Sum(d => d.Budget);
            subCeilDict.TryGetValue(dg.Key.OfficeId, out var sCeil);
            parentCeilDict.TryGetValue(dg.Key.OfficeId, out var pCeil);
            var deptCeiling = sCeil > 0 ? sCeil : pCeil;

            deptBarData.Add(new ExpenseClassDepartmentComparisonDto
            {
                Department = dg.Key.OfficeName,
                DepartmentId = dg.Key.OfficeId,
                Obligated = deptProg,
                Allotment = deptCeiling
            });
        }

        var totalProgrammedAmount = progPS + progMOOE + progCO + progFE;
        var totalAllotmentAmount = totalCeilingPS + totalCeilingMOOE + totalCeilingCO + totalCeilingFE;
        var overallProgrammingPercentage = totalAllotmentAmount > 0
            ? Math.Round((totalProgrammedAmount / totalAllotmentAmount) * 100m, 2)
            : 0m;

        return new ExpenseClassAllocationSummary
        {
            Quarter = "All",
            Year = DateTime.UtcNow.Year,
            TotalProgrammed = totalProgrammedAmount,
            TotalAllotment = totalAllotmentAmount,
            OverallProgrammingPercentage = overallProgrammingPercentage,
            Rows = rows,
            BarChartData = deptBarData
        };
    }

    private async Task<APPProcurementReadinessSummary> GetAPPProcurementReadinessAsync(
        Guid fiscalYearId,
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var appItemQuery = unitOfWork.APPItemRepository.Query()
            .Where(i => !i.IsDeleted && i.APP.FiscalYearId == fiscalYearId && !i.APP.IsDeleted);

        if (scopedOfficeIds != null)
            appItemQuery = appItemQuery.Where(i => scopedOfficeIds.Contains(i.OfficeId));

        var appItems = await unitOfWork.APPItemRepository.ToListAsync(
            appItemQuery.Select(i => new
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
        Guid fiscalYearId,
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var kpiQuery = unitOfWork.FYActiveKPIRepository.Query()
            .Where(k => !k.IsDeleted && k.FiscalYearId == fiscalYearId);

        if (scopedOfficeIds != null)
            kpiQuery = kpiQuery.Where(k => k.KPIAssignments.Any(a => scopedOfficeIds.Contains(a.OfficeId)));

        var kpiData = await unitOfWork.FYActiveKPIRepository.ToListAsync(
            kpiQuery.Select(k => new
            {
                k.Id,
                k.FunctionCategory,
                k.Status,
                Assignments = k.KPIAssignments.Where(a => !a.IsDeleted && (scopedOfficeIds == null || scopedOfficeIds.Contains(a.OfficeId))).Select(a => new
                {
                    a.OfficeId,
                    OfficeName = a.Office != null ? a.Office.Name : "Unassigned"
                })
            }),
            cancellationToken);

        var totalKPIs = kpiData.Count;

        var strategicKpis = kpiData.Where(k => (k.FunctionCategory ?? string.Empty).Equals("Strategic", StringComparison.OrdinalIgnoreCase)).ToList();
        var coreKpis = kpiData.Where(k => (k.FunctionCategory ?? string.Empty).Equals("Core", StringComparison.OrdinalIgnoreCase)).ToList();
        var supportKpis = kpiData.Where(k => (k.FunctionCategory ?? string.Empty).Equals("Support", StringComparison.OrdinalIgnoreCase)).ToList();

        List<KPIClassificationDivisionDto> MapDivisions(IEnumerable<dynamic> items)
        {
            var assignments = items.SelectMany(k => (IEnumerable<dynamic>)k.Assignments).ToList();
            var totalAssignments = assignments.Count;

            return assignments
                .GroupBy(a => new { a.OfficeId, a.OfficeName })
                .Select(g => new KPIClassificationDivisionDto
                {
                    OfficeId = g.Key.OfficeId,
                    Name = g.Key.OfficeName,
                    Count = g.Count(),
                    SharePercentage = totalAssignments > 0 ? Math.Round(((decimal)g.Count() / totalAssignments) * 100m, 1) : 0m
                })
                .OrderByDescending(d => d.Count)
                .ToList();
        }

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
                Divisions = MapDivisions(strategicKpis)
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
                Divisions = MapDivisions(coreKpis)
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
                Divisions = MapDivisions(supportKpis)
            }
        };

        return new KPIClassificationSummary
        {
            Total = totalKPIs,
            FiscalYear = DateTime.UtcNow.Year,
            Items = items
        };
    }

    private async Task<List<Guid>?> GetScopedOfficeIdsAsync(Guid? organizationId, CancellationToken cancellationToken)
    {
        if (organizationId == null)
            return null;

        var descendantIds = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => !o.IsDeleted && (o.Id == organizationId || o.ParentId == organizationId))
                .Select(o => o.Id),
            cancellationToken);

        return descendantIds.Count > 0 ? descendantIds : [organizationId.Value];
    }
}