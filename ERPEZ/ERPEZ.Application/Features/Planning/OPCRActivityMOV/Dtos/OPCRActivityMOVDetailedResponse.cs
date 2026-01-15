namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Dtos;

public record OPCRActivityMOVDetailedResponse
{
    public Guid Id { get; init; }
    public Guid OPCRActivityId { get; init; }
    public string OPCRActivityName { get; init; } = string.Empty;
    public Guid KPIId { get; init; }
    public string KPIName { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string? Url { get; init; }
    public DateTime? UploadedDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
