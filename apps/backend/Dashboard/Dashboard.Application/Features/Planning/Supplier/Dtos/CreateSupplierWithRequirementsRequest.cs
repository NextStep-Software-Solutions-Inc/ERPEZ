namespace ERPEZ.Application.Features.Planning.Supplier.Dtos;

/// <summary>
/// Request DTO for creating a supplier along with their compliance requirements/documents.
/// </summary>
public record CreateSupplierWithRequirementsRequest
{
    public string Name { get; init; } = string.Empty;
    public string BusinessPermitNo { get; init; } = string.Empty;
    public string ContactPerson { get; init; } = string.Empty;
    public string ContactNumber { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string TINNumber { get; init; } = string.Empty;
    public string? PhilGEPSNumber { get; init; }
    public Guid SupplierCategoryId { get; init; }
    
    /// <summary>
    /// Array of supplier requirements/compliance documents to be attached.
    /// </summary>
    public List<SupplierRequirementRequestDto> Requirements { get; init; } = [];
}

/// <summary>
/// DTO for individual supplier requirement in create request.
/// </summary>
public record SupplierRequirementRequestDto
{
    public string RequirementName { get; init; } = string.Empty;
    public Guid? FileId { get; init; }
}
