namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Dtos;

public record UpdateOPCRActivityMOVRequest
{
    public string? FileName { get; init; }
    public string? Url { get; init; }
    public DateTime? UploadedDate { get; init; }
}
