namespace ERPEZ.Application.Features.Procurement.AOBs.Dtos;

public record SupplierBidItemDto
{
    public required Guid APPItemId { get; init; }
    public required decimal UnitPrice { get; init; }
    public string? Brand { get; init; }
    public string? Model { get; init; }
    public string? Color { get; init; }
    public string? BrochureFileUrl { get; init; }
    public bool IsResponsive { get; init; } = true;
}
