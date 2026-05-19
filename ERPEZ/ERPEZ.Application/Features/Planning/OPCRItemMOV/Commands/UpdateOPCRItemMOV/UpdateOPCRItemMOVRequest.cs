namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.UpdateOPCRItemMOV;

public class UpdateOPCRItemMOVRequest
{
    public string RequirementName { get; init; } = string.Empty;
    public string? AttachedUrl { get; init; }
    public DateTime? UploadedDate { get; init; }
}