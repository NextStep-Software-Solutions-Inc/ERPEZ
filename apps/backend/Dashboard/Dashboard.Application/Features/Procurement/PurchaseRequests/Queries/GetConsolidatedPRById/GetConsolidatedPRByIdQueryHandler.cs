using ERPEZ.Application.Features.Procurement.PurchaseRequests.Common;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetConsolidatedPRById;

public class GetConsolidatedPRByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetConsolidatedPRByIdQuery, ApiResponse<ConsolidatedPRDetailResponse>>
{
    public async Task<ApiResponse<ConsolidatedPRDetailResponse>> Handle(
        GetConsolidatedPRByIdQuery query, CancellationToken cancellationToken)
    {
        var cpr = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(
            query.Id, cancellationToken)
            ?? throw new NotFoundException($"Consolidated PR with ID {query.Id} not found.");

        var activeItems = cpr.ConsolidatedPRItems
            .Where(ci => !ci.IsDeleted)
            .ToList();

        var prs = activeItems
            .GroupBy(ci => ci.PurchaseRequestId)
            .Select(g =>
            {
                var pr = g.First().PurchaseRequest;

                return new ConsolidatedPRLinkedPrResponse(
                    PurchaseRequestId: pr.Id,
                    PRNumber:          pr.PRNumber,
                    OfficeId:          pr.OfficeId,
                    OfficeName:        pr.Office.Name,
                    PRType:            pr.PRType.ToString(),
                    TotalAmount:       g.Sum(ci => ci.PRItem.Amount),
                    Items: g.Select(ci => new ConsolidatedPRItemResponse(
                        PRItemId:             ci.PRItemId,
                        ConsolidatedPRItemId: ci.Id,
                        Name:                 ci.PRItem.Name,
                        Description:          ci.PRItem.ResolveDescription(),
                        Category:             ci.PRItem.ResolveCategory(),
                        Fund:                 ci.PRItem.ResolveFund(pr),
                        Unit:                 ci.PRItem.ResolveUnit(),
                        UnitPrice:            ci.PRItem.UnitCost,
                        TotalQuantity:        ci.PRItem.RequestedQuantity,
                        TotalAmount:          ci.PRItem.Amount,
                        StockNo:              ci.PRItem.ResolveStockNo(),
                        MonthlyQuantities:    new Dictionary<string, int> { { ((int)ci.PRItem.RequestedMonth).ToString("D2"), ci.PRItem.RequestedQuantity } },
                        ProcurementModeId:    ci.PRItem.ResolveProcurementModeId(ci),
                        AllowPartial:         ci.AllowPartial,
                        ProcurementModeName:  ci.PRItem.ResolveProcurementModeName(ci)
                    )).ToList()
                );
            })
            .ToList();

        var firstMode = activeItems
            .Select(ci => ci.PRItem.ResolveProcurementModeName(ci))
            .FirstOrDefault(m => !string.IsNullOrEmpty(m));

        // 1. Direct CPR Project (Route 2)
        var directProject = await unitOfWork.ProcurementProjectRepository
            .GetByConsolidatedPRIdWithResolutionsAsync(cpr.Id, cancellationToken);

        ProcurementProject? authoritativeProject = directProject;

        // 2. Lineage Resolution via APP Items (Route 1)
        if (authoritativeProject == null)
        {
            var appItemIds = activeItems
                .SelectMany(ci => ci.PRItem.PPMPItem?.APPItems ?? Enumerable.Empty<ERPEZ.Domain.Entities.Planning.APPItem>())
                .Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                .Select(ai => ai.Id)
                .Distinct()
                .ToList();

            if (appItemIds.Count > 0)
            {
                var lineageProjects = await unitOfWork.ProcurementProjectRepository
                    .GetByAPPItemIdsWithResolutionsAsync(appItemIds, cancellationToken);

                authoritativeProject = lineageProjects
                    .OrderByDescending(p => p.Status == "Approved" ? 2 : (p.Status == "Active" ? 1 : 0))
                    .ThenByDescending(p => p.CreatedAt)
                    .FirstOrDefault();
            }
        }

        var bacResolutions = authoritativeProject?.BACResolutions
            .Where(r => !r.IsDeleted)
            .OrderByDescending(r => r.Status == "Approved" ? 2 : (r.Status == "Active" ? 1 : 0))
            .ThenByDescending(r => r.DateResolved)
            .ThenByDescending(r => r.CreatedAt)
            .Select(r => new ConsolidatedPRBacResolutionResponse(
                Id:                   r.Id,
                ProcurementProjectId: authoritativeProject.Id,
                ProjectTitle:         authoritativeProject.Title,
                ResolutionNumber:     r.ResolutionNumber,
                ResolutionType:       r.ResolutionType,
                DateResolved:         r.DateResolved,
                Status:               r.Status,
                ResolvedLocation:     r.ResolvedLocation,
                ABC:                  authoritativeProject.ABC,
                SourceType:           authoritativeProject.SourceType.ToString()
            ))
            .ToList() ?? [];

        var response = new ConsolidatedPRDetailResponse(
            Id:                cpr.Id,
            CPRNumber:         cpr.CPRNumber,
            ConsolidationDate: cpr.ConsolidationDate,
            Description:       cpr.Description,
            Purpose:           cpr.Purpose,
            Status:            cpr.Status,
            TotalAmount:       activeItems.Sum(ci => ci.PRItem.Amount), // computed, not stale cpr.TotalAmount
            Remarks:           cpr.Remarks,
            Prs:               prs,
            ModeOfProcurement: firstMode,
            BacResolutions:    bacResolutions
        );

        return ApiResponse<ConsolidatedPRDetailResponse>.Success(response);
    }
}