using ERPEZ.Application.Features.Procurement.PurchaseRequests.Common;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRById;

public class GetPRByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPRByIdQuery, ApiResponse<PurchaseRequestDetailResponse>>
{
    public async Task<ApiResponse<PurchaseRequestDetailResponse>> Handle(
        GetPRByIdQuery query, CancellationToken cancellationToken)
    {
        var pr = await unitOfWork.PurchaseRequestRepository.GetPRWithDetailsAsync(
            query.Id, cancellationToken)
            ?? throw new NotFoundException($"Purchase Request with ID {query.Id} not found.");

        var activeItems = pr.PRItems
            .Where(i => !i.IsDeleted)
            .ToList();

        // 1. Direct downstream CPR Project (Route 2)
        var directCPRIds = activeItems
            .SelectMany(i => i.ConsolidatedPRItems ?? Enumerable.Empty<ConsolidatedPRItem>())
            .Where(ci => !ci.IsDeleted)
            .Select(ci => ci.ConsolidatedPRId)
            .Distinct()
            .ToList();

        ProcurementProject? authoritativeProject = null;

        if (directCPRIds.Count > 0)
        {
            foreach (var cprId in directCPRIds)
            {
                var proj = await unitOfWork.ProcurementProjectRepository
                    .GetByConsolidatedPRIdWithResolutionsAsync(cprId, cancellationToken);
                if (proj != null)
                {
                    authoritativeProject = proj;
                    break;
                }
            }
        }

        // 2. Upstream Lineage Resolution via APP Items (Route 1)
        if (authoritativeProject == null)
        {
            var appItemIds = activeItems
                .SelectMany(i => (i.PPMPItem?.APPItems ?? i.APRItem?.PPMPItem?.APPItems ?? Enumerable.Empty<ERPEZ.Domain.Entities.Planning.APPItem>()))
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
                ProcurementProjectId: authoritativeProject?.Id ?? Guid.Empty,
                ProjectTitle:         authoritativeProject?.Title ?? string.Empty,
                ResolutionNumber:     r.ResolutionNumber,
                ResolutionType:       r.ResolutionType,
                DateResolved:         r.DateResolved,
                Status:               r.Status,
                ResolvedLocation:     r.ResolvedLocation,
                ABC:                  authoritativeProject?.ABC ?? 0,
                SourceType:           authoritativeProject?.SourceType.ToString() ?? string.Empty
            ))
            .ToList() ?? [];

        var response = new PurchaseRequestDetailResponse
        {
            Id                  = pr.Id,
            PRNumber            = pr.PRNumber,
            Description         = pr.Description,
            Purpose             = pr.Purpose,
            PRType              = pr.PRType.ToString(),
            Status              = pr.Status.ToString(),
            RequestedDate       = pr.RequestedDate,
            TotalAmount         = pr.TotalAmount,
            OfficeId            = pr.OfficeId,
            OfficeName          = pr.Office != null ? pr.Office.Name : string.Empty,
            UACSCode            = pr.UACSCodeCombination?.CombinationCode,
            FundSource          = pr.FundSource?.Name,
            ProcurementCategory = pr.ProcurementCategory?.Name,
            ReturnRemarks       = (pr.Status == StatusEnum.Approved || pr.Status == StatusEnum.Submitted)
                                    ? null
                                    : (string.IsNullOrWhiteSpace(pr.ReturnRemarks) ? null : pr.ReturnRemarks.Trim()),
            ReturnedDate        = (pr.Status == StatusEnum.Approved || pr.Status == StatusEnum.Submitted)
                                    ? null
                                    : pr.ReturnedDate,
            ReturnedBy          = (pr.Status == StatusEnum.Approved || pr.Status == StatusEnum.Submitted)
                                    ? null
                                    : (string.IsNullOrWhiteSpace(pr.ReturnedBy) ? null : pr.ReturnedBy.Trim()),
            Items = activeItems
                .Select(i => new PRItemDetailResponse
                {
                    Id                  = i.Id,
                    PPMPItemId          = i.PPMPItemId,
                    APRItemId           = i.APRItemId,
                    APRId               = i.APRItem?.APRId,
                    APRNumber           = i.APRItem?.APR?.APRNumber ?? (i.APRItemId.HasValue ? "APR" : null),
                    APROfficeName       = i.ResolveAPROfficeName(pr),
                    Name                = i.Name ?? string.Empty,
                    Description         = i.ResolveDescription(),
                    StockNo             = i.ResolveStockNo(),
                    IsNonCSE            = i.IsNonCSE,
                    UnitCost            = i.UnitCost,
                    RequestedQuantity   = i.RequestedQuantity,
                    Amount              = i.Amount,
                    RequestedMonth      = i.RequestedMonth,
                    Category            = i.ResolveCategory(),
                    Fund                = i.ResolveFund(pr),
                    PPMPId              = i.ResolvePPMPId(),
                    PPMPNumber          = i.ResolvePPMPNumber(),
                    Unit                = i.ResolveUnit(),
                    OfficeName          = i.ResolveOfficeName(pr),
                    ProcurementModeId   = i.ResolveProcurementModeId(),
                    ProcurementModeName = i.ResolveProcurementModeName()
                }).ToList(),
            BacResolutions = bacResolutions
        };

        return ApiResponse<PurchaseRequestDetailResponse>.Success(response);
    }
}