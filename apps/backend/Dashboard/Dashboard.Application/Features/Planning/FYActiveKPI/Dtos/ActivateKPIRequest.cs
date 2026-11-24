namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;

public record ActivateKPIRequest
{
    public Guid MasterKPIId { get; init; }
}
