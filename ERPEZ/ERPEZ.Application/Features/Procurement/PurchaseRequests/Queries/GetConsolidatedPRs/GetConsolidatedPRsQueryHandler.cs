using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetConsolidatedPRs;

public class GetConsolidatedPRsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetConsolidatedPRsQuery, PaginatedApiResponse<ConsolidatedPRSummaryResponse>>
{
    public async Task<PaginatedApiResponse<ConsolidatedPRSummaryResponse>> Handle(
        GetConsolidatedPRsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page     = query.PageNumber,
            Filters  = query.Filters,
            Sorts    = query.Sorts
        };

        System.Linq.Expressions.Expression<Func<ConsolidatedPR, ConsolidatedPRSummaryResponse>>
            projection = cpr => new ConsolidatedPRSummaryResponse(
                cpr.Id,
                cpr.CPRNumber,
                cpr.ConsolidationDate,
                cpr.Description,
                cpr.Status.ToString()
            );

        var (items, totalCount) = await unitOfWork.ConsolidatedPRRepository
            .GetCPRsWithDetailsAsync(sieveModel, projection, [], cancellationToken);

        return new PaginatedApiResponse<ConsolidatedPRSummaryResponse>(
            [.. items],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}