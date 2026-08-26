using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligibleConsolidatedPRs;

public class GetEligibleConsolidatedPRsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetEligibleConsolidatedPRsQuery, ApiResponse<List<EligibleConsolidatedPRDto>>>
{
    public async Task<ApiResponse<List<EligibleConsolidatedPRDto>>> Handle(
        GetEligibleConsolidatedPRsQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Find all active procurement projects linked to a ConsolidatedPR
        var activeProjects = await unitOfWork.ProcurementProjectRepository
            .FindAllAsync(p => p.ConsolidatedPRId.HasValue && p.Status != "Cancelled", cancellationToken);

        var activeCprSet = activeProjects.Select(p => p.ConsolidatedPRId!.Value).ToHashSet();

        // 2. Query approved Consolidated PRs
        var approvedCprs = await unitOfWork.ConsolidatedPRRepository
            .GetAllApprovedWithDetailsAsync(cancellationToken);

        var result = new List<EligibleConsolidatedPRDto>();

        foreach (var cpr in approvedCprs)
        {
            if (activeCprSet.Contains(cpr.Id))
            {
                continue; // Skip CPRs already linked to an active ProcurementProject
            }

            var firstItem = cpr.ConsolidatedPRItems.FirstOrDefault();
            string endUser = firstItem?.PurchaseRequest?.Office?.Name ?? "Consolidated Implementing Units";
            string modeName = firstItem?.ProcurementMode?.Name ?? "Public Bidding";
            Guid? modeId = firstItem?.ProcurementModeId;

            result.Add(new EligibleConsolidatedPRDto
            {
                Id = cpr.Id,
                PRNumber = cpr.CPRNumber,
                Description = cpr.Description ?? cpr.CPRNumber,
                EndUser = endUser,
                ProjectName = cpr.Description ?? cpr.CPRNumber,
                TotalAmount = cpr.TotalAmount,
                ModeOfProcurementName = modeName,
                ProcurementModeId = modeId
            });
        }

        return ApiResponse<List<EligibleConsolidatedPRDto>>.Success(result);
    }
}
