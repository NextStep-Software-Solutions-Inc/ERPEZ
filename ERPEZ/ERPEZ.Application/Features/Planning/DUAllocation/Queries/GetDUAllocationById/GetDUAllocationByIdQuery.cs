using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocationById;

public record GetDUAllocationByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.DUAllocation>>;