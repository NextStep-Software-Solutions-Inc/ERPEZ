namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Dtos;

public record UNSPSCCodeResponse
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int Level { get; init; }
    public bool IsActive { get; init; }
    public Guid? ParentId { get; init; }
    public string? ParentName { get; init; }
    public List<UNSPSCCodeResponse>? Children { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
