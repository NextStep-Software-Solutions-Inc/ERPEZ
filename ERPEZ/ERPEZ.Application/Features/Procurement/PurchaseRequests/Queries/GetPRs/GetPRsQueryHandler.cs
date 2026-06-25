using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRs;

public class GetPRsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPRsQuery, PaginatedApiResponse<PurchaseRequestSummaryResponse>>
{
    public async Task<PaginatedApiResponse<PurchaseRequestSummaryResponse>> Handle(
        GetPRsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page     = query.PageNumber,
            Filters  = query.Filters,
            Sorts    = query.Sorts
        };

        System.Linq.Expressions.Expression<Func<PurchaseRequest, PurchaseRequestSummaryResponse>>
            projection = pr => new PurchaseRequestSummaryResponse
            {
                Id            = pr.Id,
                PRNumber      = pr.PRNumber,
                Description   = pr.Description,
                PRType        = pr.PRType.ToString(),
                Status        = pr.Status.ToString(),
                TotalAmount   = pr.TotalAmount,
                RequestedDate = pr.RequestedDate,
                CreatedDate   = DateOnly.FromDateTime(pr.CreatedAt)
            };

        var (items, totalCount) = await unitOfWork.PurchaseRequestRepository
            .GetPRsWithDetailsAsync(sieveModel, projection, [], cancellationToken);

        return new PaginatedApiResponse<PurchaseRequestSummaryResponse>(
            [.. items],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}