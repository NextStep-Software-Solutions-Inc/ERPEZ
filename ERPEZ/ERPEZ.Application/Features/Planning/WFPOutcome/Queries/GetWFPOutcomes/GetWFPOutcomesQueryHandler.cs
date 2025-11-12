using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Queries.GetWFPOutcomes;

public class GetWFPOutcomesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPOutcomesQuery, PaginatedApiResponse<Domain.Entities.Planning.WFPOutcome>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.WFPOutcome>> Handle(GetWFPOutcomesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (wfpOutcomes, totalCount) = await unitOfWork.WFPOutcomeRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.WFPOutcome>(
            [.. wfpOutcomes],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}