namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

/// <summary>
/// Request DTO for upserting (create or update) KPI ratings within a KPI update operation.
/// If Id is provided, the existing rating will be updated. If Id is null, a new rating will be created.
/// </summary>
public record UpsertKPIRatingRequest
{
    /// <summary>
    /// The ID of the existing rating to update. Null for new ratings.
    /// </summary>
    public Guid? Id { get; init; }
    
    public required Guid PerformanceMeasureId { get; init; }
    public required int NumericalRating { get; init; }
    public string? Remarks { get; init; }
}
