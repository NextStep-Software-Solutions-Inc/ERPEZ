using ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignmentById;

public record GetKPIAssignmentByIdQuery(Guid Id) : IRequest<ApiResponse<KPIAssignmentResponse>>;
