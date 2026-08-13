using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligibleAPRs;

public class GetEligibleAPRsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetEligibleAPRsQuery, ApiResponse<List<EligibleAPRResponse>>>
{
    public async Task<ApiResponse<List<EligibleAPRResponse>>> Handle(
        GetEligibleAPRsQuery query, CancellationToken cancellationToken)
    {
        var pr = await unitOfWork.PurchaseRequestRepository.GetByIdAsync(
            query.PurchaseRequestId, cancellationToken)
            ?? throw new NotFoundException(
                $"Purchase Request with ID {query.PurchaseRequestId} not found.");

        var flatItems = await unitOfWork.PurchaseRequestRepository
            .GetEligibleOutOfStockItemsAsync(pr.OfficeId, cancellationToken);

        var result = flatItems
            .GroupBy(i => new { i.APRId, i.APRNumber, i.OfficeId, i.OfficeName })
            .Select(g => new EligibleAPRResponse(
                APRId:       g.Key.APRId,
                APRNumber:   g.Key.APRNumber,
                OfficeId:    g.Key.OfficeId,
                OfficeName:  g.Key.OfficeName,
                TotalAmount: g.Sum(i => i.TotalRequired * i.UnitPrice),
                Items: g.Select(i => new EligibleAPRItemResponse(
                    APRItemId:          i.APRItemId,
                    ItemName:           i.ItemName,
                    Category:           i.Category,
                    Fund:               i.Fund,
                    Unit:               i.Unit,
                    UnitPrice:          i.UnitPrice,
                    MonthlyAllocations: i.MonthlyAllocations,
                    TotalRequired:      i.TotalRequired,
                    CurrentFulfilled:   i.CurrentFulfilled,
                    Deficit:            i.Deficit
                )).ToList()
            ))
            .ToList();

        return ApiResponse<List<EligibleAPRResponse>>.Success(result);
    }
}