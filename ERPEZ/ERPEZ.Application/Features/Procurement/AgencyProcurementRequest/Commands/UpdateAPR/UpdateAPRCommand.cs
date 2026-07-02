using ERPEZ.Domain.Enums;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.UpdateAPR;

public record UpdateAPRCommand : IRequest<Unit>
{
    public Guid Id { get; init; }

    public string? AgencyControlNumber { get; init; }
    public string? AgencyAccountCode { get; init; }
    public DateOnly RequestDate { get; init; }
    public string? Description { get; init; }

    public APRModeOfDelivery ModeOfDelivery { get; init; }
    public APRInsufficientFundsAction InsufficientFundsAction { get; init; }

    public bool RequiresObR { get; init; }
    public bool RequiresCBA { get; init; }
    public bool RequiresCompleteSpecifications { get; init; }
    public string? AdditionalRemarks { get; init; }

    // Full replacement list of items — same semantics as Create's Items collection.
    // Existing APRItems not present here are removed; new APPItemIds are added;
    // matched-by-APPItemId entries are updated in place.
    public List<UpdateAPRItemDto> Items { get; init; } = [];
}

public record UpdateAPRItemDto
{
    public Guid APPItemId { get; init; }
    public decimal? QuantityRequested { get; init; }
    public decimal? UnitCost { get; init; }
}
