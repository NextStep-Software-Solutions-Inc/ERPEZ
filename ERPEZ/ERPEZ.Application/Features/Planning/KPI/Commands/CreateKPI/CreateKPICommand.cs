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
    //[JsonIgnore(nameof"SDGs")]
    public List<CreateSDGRequest> SDGs { get; set; } = [];
    public List<CreateKPIRatingRequest> KPIRatings { get; set; } = [];
    public List<CreateKPITargetRequest> KPITargets { get; set; } = [];
    public List<CreateKPIModeOfVerificationRequest> KPIModeOfVerifications { get; set; } = [];
    public List<CreateMFOKPIRequest> MFOKPIs { get; set; } = [];
    public List<CreateKPIAttributeRequest> KPIAttribute { get; set; } = [];
}
