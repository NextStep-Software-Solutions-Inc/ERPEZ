using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.KPITarget.Dtos;

public record UpdateKPITargetRequest
{
    public decimal? TargetValue { get; init; }
    public PeriodEnum? Period { get; init; }
    public string? QuarterName { get; init; }
}
