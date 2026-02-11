namespace ERPEZ.Application.Features.Planning.Cluster.Dtos;

public record UpdateClusterRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public string? Address { get; init; }
    public int? MaxSubUnits { get; init; }
    public bool? IsActive { get; init; }
}
