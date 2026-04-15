using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBSummary;

public class GetLIBSummaryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBSummaryQuery, ApiResponse<LIBDashboardSummaryResponse>>
{
    public async Task<ApiResponse<LIBDashboardSummaryResponse>> Handle(GetLIBSummaryQuery query, CancellationToken cancellationToken)
    {
        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {query.Id} not found.");

        // Load details with Object→ObjectExpenseClasses→ExpenseClass chain
        var details = await unitOfWork.LineItemBudgetDetailRepository
            .GetDetailsByLibIdAsync(query.Id, cancellationToken);

        // Activity rows
        var activityRows = lib.LineItemBudgetActivities
            .Where(a => !a.IsDeleted)
            .Select(activity =>
            {
                var activityDetails = details.Where(d => d.LineItemBudgetActivityId == activity.Id).ToList();
                return new LIBSummaryActivityRow
                {
                    ActivityId = activity.Id,
                    ActivityName = activity.Name,
                    PersonnelServices = activityDetails
                        .Where(d => d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass?.Type == ExpenseClassTypeEnum.PersonnelServices)
                        .Sum(d => d.Budget),
                    MOOE = activityDetails
                        .Where(d => d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass?.Type == ExpenseClassTypeEnum.MaintenanceAndOperatingExpenses)
                        .Sum(d => d.Budget),
                    CapitalOutlay = activityDetails
                        .Where(d => d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass?.Type == ExpenseClassTypeEnum.CapitalOutlay)
                        .Sum(d => d.Budget),
                    Financial = activityDetails
                        .Where(d => d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass?.Type == ExpenseClassTypeEnum.FinancialExpenses)
                        .Sum(d => d.Budget),
                    Total = activityDetails.Sum(d => d.Budget)
                };
            })
            .ToList();

        // Grand totals
        var grandTotals = new LIBSummaryTotals
        {
            PersonnelServices = details
                .Where(d => d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass?.Type == ExpenseClassTypeEnum.PersonnelServices)
                .Sum(d => d.Budget),
            MOOE = details
                .Where(d => d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass?.Type == ExpenseClassTypeEnum.MaintenanceAndOperatingExpenses)
                .Sum(d => d.Budget),
            CapitalOutlay = details
                .Where(d => d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass?.Type == ExpenseClassTypeEnum.CapitalOutlay)
                .Sum(d => d.Budget),
            Financial = details
                .Where(d => d.Object?.ObjectExpenseClasses.FirstOrDefault(oc => oc.IsActive)?.ExpenseClass?.Type == ExpenseClassTypeEnum.FinancialExpenses)
                .Sum(d => d.Budget),
            Grand = details.Sum(d => d.Budget)
        };

        // UACS breakdown by Object
        var uacsBreakdown = details
            .GroupBy(d => d.ObjectId)
            .Select(g => new LIBSummaryUACSRow
            {
                ObjectId = g.Key,
                ObjectCode = g.First().Object?.Code ?? string.Empty,
                ObjectName = g.First().Object?.Name ?? string.Empty,
                Total = g.Sum(d => d.Budget)
            })
            .OrderBy(x => x.ObjectCode)
            .ToList();

        // Office Ceiling info
        LIBSummaryCeilingInfo? ceilingInfo = null;
        if (lib.FiscalYearId.HasValue && lib.OfficeId.HasValue)
        {
            var ceiling = await unitOfWork.OfficeCeilingRepository.FindAsync(
                x => x.FiscalYearId == lib.FiscalYearId.Value && x.OfficeId == lib.OfficeId.Value && !x.IsDeleted,
                cancellationToken);

            if (ceiling != null)
            {
                ceilingInfo = new LIBSummaryCeilingInfo
                {
                    PSCeiling = ceiling.PSAmount,
                    MOOECeiling = ceiling.MOOEAmount,
                    COCeiling = ceiling.COAmount,
                    PSConsumed = grandTotals.PersonnelServices,
                    MOOEConsumed = grandTotals.MOOE,
                    COConsumed = grandTotals.CapitalOutlay,
                    CeilingStatus = ceiling.Status
                };
            }
        }

        var response = new LIBDashboardSummaryResponse
        {
            LibId = lib.Id,
            LIBNumber = lib.LIBNumber,
            Name = lib.Name ?? string.Empty,
            Status = lib.Status,
            Version = lib.Version,
            Activities = activityRows,
            GrandTotals = grandTotals,
            UACSBreakdown = uacsBreakdown,
            CeilingInfo = ceilingInfo
        };

        return ApiResponse<LIBDashboardSummaryResponse>.Success(response);
    }
}
