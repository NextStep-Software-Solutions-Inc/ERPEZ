using ERPEZ.Application.Features.Planning.MarketScopingParameter.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Queries.GetMarketScopingParameters;

public class GetMarketScopingParametersQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingParametersQuery, PaginatedApiResponse<MarketScopingParameterResponse>>
{
    public async Task<PaginatedApiResponse<MarketScopingParameterResponse>> Handle(
        GetMarketScopingParametersQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var parameters = await unitOfWork.MarketScopingParameterRepository.GetByMarketScopingIdAsync(
            query.MarketScopingId, cancellationToken);

        var responses = parameters.Select(x => new MarketScopingParameterResponse
        {
            Id = x.Id,
            MarketScopingId = x.MarketScopingId,
            ParameterSettingsId = x.ParameterSettingsId,
            ParameterName = x.ParameterSettings?.Name,
            GuidedQuestion = x.ParameterSettings?.GuidedQuestion,
            IsConsidered = x.IsConsidered,
            Remarks = x.Remarks
        }).ToList();

        var totalCount = responses.Count;
        var paginatedResult = responses
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToList();

        return new PaginatedApiResponse<MarketScopingParameterResponse>(
            paginatedResult,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
