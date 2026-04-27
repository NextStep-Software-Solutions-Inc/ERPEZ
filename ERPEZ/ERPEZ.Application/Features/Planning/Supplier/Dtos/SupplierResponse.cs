namespace ERPEZ.Application.Features.Planning.Supplier.Dtos;

public record SupplierResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string BusinessPermitNo { get; init; } = string.Empty;
    public string ContactPerson { get; init; } = string.Empty;
    public string ContactNumber { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string TINNumber { get; init; } = string.Empty;
    public string? PhilGEPSNumber { get; init; }
    public bool IsBlacklisted { get; init; }
    public string Status { get; init; } = string.Empty;
    public Guid SupplierCategoryId { get; init; }
    public string SupplierCategoryName { get; init; } = string.Empty;
    public List<SupplierRequirementDto> SupplierRequirements { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record SupplierDetailedResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string BusinessPermitNo { get; init; } = string.Empty;
    public string ContactPerson { get; init; } = string.Empty;
    public string ContactNumber { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string TINNumber { get; init; } = string.Empty;
    public string? PhilGEPSNumber { get; init; }
    public bool IsBlocked { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? StatusNote { get; init; }
    public Guid SupplierCategoryId { get; init; }
    public SupplierCategoryInfo? SupplierCategory { get; init; }
    public List<SupplierRequirementDto> SupplierRequirements { get; init; } = [];
    public List<SupplierDocumentDto> Documents { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record SupplierRequirementDto
{
    public Guid SupplierRequirementId { get; init; }
    public string RequirementName { get; init; } = string.Empty;
    public string URL { get; init; } = string.Empty;
    public bool IsVerified { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record SupplierCategoryInfo
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

public record SupplierDocumentDto
{
    public Guid DocumentId { get; init; }
    public string DocumentName { get; init; } = string.Empty;
    public string DownloadUrl { get; init; } = string.Empty;
}
