namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;

public record CreateOPCRConsolidationRequest
{
    public required List<Guid> OpcrIds { get; init; }
}