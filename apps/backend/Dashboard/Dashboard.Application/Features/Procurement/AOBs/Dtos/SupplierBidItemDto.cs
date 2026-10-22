namespace ERPEZ.Application.Features.Procurement.AOBs.Dtos;

public record SupplierBidItemDto
{
    public required Guid RFQItemId { get; init; }
    public required decimal UnitPrice { get; init; }
    public decimal TotalPrice { get; init; }
    public string? Brand { get; init; }
    public string? Model { get; init; }
    public string? Color { get; init; }
    public Guid? BrochureFileId { get; init; }
    public string? BrochureFileUrl { get; init; }
    public bool IsResponsive { get; init; } = true;
    public string? DisqualificationReason { get; init; }
    public decimal? QualityScore { get; init; }
}
