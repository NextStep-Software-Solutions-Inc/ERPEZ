using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.DeleteEconomicIndicator;

public record DeleteEconomicIndicatorCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
