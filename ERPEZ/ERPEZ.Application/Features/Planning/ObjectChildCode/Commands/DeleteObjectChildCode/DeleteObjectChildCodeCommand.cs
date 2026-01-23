using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Commands.DeleteObjectChildCode;

/// <summary>
/// Command to delete an object child code relationship.
/// </summary>
public record DeleteObjectChildCodeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
