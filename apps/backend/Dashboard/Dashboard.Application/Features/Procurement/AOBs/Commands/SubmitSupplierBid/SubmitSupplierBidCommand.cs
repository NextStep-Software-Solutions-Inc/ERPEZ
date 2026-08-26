using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitSupplierBid;

public record SubmitSupplierBidCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid RFQId { get; init; }
    public required Guid SupplierId { get; init; }
    public string SubmissionType { get; init; } = "Electronic"; // Electronic, Physical, Manual
    public required string Status { get; init; } = "DRAFT"; // DRAFT, SUBMITTED
    public int? ValidityPeriodDays { get; init; }
    public string? DeliveryPeriod { get; init; }
    public string? PaymentTerms { get; init; }
    public string? WarrantyTerms { get; init; }
    public string? Remarks { get; init; }
    public required List<SupplierBidItemDto> Items { get; init; } = [];
}
