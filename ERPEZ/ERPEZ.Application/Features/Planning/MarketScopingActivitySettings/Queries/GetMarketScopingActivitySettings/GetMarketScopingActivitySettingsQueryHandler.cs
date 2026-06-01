using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Queries.GetMarketScopingActivitySettings;

public class GetMarketScopingActivitySettingsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingActivitySettingsQuery, PaginatedApiResponse<MarketScopingActivitySettingsResponse>>
{
    public async Task<PaginatedApiResponse<MarketScopingActivitySettingsResponse>> Handle(GetMarketScopingActivitySettingsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.MarketScopingActivitySettings, MarketScopingActivitySettingsResponse>> projection = x => new MarketScopingActivitySettingsResponse
        {
            Id = x.Id,
            ActivityType = x.ActivityType,
            Label = x.Label,
            Description = x.Description,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive
        };

        var (activitySettings, totalCount) = await unitOfWork.MarketScopingActivitySettingsRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<MarketScopingActivitySettingsResponse>(
            [.. activitySettings],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
