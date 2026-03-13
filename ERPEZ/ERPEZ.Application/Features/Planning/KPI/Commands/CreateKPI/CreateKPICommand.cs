using System.Text.Json.Serialization;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public record CreateKPICommand : IRequest<ApiResponse<Guid>>
{
    public Guid? ParentKPIId { get; init; }
    public Guid? MFOPAPId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string MeasurementUnit { get; init; } = string.Empty; // Number, Percentage, Currency
    public string DistributionBehavior { get; init; } = string.Empty; // Divisible, Uniform, Milestone
    public string FunctionCategory { get; init; } = string.Empty; // Strategic, Core, Support
    public string? MonitoringFrequency { get; init; } // Quarterly, SemiAnnual, Annual
    public bool IsOptInAvailable { get; init; } = false;
    public bool IsGAD { get; init; } = false;

    [JsonPropertyName("SDGIds")]
    public List<Guid> SDGIds { get; init; } = [];
    [JsonPropertyName("AttributeIds")]
    public List<Guid> AttributeIds { get; init; } = [];
}
