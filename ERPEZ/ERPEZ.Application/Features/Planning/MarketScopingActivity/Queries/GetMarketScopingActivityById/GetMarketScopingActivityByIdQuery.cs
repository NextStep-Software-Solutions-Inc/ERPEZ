using ERPEZ.Application.Features.Planning.MarketScopingActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Queries.GetMarketScopingActivityById;

public record GetMarketScopingActivityByIdQuery(Guid Id) : IRequest<ApiResponse<MarketScopingActivityResponse>>;

public class GetMarketScopingActivityByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingActivityByIdQuery, ApiResponse<MarketScopingActivityResponse>>
{
    public async Task<ApiResponse<MarketScopingActivityResponse>> Handle(
        GetMarketScopingActivityByIdQuery query, CancellationToken cancellationToken)
    {
        var activity = await unitOfWork.MarketScopingActivityRepository.GetByIdAsync(query.Id, cancellationToken);

        if (activity == null)
            return ApiResponse<MarketScopingActivityResponse>.Fail("Market Scoping Activity not found.");

        var result = new MarketScopingActivityResponse
        {
            Id = activity.Id,
            MarketScopingId = activity.MarketScopingId,
            ActivitySettingsId = activity.ActivitySettingsId,
            ActivityType = activity.ActivitySettings?.ActivityType,
            ActivityLabel = activity.ActivitySettings?.Label,
            ActivityDescription = activity.ActivitySettings?.Description
        };

        return ApiResponse<MarketScopingActivityResponse>.Success(result);
    }
}
