using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.UpdateOfficeCeiling;

public record UpdateOfficeCeilingCommand(Guid Id, UpdateOfficeCeilingRequest Request) : IRequest<ApiResponse<Unit>>;




