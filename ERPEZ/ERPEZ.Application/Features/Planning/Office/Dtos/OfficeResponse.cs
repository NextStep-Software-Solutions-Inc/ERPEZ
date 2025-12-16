using ERPEZ.Application.Features.Planning.Cluster.Dtos;

namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public record OfficeResponse
{
    public Guid Id { get; init; }
    public Guid? ClusterId { get; init; }
    public required string OfficeHead { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required string Address { get; init; }
    public required string Email { get; init; }
    public required string ContactNumber { get; init; }
    public string? ResponsibilityCenterCode { get; init; }
    public DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
    public bool IsDeliveryUnit { get; init; }
    public ClusterResponse? Cluster { get; init; }

}
