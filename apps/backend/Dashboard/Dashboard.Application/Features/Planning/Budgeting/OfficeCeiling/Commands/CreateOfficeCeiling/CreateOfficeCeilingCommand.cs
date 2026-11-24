using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.CreateOfficeCeiling;

public record CreateOfficeCeilingCommand(CreateOfficeCeilingRequest Request) : IRequest<ApiResponse<Guid>>;




