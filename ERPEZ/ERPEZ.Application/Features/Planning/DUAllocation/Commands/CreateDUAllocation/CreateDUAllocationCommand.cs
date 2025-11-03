using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;

public class CreateDUAllocationCommand : IRequest<ApiResponse<DUAllocationDto>>
{
    public Guid DeliveryUnitId { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}