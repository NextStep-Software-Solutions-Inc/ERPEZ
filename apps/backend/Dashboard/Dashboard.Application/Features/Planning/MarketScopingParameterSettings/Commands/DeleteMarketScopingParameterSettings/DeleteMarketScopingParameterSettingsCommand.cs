using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.DeleteMarketScopingParameterSettings;

public record DeleteMarketScopingParameterSettingsCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
