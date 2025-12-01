using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.LockDUAllocation;

public class LockDUAllocationCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
}