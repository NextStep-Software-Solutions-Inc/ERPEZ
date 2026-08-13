using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.DeleteSubOfficeCeiling;

public record DeleteSubOfficeCeilingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;




