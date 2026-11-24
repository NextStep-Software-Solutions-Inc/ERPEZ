namespace ERPEZ.Application.Features.Planning.WFP.Dtos;

public record UpdateWFPStatusRequest
{
    public string Status { get; init; } = string.Empty;
}
