using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Queries.GetMarketScopingParameterSettingsById;

public record GetMarketScopingParameterSettingsByIdQuery(Guid Id) : IRequest<ApiResponse<MarketScopingParameterSettingsResponse>>;

public class GetMarketScopingParameterSettingsByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingParameterSettingsByIdQuery, ApiResponse<MarketScopingParameterSettingsResponse>>
{
    public async Task<ApiResponse<MarketScopingParameterSettingsResponse>> Handle(GetMarketScopingParameterSettingsByIdQuery query, CancellationToken cancellationToken)
    {
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
