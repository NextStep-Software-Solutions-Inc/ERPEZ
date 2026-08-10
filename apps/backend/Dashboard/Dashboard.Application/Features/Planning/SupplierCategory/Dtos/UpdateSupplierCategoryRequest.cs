namespace ERPEZ.Application.Features.Planning.SupplierCategory.Dtos;

public record UpdateSupplierCategoryRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}
