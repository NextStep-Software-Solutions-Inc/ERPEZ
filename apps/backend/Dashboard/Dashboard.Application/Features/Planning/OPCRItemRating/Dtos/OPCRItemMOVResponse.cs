// ERPEZ.Application/Features/Planning/OPCRItemMOV/Dtos/OPCRItemMOVResponse.cs
namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Dtos;

public class OPCRItemMOVResponse
{
    public Guid Id { get; init; }
    public Guid OPCRItemId { get; init; }
    public Guid FYActiveKPIMeasurementId { get; init; }
    public string RequirementName { get; init; } = string.Empty;
    public string? AttachedUrl { get; init; }
    public DateTime? UploadedDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? CreatedBy { get; init; }
}