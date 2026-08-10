// CreateOPCRItemMOVRequest.cs
namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Dtos;

public record CreateOPCRItemMOVRequest
{
    public Guid FYActiveKPIMeasurementId { get; init; }

    public string RequirementName { get; init; } = string.Empty;

    /// <summary>
    /// FileId returned from POST /files/upload.
    /// Handler promotes it to permanent storage and stores the resulting URL.
    /// </summary>
    public Guid FileId { get; init; }
}