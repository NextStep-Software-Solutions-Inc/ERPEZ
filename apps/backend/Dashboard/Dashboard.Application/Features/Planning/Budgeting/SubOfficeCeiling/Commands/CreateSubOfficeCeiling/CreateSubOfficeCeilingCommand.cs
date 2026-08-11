using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.CreateSubOfficeCeiling;

public record CreateSubOfficeCeilingCommand(CreateSubOfficeCeilingRequest Request) : IRequest<ApiResponse<Guid>>;




