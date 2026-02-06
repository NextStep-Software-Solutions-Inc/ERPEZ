using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.UpdatePositionType;

public record UpdatePositionTypeCommand(Guid Id, UpdatePositionTypeRequest Request) : IRequest<ApiResponse<Unit>>;
