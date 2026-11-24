using ERPEZ.Application.Features.Planning.MarketScopingParameter.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Queries.GetMarketScopingParameterById;

public record GetMarketScopingParameterByIdQuery(Guid Id) : IRequest<ApiResponse<MarketScopingParameterResponse>>;

public class GetMarketScopingParameterByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingParameterByIdQuery, ApiResponse<MarketScopingParameterResponse>>
{
    public async Task<ApiResponse<MarketScopingParameterResponse>> Handle(
        GetMarketScopingParameterByIdQuery query, CancellationToken cancellationToken)
    {
        var parameter = await unitOfWork.MarketScopingParameterRepository.GetByIdAsync(query.Id, cancellationToken);

        if (parameter == null)
            return ApiResponse<MarketScopingParameterResponse>.Fail("Market Scoping Parameter not found.");

        var result = new MarketScopingParameterResponse
        {
            Id = parameter.Id,
            MarketScopingId = parameter.MarketScopingId,
            ParameterSettingsId = parameter.ParameterSettingsId,
            ParameterName = parameter.ParameterSettings?.Name,
            GuidedQuestion = parameter.ParameterSettings?.GuidedQuestion,
            IsConsidered = parameter.IsConsidered,
            Remarks = parameter.Remarks
        };

        return ApiResponse<MarketScopingParameterResponse>.Success(result);
    }
}
