namespace ERPEZ.Application.Features.Planning.FundSource.Dtos;

public record UpdateFundSourceRequest
{
    public Guid? ParentId { get; init; }
    public string? Name { get; init; } = string.Empty;
    public string? Code { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public bool? IsActive { get; init; }
}
