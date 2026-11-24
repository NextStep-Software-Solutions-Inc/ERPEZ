using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.DeleteOfficeCeiling;

public record DeleteOfficeCeilingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;




