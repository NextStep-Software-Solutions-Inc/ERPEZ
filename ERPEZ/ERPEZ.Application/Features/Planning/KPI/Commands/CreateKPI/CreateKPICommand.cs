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
    public string FunctionType { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; } = string.Empty;
    public bool IsOfficeMandate { get; init; } = false;
    public bool IsPercentage { get; init; } = false;
    public bool IsTargetValueAllocable { get; init; } = false;
    public bool IsFixed { get; init; } = false;
    public bool IsGlobal { get; init; } = false;
    public bool IsMultiple { get; init; } = false;
    public bool IsAverage { get; init; } = false;

    [JsonPropertyName("SDGIds")]
    public List<Guid> SDGIds { get; init; } = [];
    [JsonPropertyName("KPIRatings")]
    public List<CreateRatingRequest> KPIRatings { get; init; } = [];
    [JsonPropertyName("KPITargets")]
    public List<CreateKPITargetRequest> KPITargets { get; init; } = [];
    [JsonPropertyName("KPIMOVs")]
    public List<CreateKPIMOVRequest> KPIMOVs { get; init; } = [];
    [JsonPropertyName("MFOPAPId")]
    public Guid? MFOPAPId { get; init; }
    [JsonPropertyName("attributeIds")]
    public List<Guid> AttributeIds { get; init; } = [];
}
