using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivities;

public class GetOPCRActivitiesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRActivitiesQuery, PaginatedApiResponse<Domain.Entities.Planning.OPCRActivity>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.OPCRActivity>> Handle(GetOPCRActivitiesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (opcrActivities, totalCount) = await unitOfWork.OPCRActivityRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.OPCRActivity>(
            [.. opcrActivities],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
