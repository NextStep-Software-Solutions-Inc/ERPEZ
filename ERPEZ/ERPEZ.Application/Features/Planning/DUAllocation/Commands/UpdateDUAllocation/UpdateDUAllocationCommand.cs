using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.UpdateDUAllocation;

public class UpdateDUAllocationCommand : IRequest<ApiResponse<DUAllocationResponse>>
{
    public Guid Id { get; set; }
    public required UpdateDUAllocationRequest UpdateDUAllocation { get; set; }
}

