using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommand : IRequest<ApiResponse<KPIResponse>>
{
    public Guid? ParentKPIId { get; set; }
    public string FunctionType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
    public bool IsOfficeMandate { get; set; }
    public bool IsPercentage { get; set; }
    [JsonPropertyName("SDGs")]
    public List<CreateSDGRequest> SDGs { get; set; } = [];
    [JsonPropertyName("KPIRatings")]
    public List<CreateKPIRatingRequest> KPIRatings { get; set; } = [];
    [JsonPropertyName("KPITargets")]
    public CreateKPITargetRequest KPITargets { get; set; } = null!;
    [JsonPropertyName("KPIModeOfVerifications")]
    public List<CreateKPIModeOfVerificationRequest> KPIModeOfVerifications { get; set; } = [];
    [JsonPropertyName("MFOKPIs")]
    public List<CreateMFOKPIRequest> MFOKPIs { get; set; } = [];
    [JsonPropertyName("KPIAttribute")]
    public List<CreateKPIAttributeRequest> KPIAttribute { get; set; } = [];
}
