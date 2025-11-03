using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.UpdateDUFundAllocation;

public class UpdateDUFundAllocationCommand : IRequest<ApiResponse<Domain.Entities.Planning.DUFundAllocation>>
{
    public Guid Id { get; set; }
    public required UpdateDUFundAllocationDto UpdateDUFundAllocation { get; set; }
}

