using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.DeletePersonnelPosition;

public record DeletePersonnelPositionCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
