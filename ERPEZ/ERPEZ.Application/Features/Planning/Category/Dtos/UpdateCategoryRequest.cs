namespace ERPEZ.Application.Features.Planning.Category.Dtos;

public record UpdateCategoryRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public bool? CanHaveChildren { get; init; }
    public bool? IsActive { get; init; }
}
