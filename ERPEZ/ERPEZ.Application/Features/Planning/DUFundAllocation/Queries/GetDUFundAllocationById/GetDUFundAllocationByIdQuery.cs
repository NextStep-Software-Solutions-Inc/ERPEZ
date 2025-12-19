using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocationById;

public record class GetDUFundAllocationByIdQuery(Guid Id) : IRequest<ApiResponse<DUFundAllocationResponse>>;
