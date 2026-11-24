namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Dtos;

public record UpdateSupplierRequirementRequest
{
    public string RequirementName { get; init; } = string.Empty;
    public Guid? FileId { get; init; }
    public bool IsVerified { get; init; }
}
