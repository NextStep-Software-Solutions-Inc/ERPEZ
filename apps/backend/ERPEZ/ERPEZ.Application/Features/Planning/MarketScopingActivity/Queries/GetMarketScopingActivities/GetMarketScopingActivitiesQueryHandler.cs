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
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var (activities, totalCount) = await unitOfWork.MarketScopingActivityRepository.GetByMarketScopingIdAsync(
            query.MarketScopingId, sieveModel, cancellationToken);

        var responses = activities.Select(x => new MarketScopingActivityResponse
        {
            Id = x.Id,
            MarketScopingId = x.MarketScopingId,
            ActivitySettingsId = x.ActivitySettingsId,
            ActivityType = x.ActivitySettings?.ActivityType,
            ActivityLabel = x.ActivitySettings?.Label,
            ActivityDescription = x.ActivitySettings?.Description
        }).ToList();

        return new PaginatedApiResponse<MarketScopingActivityResponse>(
            responses,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
