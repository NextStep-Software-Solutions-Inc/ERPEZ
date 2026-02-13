namespace ERPEZ.Application.Features.Planning.ProcurementItem.Dtos;

public record ProcurementItemResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Specifications { get; init; }
    public string Type { get; init; } = string.Empty;
    public bool IsCSE { get; init; }
    public int? ItemLife { get; init; }
    public string? ProductCode { get; init; }
    public string? ImageURL { get; init; }
    public bool IsActive { get; init; }
    public Guid ObjectCodeId { get; init; }
    public string ObjectCodeName { get; init; } = string.Empty;
    public Guid? UNSPSCCodeId { get; init; }
    public string? UNSPSCCodeName { get; init; }
    public Guid UOMId { get; init; }
    public string UOMName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
