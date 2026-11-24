namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

/// <summary>
/// Request DTO for upserting (create or update) KPI mode of verifications within a KPI update operation.
/// If Id is provided, the existing MOV will be updated. If Id is null, a new MOV will be created.
/// </summary>
public record UpsertKPIMOVRequest
{
    /// <summary>
    /// The ID of the existing MOV to update. Null for new MOVs.
    /// </summary>
    public Guid? Id { get; init; }
    
    public required string Name { get; init; }
    public string? Description { get; init; }
    public Guid? FileId { get; init; }
}
