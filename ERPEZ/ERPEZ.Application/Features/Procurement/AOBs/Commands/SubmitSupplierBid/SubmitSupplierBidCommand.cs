using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitSupplierBid;

public record SubmitSupplierBidCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid ProcurementProjectId { get; init; }
    public required Guid SupplierId { get; init; }
    public required string Status { get; init; } // DRAFT, SUBMITTED
    public required List<SupplierBidItemDto> Items { get; init; } = [];
}
