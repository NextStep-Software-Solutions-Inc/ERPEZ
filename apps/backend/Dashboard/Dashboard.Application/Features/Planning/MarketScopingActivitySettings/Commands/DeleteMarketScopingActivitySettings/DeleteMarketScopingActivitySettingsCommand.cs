using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.DeleteMarketScopingActivitySettings;

public record DeleteMarketScopingActivitySettingsCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
