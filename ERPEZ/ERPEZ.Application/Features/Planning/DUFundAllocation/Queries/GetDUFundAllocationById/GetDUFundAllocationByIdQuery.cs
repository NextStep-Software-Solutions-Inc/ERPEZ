using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocationById;

public record GetDUFundAllocationByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.DUFundAllocation>>;
