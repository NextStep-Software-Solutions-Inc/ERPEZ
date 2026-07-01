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
        var pr = await unitOfWork.PurchaseRequestRepository.GetByIdAsync(
            query.PurchaseRequestId, cancellationToken)
            ?? throw new NotFoundException(
                $"Purchase Request with ID {query.PurchaseRequestId} not found.");

        if (pr.PRType != PRType.NonCSE)
            throw new ValidationException(
                "Eligible PPMPs are only applicable to Non-CSE Purchase Requests.");

        // Flat list from repo — already filters out zero-available items
        var flatItems = await unitOfWork.PurchaseRequestRepository
            .GetEligibleNonCSEItemsAsync(pr.OfficeId, cancellationToken);

        // Group by PPMP to match the modal's accordion structure (Image 4)
        var result = flatItems
            .GroupBy(i => new { i.PPMPId, i.PPMPNumber, i.OfficeId, i.OfficeName })
            .Select(g => new EligiblePPMPResponse(
                PPMPId:      g.Key.PPMPId,
                PPMPNumber:  g.Key.PPMPNumber,
                OfficeId:    g.Key.OfficeId,
                OfficeName:  g.Key.OfficeName,
                TotalAmount: g.Sum(i => i.TotalAllocatedAmount),
                Items: g.Select(i => new EligiblePPMPItemResponse(
                    PPMPItemId:           i.PPMPItemId,
                    ItemName:             i.ItemName,
                    Category:             i.Category,
                    Fund:                 i.Fund,
                    Unit:                 i.Unit,
                    UnitPrice:            i.UnitPrice,
                    MonthlyAllocations:   i.MonthlyAllocations
                        .ToDictionary(
                            kvp => (AllocationMonthEnum)kvp.Key,
                            kvp => kvp.Value),
                    TotalAllocated:       i.TotalAllocatedQuantity,
                    AlreadyRequested:     0,        // already excluded by repo
                    AvailableQuantity:    i.TotalAllocatedQuantity,
                    TotalAvailableAmount: i.TotalAllocatedAmount
                )).ToList()
            ))
            .ToList();

        return ApiResponse<List<EligiblePPMPResponse>>.Success(result);
    }
}