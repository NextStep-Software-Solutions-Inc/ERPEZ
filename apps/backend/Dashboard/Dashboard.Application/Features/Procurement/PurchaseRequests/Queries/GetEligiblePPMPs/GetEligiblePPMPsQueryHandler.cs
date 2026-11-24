using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligiblePPMPs;

public class GetEligiblePPMPsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetEligiblePPMPsQuery, ApiResponse<List<EligiblePPMPResponse>>>
{
    public async Task<ApiResponse<List<EligiblePPMPResponse>>> Handle(
        GetEligiblePPMPsQuery query, CancellationToken cancellationToken)
    {
        Guid officeId;
        Guid? currentPrId = null;

        if (query.PurchaseRequestId.HasValue)
        {
            var pr = await unitOfWork.PurchaseRequestRepository.GetByIdAsync(
                query.PurchaseRequestId.Value, cancellationToken)
                ?? throw new NotFoundException(
                    $"Purchase Request with ID {query.PurchaseRequestId.Value} not found.");

            if (pr.PRType != PRType.NonCSE)
                throw new ValidationException(
                    "Eligible PPMPs are only applicable to Non-CSE Purchase Requests.");

            officeId = pr.OfficeId;
            currentPrId = pr.Id;
        }
        else if (query.OfficeId.HasValue)
        {
            _ = await unitOfWork.OfficeRepository.GetByIdAsync(
                query.OfficeId.Value, cancellationToken)
                ?? throw new NotFoundException(
                    $"Office with ID {query.OfficeId.Value} not found.");

            officeId = query.OfficeId.Value;
        }
        else
        {
            throw new ValidationException("Either OfficeId or PurchaseRequestId must be provided.");
        }

        // Flat list from repo — already filters by office, approved PPMP, approved APP, and available allocation > 0
        var flatItems = await unitOfWork.PurchaseRequestRepository
            .GetEligibleNonCSEItemsAsync(officeId, currentPrId, cancellationToken);

        // Group by PPMP to match the modal's accordion structure (Image 4)
        var result = flatItems
            .GroupBy(i => new { i.PPMPId, i.PPMPNumber, i.OfficeId, i.OfficeName })
            .Select(g => new EligiblePPMPResponse(
                PPMPId:      g.Key.PPMPId,
                PPMPNumber:  g.Key.PPMPNumber,
                OfficeId:    g.Key.OfficeId,
                OfficeName:  g.Key.OfficeName,
                TotalAmount: g.Sum(i => i.TotalAvailableAmount),
                Items: g.GroupBy(item => new { 
                        item.PPMPItemId, 
                        item.ItemName, 
                        item.Description,
                        item.Category, 
                        item.ItemCategory,
                        item.UacsCode,
                        item.Fund, 
                        item.Unit, 
                        item.UnitPrice,
                        item.HasMonthlyAllocations,
                        item.PlannedQuantity,
                        item.TotalAvailableQuantity,
                        item.ProcurementModeId,
                        item.ProcurementModeName
                    })
                    .Select(ig => new EligiblePPMPItemResponse(
                        PPMPItemId:           ig.Key.PPMPItemId,
                        ItemName:             ig.Key.ItemName,
                        Description:          ig.Key.Description,
                        Category:             ig.Key.Category,
                        ItemCategory:         ig.Key.ItemCategory,
                        UacsCode:             ig.Key.UacsCode,
                        Fund:                 ig.Key.Fund,
                        Unit:                 ig.Key.Unit,
                        UnitPrice:            ig.Key.UnitPrice,
                        HasMonthlyAllocations:ig.Key.HasMonthlyAllocations,
                        PlannedQuantity:      ig.Key.PlannedQuantity,
                        AvailableQuantity:    ig.Key.HasMonthlyAllocations ? ig.Sum(m => m.AvailableQuantity) : ig.Key.TotalAvailableQuantity,
                        MonthlyAllocations:   ig.Key.HasMonthlyAllocations
                            ? ig.Where(m => m.Month.HasValue).Select(m => new EligiblePPMPItemMonthAllocation(
                                Month:                m.Month!.Value,
                                TotalAllocated:       m.TotalAllocatedQuantity,
                                AvailableQuantity:    m.AvailableQuantity,
                                TotalAvailableAmount: m.TotalAvailableAmount
                            )).ToList()
                            : new List<EligiblePPMPItemMonthAllocation>(),
                        TotalAvailableAmount: ig.Key.HasMonthlyAllocations
                            ? ig.Sum(m => m.TotalAvailableAmount)
                            : ig.Key.TotalAvailableQuantity * ig.Key.UnitPrice,
                        ProcurementModeId:    ig.Key.ProcurementModeId,
                        ProcurementModeName:  ig.Key.ProcurementModeName
                    )).ToList()
            ))
            .ToList();

        return ApiResponse<List<EligiblePPMPResponse>>.Success(result);
    }
}