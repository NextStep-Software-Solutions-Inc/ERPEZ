namespace ERPEZ.Application.Features.Planning.Supplier.Dtos;

public record UpdateSupplierRequest
{
    public string Name { get; init; } = string.Empty;
    public string BusinessPermitNo { get; init; } = string.Empty;
    public string ContactPerson { get; init; } = string.Empty;
    public string ContactNumber { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string TINNumber { get; init; } = string.Empty;
    public string? PhilGEPSNumber { get; init; }
    public bool IsBlacklisted { get; init; }
    public string Status { get; init; } = string.Empty;
    public Guid SupplierCategoryId { get; init; }

    private List<UpdateSupplierRequirementItemDto>? requirements;

    public List<UpdateSupplierRequirementItemDto>? Requirements
    {
        get => requirements;
        init => requirements = value;
    }

    public List<UpdateSupplierRequirementItemDto>? SupplierRequirements
    {
        get => requirements;
        init => requirements = value;
    }
}

public record UpdateSupplierRequirementItemDto
{
    public Guid? Id { get; init; }
    public string RequirementName { get; init; } = string.Empty;
    public Guid? FileId { get; init; }
    public string? Url { get; init; }
    public bool? IsVerified { get; init; }
}
