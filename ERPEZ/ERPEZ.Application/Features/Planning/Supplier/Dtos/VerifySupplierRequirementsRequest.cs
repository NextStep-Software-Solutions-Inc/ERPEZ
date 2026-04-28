namespace ERPEZ.Application.Features.Planning.Supplier.Dtos;

/// <summary>
/// Request DTO for verifying supplier requirements by setting their IsVerified flags.
/// </summary>
public record VerifySupplierRequirementsRequest
{
    /// <summary>
    /// Array of requirement verification payloads.
    /// </summary>
    public List<SupplierRequirementVerificationDto> Requirements { get; init; } = [];
}

public record SupplierRequirementVerificationDto
{
    public Guid SupplierRequirementId { get; init; }
    public bool IsVerified { get; init; }
}
