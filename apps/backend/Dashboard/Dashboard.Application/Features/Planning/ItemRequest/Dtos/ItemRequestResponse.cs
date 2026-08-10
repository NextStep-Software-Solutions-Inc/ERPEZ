namespace ERPEZ.Application.Features.Planning.ItemRequest.Dtos;

public record ItemRequestResponse
{
    public Guid Id { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string ItemCategory { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal EstimatedUnitCost { get; init; }
    public Guid? UOMId { get; init; }
    public string? UOMName { get; init; }
    public Guid? ProcurementCategoryId { get; init; }
    public string? ProcurementCategoryName { get; init; }
    public string? TechnicalSpecification { get; init; }
    public string? TWGRemarks { get; init; }
    public string? UACSCode { get; init; }
    public string? UNSCPSCCode { get; init; }
    public DateTime RequestDate { get; init; }
    public string? ReviewedBy { get; init; }
    public DateTime? SubmittedAt { get; init; }
    public DateTime? ReviewedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
