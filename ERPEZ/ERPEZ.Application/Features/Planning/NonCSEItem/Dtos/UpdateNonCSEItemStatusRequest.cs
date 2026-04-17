namespace ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;

public record UpdateNonCSEItemStatusRequest
{
    public bool IsActive { get; init; }
}
