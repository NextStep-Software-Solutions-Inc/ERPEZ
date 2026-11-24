using ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Queries.GetDUKPITargetAssignmentById;

public record GetDUKPITargetAssignmentByIdQuery(Guid Id) : IRequest<ApiResponse<DUKPITargetAssignmentResponse>>;
