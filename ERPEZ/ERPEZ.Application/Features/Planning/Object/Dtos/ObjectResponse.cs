namespace ERPEZ.Application.Features.Planning.Object.Dtos;

public record ObjectResponse
{
    public Guid Id { get; init; }
    public Guid? ParentId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}
