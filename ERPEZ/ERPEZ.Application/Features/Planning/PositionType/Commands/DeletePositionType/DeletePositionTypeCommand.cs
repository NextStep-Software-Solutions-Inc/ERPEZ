using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.DeletePositionType;

public record DeletePositionTypeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
