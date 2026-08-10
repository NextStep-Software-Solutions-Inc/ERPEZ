namespace ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;

public record NonCSEItemResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? UOMId { get; init; }
    public string? UOMName { get; init; }
    public Guid? ProcurementCategoryId { get; init; }
    public string? ProcurementCategoryName { get; init; }
    public Guid? ItemRequestId { get; init; }
    public string? ProductCode { get; init; }
    public decimal CurrentPrice { get; init; }
    public string? Remarks { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
