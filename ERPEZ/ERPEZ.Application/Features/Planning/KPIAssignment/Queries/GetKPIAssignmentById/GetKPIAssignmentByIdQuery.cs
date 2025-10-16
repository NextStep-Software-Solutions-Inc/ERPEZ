using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignmentById;

public record class GetKPIAssignmentByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.KPIAssignment>>;