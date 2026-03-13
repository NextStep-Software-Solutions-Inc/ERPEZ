using System.Text.Json.Serialization;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
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
    [JsonPropertyName("KPIMeasurements")]
    public List<CreateKPIMeasurementRequest> KPIMeasurements { get; init; } = [];
    
    // Legacy support - can be deprecated later
    [JsonPropertyName("KPIRatings")]
    public List<CreateRatingRequest> KPIRatings { get; init; } = [];
    [JsonPropertyName("KPITargets")]
    public List<CreateKPITargetRequest> KPITargets { get; init; } = [];
    [JsonPropertyName("KPIMOVs")]
    public List<CreateKPIMOVRequest> KPIMOVs { get; init; } = [];
}

public record CreateKPIMeasurementRequest
{
    public string Dimension { get; init; } = string.Empty;
    public Guid? RatingScaleTemplateId { get; init; }
    public List<string> MOVs { get; init; } = [];
    public bool IsMOVEditable { get; init; } = true;
    public bool IsScaleEditable { get; init; } = true;
}
