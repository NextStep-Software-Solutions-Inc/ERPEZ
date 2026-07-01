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
        _ = await unitOfWork.PurchaseRequestRepository.GetByIdAsync(
            query.PurchaseRequestId, cancellationToken)
            ?? throw new NotFoundException(
                $"Purchase Request with ID {query.PurchaseRequestId} not found.");

        // Stub — pending Dev B's APR module
        var result = await unitOfWork.PurchaseRequestRepository
            .GetEligibleOutOfStockItemsAsync(query.PurchaseRequestId, cancellationToken);

        return ApiResponse<List<EligibleAPRResponse>>.Success([]);
    }
}