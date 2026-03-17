using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.UpdateFYActiveKPI;

public record UpdateFYActiveKPICommand([property: JsonIgnore] Guid Id) : IRequest<ApiResponse<Unit>>
{
    public Guid? MFOPAPId { get; init; }
    public string? Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
    public string? MeasurementUnit { get; init; } // Number, Percentage, Currency
    public string? DistributionBehavior { get; init; } // Divisible, Uniform, Milestone
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
