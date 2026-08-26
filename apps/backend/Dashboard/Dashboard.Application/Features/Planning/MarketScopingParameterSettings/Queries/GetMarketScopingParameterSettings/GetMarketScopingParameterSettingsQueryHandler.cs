using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Queries.GetMarketScopingParameterSettings;

public class GetMarketScopingParameterSettingsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingParameterSettingsQuery, PaginatedApiResponse<MarketScopingParameterSettingsResponse>>
{
    public async Task<PaginatedApiResponse<MarketScopingParameterSettingsResponse>> Handle(GetMarketScopingParameterSettingsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.MarketScopingParameterSettings, MarketScopingParameterSettingsResponse>> projection = x => new MarketScopingParameterSettingsResponse
        {
            Id = x.Id,
            Name = x.Name,
            GuidedQuestion = x.GuidedQuestion,
            Description = x.Description,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive
        };

        var (parameterSettings, totalCount) = await unitOfWork.MarketScopingParameterSettingsRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<MarketScopingParameterSettingsResponse>(
            [.. parameterSettings],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
