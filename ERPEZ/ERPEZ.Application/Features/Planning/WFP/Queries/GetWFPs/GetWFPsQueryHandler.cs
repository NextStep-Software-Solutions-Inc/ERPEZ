using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPs;

public class GetWFPsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPsQuery, PaginatedApiResponse<Domain.Entities.Planning.WFP>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.WFP>> Handle(GetWFPsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (wfps, totalCount) = await unitOfWork.WFPRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.WFP>(
            [.. wfps],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
