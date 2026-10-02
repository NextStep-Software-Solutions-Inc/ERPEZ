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
                .SelectMany(i => i.PPMPItem?.APPItems ?? Enumerable.Empty<ERPEZ.Domain.Entities.Planning.APPItem>())
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
            OfficeName          = pr.Office.Name,
            UACSCode            = pr.UACSCodeCombination?.CombinationCode,
            FundSource          = pr.FundSource?.Name,
            ProcurementCategory = pr.ProcurementCategory?.Name,
            ReturnRemarks       = pr.ReturnRemarks,
            ReturnedDate        = pr.ReturnedDate,
            ReturnedBy          = pr.ReturnedBy,
            Items = activeItems
                .Select(i => new PRItemDetailResponse
                {
                    Id                = i.Id,
                    PPMPItemId        = i.PPMPItemId,
                    APRItemId         = i.APRItemId,
                    APRId             = i.APRItem?.APRId,
                    APRNumber         = i.APRItem?.APR?.APRNumber,
                    APROfficeName     = i.APRItem?.APR?.Office?.Name,
                    Name              = i.Name,
                    Description       = !string.IsNullOrWhiteSpace(i.Description) 
                                        ? i.Description 
                                        : (!string.IsNullOrWhiteSpace(i.PPMPItem?.Description) 
                                            ? i.PPMPItem.Description 
                                            : (!string.IsNullOrWhiteSpace(i.PPMPItem?.NonCSEItem?.Description)
                                                ? i.PPMPItem.NonCSEItem.Description
                                                : i.APRItem?.Description)),
                    StockNo           = i.StockNo ?? i.APRItem?.ItemCode,
                    IsNonCSE          = i.IsNonCSE,
                    UnitCost          = i.UnitCost,
                    RequestedQuantity = i.RequestedQuantity,
                    Amount            = i.Amount,
                    RequestedMonth    = i.RequestedMonth,
                    Category          = i.PPMPItem?.NonCSEItem?.ItemCategory?.Name 
                                        ?? i.PPMPItem?.CSEItem?.ItemCategory?.Name 
                                        ?? i.APRItem?.PPMPItem?.CSEItem?.ItemCategory?.Name
                                        ?? i.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.LIBActivity?.Name
                                        ?? i.PPMPItem?.ProjectType.ToString() 
                                        ?? (i.APRItemId.HasValue ? "Out-of-Stock CSE" : string.Empty),
                    Fund              = i.PPMPItem?.PPMPExpenditureItem?.PPMP?.FundSource?.Name
                                        ?? i.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.FundSource?.Name
                                        ?? i.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.FundSource?.Name
                                        ?? pr.FundSource?.Name 
                                        ?? string.Empty,
                    PPMPId            = i.PPMPItem?.PPMPExpenditureItem?.PPMPId 
                                        ?? i.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMPId,
                    PPMPNumber        = i.PPMPItem?.PPMPExpenditureItem?.PPMP?.PPMPNumber 
                                        ?? i.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.PPMPNumber,
                    Unit              = i.APRItem?.Unit
                                        ?? i.PPMPItem?.Unit 
                                        ?? i.PPMPItem?.NonCSEItem?.UOM?.Name 
                                        ?? i.PPMPItem?.CSEItem?.UOM?.Name 
                                        ?? i.APRItem?.PPMPItem?.Unit
                                        ?? i.APRItem?.PPMPItem?.CSEItem?.UOM?.Name
                                        ?? "unit",
                    OfficeName        = i.PPMPItem?.PPMPExpenditureItem?.PPMP?.Office?.Name
                                        ?? i.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.Office?.Name
                                        ?? i.APRItem?.APR?.Office?.Name
                                        ?? pr.Office?.Name,
                    ProcurementModeId = i.ConsolidatedPRItems?.OrderByDescending(ci => ci.CreatedAt).FirstOrDefault(ci => !ci.IsDeleted && ci.ProcurementModeId.HasValue)?.ProcurementModeId
                                        ?? i.PPMPItem?.APPItems?.Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                                            .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == StatusEnum.Approved || ai.APP.Status == StatusEnum.Active) ? 2 : 1)
                                            .ThenByDescending(ai => ai.CreatedAt)
                                            .FirstOrDefault()?.ProcurementModeId
                                        ?? (i.PPMPItem?.ProcurementModeId is Guid pmId && pmId != Guid.Empty ? (Guid?)pmId : null)
                                        ?? i.APRItem?.APPItem?.ProcurementModeId
                                        ?? (i.APRItem?.PPMPItem?.ProcurementModeId is Guid aprPmId && aprPmId != Guid.Empty ? (Guid?)aprPmId : null),
                    ProcurementModeName = i.ConsolidatedPRItems?.OrderByDescending(ci => ci.CreatedAt).FirstOrDefault(ci => !ci.IsDeleted && ci.ProcurementMode != null)?.ProcurementMode?.Name
                                          ?? i.PPMPItem?.APPItems?.Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                                              .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == StatusEnum.Approved || ai.APP.Status == StatusEnum.Active) ? 2 : 1)
                                              .ThenByDescending(ai => ai.CreatedAt)
                                              .FirstOrDefault()?.ProcurementMode?.Name
                                          ?? i.PPMPItem?.ProcurementMode?.Name
                                          ?? i.APRItem?.APPItem?.ProcurementMode?.Name
                                          ?? i.APRItem?.PPMPItem?.ProcurementMode?.Name
                }).ToList(),
            BacResolutions = bacResolutions
        };

        return ApiResponse<PurchaseRequestDetailResponse>.Success(response);
    }
}