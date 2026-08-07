using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Queries.GetMarketScopingActivitySettingsById;

public record GetMarketScopingActivitySettingsByIdQuery(Guid Id) : IRequest<ApiResponse<MarketScopingActivitySettingsResponse>>;

public class GetMarketScopingActivitySettingsByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingActivitySettingsByIdQuery, ApiResponse<MarketScopingActivitySettingsResponse>>
{
    public async Task<ApiResponse<MarketScopingActivitySettingsResponse>> Handle(GetMarketScopingActivitySettingsByIdQuery query, CancellationToken cancellationToken)
    {
        var activitySettings = await unitOfWork.MarketScopingActivitySettingsRepository.GetByIdAsync(query.Id, cancellationToken);

        if (activitySettings == null)
            return ApiResponse<MarketScopingActivitySettingsResponse>.Fail("Market Scoping Activity Settings not found.");

        var result = new MarketScopingActivitySettingsResponse
        {
            Id = activitySettings.Id,
            ActivityType = activitySettings.ActivityType,
            Label = activitySettings.Label,
            Description = activitySettings.Description,
            SortOrder = activitySettings.SortOrder,
            IsActive = activitySettings.IsActive
        };

        return ApiResponse<MarketScopingActivitySettingsResponse>.Success(result);
    }
}
