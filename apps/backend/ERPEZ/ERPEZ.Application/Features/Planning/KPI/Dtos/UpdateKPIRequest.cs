using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public record UpdateKPIRequest
{
    public Guid? ParentKPIId { get; init; }
    public Guid? MFOPAPId { get; init; }
    public string? Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
    public string? MeasurementUnit { get; init; } // Number, Percentage, Currency
    public string? DistributionBehavior { get; init; } // Summation, Uniform, Maximum, Minimum, Milestone
    public string? FunctionCategory { get; init; } // Strategic, Core, Support
    public string? MonitoringFrequency { get; init; } // Quarterly, SemiAnnual, Annual
    public bool? IsOptInAvailable { get; init; }
    public bool? IsGAD { get; init; }
    public string? Status { get; init; }

    [JsonPropertyName("SDGIds")]
    public List<Guid>? SDGIds { get; init; }
    
    [JsonPropertyName("AttributeIds")]
    public List<Guid>? AttributeIds { get; init; }
}
