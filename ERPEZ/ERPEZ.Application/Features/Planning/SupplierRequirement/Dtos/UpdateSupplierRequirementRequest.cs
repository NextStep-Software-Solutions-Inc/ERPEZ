namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Dtos;

public record UpdateSupplierRequirementRequest
{
    public string RequirementName { get; init; } = string.Empty;
    public string URL { get; init; } = string.Empty;
    public bool IsVerified { get; init; }
}
