using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignmentById;

public record GetDUKPIAssignmentByIdQuery(Guid Id) : IRequest<ApiResponse<DUKPIAssignmentResponse>>;
