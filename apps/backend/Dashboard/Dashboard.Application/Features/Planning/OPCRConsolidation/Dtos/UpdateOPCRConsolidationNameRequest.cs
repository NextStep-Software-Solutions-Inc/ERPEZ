// UpdateOPCRConsolidationNameRequest.cs
namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;

public record UpdateOPCRConsolidationNameRequest
{
    public required string Name { get; init; }
}