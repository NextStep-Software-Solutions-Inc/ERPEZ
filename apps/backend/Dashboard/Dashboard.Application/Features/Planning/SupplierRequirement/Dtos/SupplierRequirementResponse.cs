namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Dtos;

public record SupplierRequirementResponse
{
    public Guid Id { get; init; }
    public Guid SupplierId { get; init; }
    public string RequirementName { get; init; } = string.Empty;
    public string? Url { get; init; }
    public bool IsVerified { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
