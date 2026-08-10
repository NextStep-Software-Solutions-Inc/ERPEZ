using ERPEZ.Application.Features.Planning.MarketScopingParameter.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

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

        var (parameters, totalCount) = await unitOfWork.MarketScopingParameterRepository.GetByMarketScopingIdAsync(
            query.MarketScopingId, sieveModel, cancellationToken);

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

        return new PaginatedApiResponse<MarketScopingParameterResponse>(
            responses,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
