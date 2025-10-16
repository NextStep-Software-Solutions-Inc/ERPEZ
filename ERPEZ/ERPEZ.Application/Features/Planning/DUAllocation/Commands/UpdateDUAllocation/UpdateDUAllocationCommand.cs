using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.UpdateDUAllocation;

public class UpdateDUAllocationCommand : IRequest<ApiResponse<Domain.Entities.Planning.DUAllocation>>
{
    public Guid Id { get; set; }
    public required UpdateDUAllocationDto UpdateDUAllocation { get; set; }
}

