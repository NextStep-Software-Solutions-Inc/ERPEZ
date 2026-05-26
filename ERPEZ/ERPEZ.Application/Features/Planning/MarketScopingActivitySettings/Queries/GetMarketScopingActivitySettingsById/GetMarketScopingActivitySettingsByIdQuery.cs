using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Queries.GetMarketScopingActivitySettingsById;

public record GetMarketScopingActivitySettingsByIdQuery(Guid Id) : IRequest<ApiResponse<MarketScopingActivitySettingsResponse>>;

public class GetMarketScopingActivitySettingsByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingActivitySettingsByIdQuery, ApiResponse<MarketScopingActivitySettingsResponse>>
{
    public async Task<ApiResponse<MarketScopingActivitySettingsResponse>> Handle(GetMarketScopingActivitySettingsByIdQuery query, CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.MarketScopingActivitySettings, MarketScopingActivitySettingsResponse>> projection = x => new MarketScopingActivitySettingsResponse
        {
            Id = x.Id,
            ActivityType = x.ActivityType,
            Label = x.Label,
            Description = x.Description,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive
        };

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
