using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.DeleteKPIMeasurement;

public record DeleteKPIMeasurementCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
