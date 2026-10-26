namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public record ParentKPIResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public string FunctionCategory { get; init; } = string.Empty;
}
