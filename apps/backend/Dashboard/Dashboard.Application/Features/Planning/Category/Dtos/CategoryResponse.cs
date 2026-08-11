namespace ERPEZ.Application.Features.Planning.Category.Dtos;

public record CategoryResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required bool CanHaveChildren { get; init; }
    public required bool IsActive { get; init; }
}
