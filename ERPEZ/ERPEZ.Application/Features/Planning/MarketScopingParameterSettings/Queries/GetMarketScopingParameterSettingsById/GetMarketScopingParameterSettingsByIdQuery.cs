using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Queries.GetMarketScopingParameterSettingsById;

public record GetMarketScopingParameterSettingsByIdQuery(Guid Id) : IRequest<ApiResponse<MarketScopingParameterSettingsResponse>>;

public class GetMarketScopingParameterSettingsByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingParameterSettingsByIdQuery, ApiResponse<MarketScopingParameterSettingsResponse>>
{
    public async Task<ApiResponse<MarketScopingParameterSettingsResponse>> Handle(GetMarketScopingParameterSettingsByIdQuery query, CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.MarketScopingParameterSettings, MarketScopingParameterSettingsResponse>> projection = x => new MarketScopingParameterSettingsResponse
        {
            Id = x.Id,
            Name = x.Name,
            GuidedQuestion = x.GuidedQuestion,
            Description = x.Description,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive
        };

        var parameterSettings = await unitOfWork.MarketScopingParameterSettingsRepository.GetByIdAsync(query.Id, cancellationToken);

        if (parameterSettings == null)
            return ApiResponse<MarketScopingParameterSettingsResponse>.Fail("Market Scoping Parameter Settings not found.");

        var result = new MarketScopingParameterSettingsResponse
        {
            Id = parameterSettings.Id,
            Name = parameterSettings.Name,
            GuidedQuestion = parameterSettings.GuidedQuestion,
            Description = parameterSettings.Description,
            SortOrder = parameterSettings.SortOrder,
            IsActive = parameterSettings.IsActive
        };

        return ApiResponse<MarketScopingParameterSettingsResponse>.Success(result);
    }
}
