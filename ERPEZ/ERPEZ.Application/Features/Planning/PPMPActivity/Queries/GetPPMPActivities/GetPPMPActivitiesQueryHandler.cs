using ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Queries.GetPPMPActivities;

public class GetPPMPActivitiesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPPMPActivitiesQuery, PaginatedApiResponse<PPMPActivityResponse>>
{
    public async Task<PaginatedApiResponse<PPMPActivityResponse>> Handle(GetPPMPActivitiesQuery query, CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.PPMPActivity, PPMPActivityResponse>> projection = activity => new PPMPActivityResponse
        {
            Id = activity.Id,
            PPMPId = activity.PPMPId,
            LIBActivityId = activity.LIBActivityId,
            ActivityName = activity.LIBActivity.Name,
            CreatedAt = activity.CreatedAt,
            CreatedBy = activity.CreatedBy
        };

        var (items, totalCount) = await unitOfWork.PPMPActivityRepository.GetAllAsync(
            query.SieveModel,
            projection,
            cancellationToken);

        var pageNumber = query.SieveModel.Page ?? 1;
        var pageSize = query.SieveModel.PageSize ?? 10;

        return new PaginatedApiResponse<PPMPActivityResponse>(items.ToList(), totalCount, pageNumber, pageSize);
    }
}
