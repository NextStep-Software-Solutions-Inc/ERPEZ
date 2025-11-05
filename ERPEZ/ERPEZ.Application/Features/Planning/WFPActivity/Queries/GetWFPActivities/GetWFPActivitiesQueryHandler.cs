using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Queries.GetWFPActivities;

public class GetWFPActivitiesQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetWFPActivitiesQuery, PaginatedApiResponse<Domain.Entities.Planning.WFPActivity>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.WFPActivity>> Handle(GetWFPActivitiesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (wfpActivities, totalCount) = await _unitOfWork.WFPActivityRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.WFPActivity>(
            [.. wfpActivities],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
