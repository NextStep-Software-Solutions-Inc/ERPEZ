namespace ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;

public record UpdateNonCSEItemRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public Guid? UOMId { get; init; }
    public Guid? ItemRequestId { get; init; }
    public string? ProductCode { get; init; }
    public decimal? CurrentPrice { get; init; }
    public string? Remarks { get; init; }
}
