namespace ERPEZ.Application.Features.Planning.APPItem.Dtos;

public record APPItemResponse
{
    public Guid Id { get; init; }
    public Guid APPId { get; init; }
    public Guid PPMPItemId { get; init; }
    public string PPMPItemName { get; init; } = string.Empty;
    public Guid ProcurementModelId { get; init; }
    public string ProcurementModelName { get; init; } = string.Empty;
    public Guid FundSourceId { get; init; }
    public string FundSourceName { get; init; } = string.Empty;
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public string PAPCode { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public bool IsEarlyProcurementActivity { get; init; }
    public bool IsOutsourced { get; init; }
    public List<string>? BidEvaluationCriteria { get; init; }
    public string? ProcurementStrategy { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
