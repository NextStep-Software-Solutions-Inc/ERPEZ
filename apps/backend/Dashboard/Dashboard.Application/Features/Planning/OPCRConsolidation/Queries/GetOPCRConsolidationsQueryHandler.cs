using ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Queries;

public class GetOPCRConsolidationsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRConsolidationsQuery, PaginatedApiResponse<OPCRConsolidationsResponse>>
{
    public async Task<PaginatedApiResponse<OPCRConsolidationsResponse>> Handle(
        GetOPCRConsolidationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        System.Linq.Expressions.Expression<Func<Domain.Entities.Planning.OPCRConsolidation, OPCRConsolidationsResponse>> projection = c => new OPCRConsolidationsResponse
        {
            Id = c.Id,
            Name = c.Name,
            FiscalYearId = c.FiscalYearId,
            FiscalYear = c.FiscalYear.Year,
            OPCRCount = c.OPCRs.Count,
            CreatedDate = DateOnly.FromDateTime(c.CreatedAt),
        };

        var (consolidations, totalCount) = await unitOfWork.OPCRConsolidationRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<OPCRConsolidationsResponse>(
            [.. consolidations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}