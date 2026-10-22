using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Queries.GetPPMPItemAllocationById;

public record GetPPMPItemAllocationByIdQuery(Guid Id) : IRequest<ApiResponse<PPMPItemAllocationResponse>>;
