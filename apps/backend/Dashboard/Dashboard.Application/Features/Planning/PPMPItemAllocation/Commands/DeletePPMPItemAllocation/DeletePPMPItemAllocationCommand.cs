using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.DeletePPMPItemAllocation;

public record DeletePPMPItemAllocationCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
