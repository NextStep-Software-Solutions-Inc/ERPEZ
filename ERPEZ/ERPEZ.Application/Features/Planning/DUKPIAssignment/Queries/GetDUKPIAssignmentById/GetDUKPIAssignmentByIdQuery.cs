using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignmentById;

public record class GetDUKPIAssignmentByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.DUKPIAssignment>>;
