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
    
    private List<SupplierRequirementRequestDto> requirements = [];

    /// <summary>
    /// Array of supplier requirements/compliance documents to be attached.
    /// </summary>
    public List<SupplierRequirementRequestDto> Requirements
    {
        get => requirements;
        init => requirements = value;
    }

    /// <summary>
    /// Alias for Requirements to support payloads sent with "supplierRequirements"
    /// </summary>
    public List<SupplierRequirementRequestDto> SupplierRequirements
    {
        get => requirements;
        init => requirements = value;
    }
}

/// <summary>
/// DTO for individual supplier requirement in create request.
/// </summary>
public record SupplierRequirementRequestDto
{
    public string RequirementName { get; init; } = string.Empty;
    public Guid? FileId { get; init; }
}
