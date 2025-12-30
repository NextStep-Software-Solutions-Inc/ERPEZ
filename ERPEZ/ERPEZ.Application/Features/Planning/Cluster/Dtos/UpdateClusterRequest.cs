namespace ERPEZ.Application.Features.Planning.Cluster.Dtos;

public record UpdateClusterRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
}
