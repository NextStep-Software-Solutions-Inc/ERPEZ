using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.UpdateSubOfficeCeiling;

public record UpdateSubOfficeCeilingCommand(Guid Id, UpdateSubOfficeCeilingRequest Request) : IRequest<ApiResponse<Unit>>;




