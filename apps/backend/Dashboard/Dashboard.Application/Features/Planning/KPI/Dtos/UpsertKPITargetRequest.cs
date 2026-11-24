namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

/// <summary>
/// Request DTO for upserting (create or update) KPI targets within a KPI update operation.
/// If Id is provided, the existing target will be updated. If Id is null, a new target will be created.
/// </summary>
public record UpsertKPITargetRequest
{
    /// <summary>
    /// The ID of the existing target to update. Null for new targets.
    /// </summary>
    public Guid? Id { get; init; }
    
    public required string Period { get; init; }
    public required decimal TargetValue { get; init; }
    public string? QuarterName { get; init; }
}
