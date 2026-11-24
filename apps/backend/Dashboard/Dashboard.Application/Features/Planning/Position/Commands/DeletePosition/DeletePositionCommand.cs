using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Commands.DeletePosition;

public record DeletePositionCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
