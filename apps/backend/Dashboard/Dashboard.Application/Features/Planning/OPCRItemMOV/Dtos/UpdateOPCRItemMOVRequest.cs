// UpdateOPCRItemMOVRequest.cs
namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Dtos;

public record UpdateOPCRItemMOVRequest
{
    public Guid? FYActiveKPIMeasurementId { get; init; }

    public string? RequirementName { get; init; }

    /// <summary>
    /// Provide a new FileId to replace the attached file.
    /// If null, the existing file attachment is kept.
    /// </summary>
    public Guid? FileId { get; init; }
}