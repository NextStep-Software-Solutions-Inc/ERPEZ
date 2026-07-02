// EvaluateOPCRItemRequest.cs
using ERPEZ.Domain.Enums;

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
    /// Self-ratings per measurement dimension.
    /// </summary>
    public List<DimensionRateRequest> DimensionRate { get; init; } = [];

    /// <summary>
    /// Means of verification attachments submitted alongside the evaluation.
    /// Backend upserts by OPCR item plus MOV name.
    /// </summary>
    public List<EvaluateOPCRItemMovRequest> Mov { get; init; } = [];
}

public record DimensionRateRequest
{
    public Guid FYActiveKPIMeasurementId { get; init; }
    public DimensionEnum Dimension { get; init; }
    public decimal SelfRating { get; init; }
}

public record EvaluateOPCRItemMovRequest
{
    public Guid    FYActiveKPIMeasurementId { get; init; }
    public string Mov { get; init; } = string.Empty;
    public Guid FileId { get; init; }
}