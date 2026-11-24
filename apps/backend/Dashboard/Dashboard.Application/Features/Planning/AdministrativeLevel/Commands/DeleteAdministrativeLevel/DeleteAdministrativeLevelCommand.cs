using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.DeleteAdministrativeLevel;

public record DeleteAdministrativeLevelCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
