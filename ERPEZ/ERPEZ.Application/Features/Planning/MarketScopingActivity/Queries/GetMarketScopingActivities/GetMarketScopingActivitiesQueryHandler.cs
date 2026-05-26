using ERPEZ.Application.Features.Planning.MarketScopingActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Queries.GetMarketScopingActivities;

public class GetMarketScopingActivitiesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingActivitiesQuery, PaginatedApiResponse<MarketScopingActivityResponse>>
{
    public async Task<PaginatedApiResponse<MarketScopingActivityResponse>> Handle(
        GetMarketScopingActivitiesQuery query, CancellationToken cancellationToken)
    {
        var activities = await unitOfWork.MarketScopingActivityRepository.GetByMarketScopingIdAsync(
            query.MarketScopingId, cancellationToken);

        var responses = activities.Select(x => new MarketScopingActivityResponse
        {
            Id = x.Id,
            MarketScopingId = x.MarketScopingId,
            ActivitySettingsId = x.ActivitySettingsId,
            ActivityType = x.ActivitySettings?.ActivityType,
            ActivityLabel = x.ActivitySettings?.Label,
            ActivityDescription = x.ActivitySettings?.Description
        }).ToList();

        var totalCount = responses.Count;
        var paginatedResult = responses
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToList();

        return new PaginatedApiResponse<MarketScopingActivityResponse>(
            paginatedResult,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
