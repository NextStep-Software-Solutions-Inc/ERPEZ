// EvaluateOPCRItemRequest.cs
namespace ERPEZ.Application.Features.Planning.OPCRItem.Dtos;

public record EvaluateOPCRItemRequest
{
    /// <summary>
    /// Actual accomplishment narrative or numeric value.
    /// Supports both "10" and "Completed 10 out of 10 targets".
    /// </summary>
    public string? ActualAccomplishment { get; init; }

    /// <summary>
    /// Justification for variance between target and actual.
    /// </summary>
    public string? Justification { get; init; }

    /// <summary>
    /// Self-ratings per dimension — one entry per FYActiveKPIMeasurement.
    /// Upserts: creates if not exists, updates if already rated.
    /// </summary>
    public List<DimensionSelfRatingRequest> Ratings { get; init; } = [];
}

public record DimensionSelfRatingRequest
{
    public Guid    FYActiveKPIMeasurementId { get; init; }
    public decimal SelfRating               { get; init; }
}