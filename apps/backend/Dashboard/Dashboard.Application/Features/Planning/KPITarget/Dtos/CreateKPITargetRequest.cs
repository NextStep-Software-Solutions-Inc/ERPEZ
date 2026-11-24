namespace ERPEZ.Application.Features.Planning.KPITarget.Dtos;

public record CreateKPITargetRequest
{
    public required string Period { get; init; }
    public required decimal TargetValue { get; init; }
    public string? QuarterName { get; init; }
}
