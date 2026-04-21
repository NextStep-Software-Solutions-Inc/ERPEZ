namespace ERPEZ.Application.Features.Planning.APPItem.Commands.UpdateAPPItem;

public record UpdateAPPItemRequest
{
    public Guid APPId { get; init; }
    public Guid PPMPItemId { get; init; }
    public Guid ProcurementModelId { get; init; }
    public Guid FundSourceId { get; init; }
    public Guid OfficeId { get; init; }
    public string PAPCode { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public bool IsEarlyProcurementActivity { get; init; }
    public bool IsOutsourced { get; init; }
    public List<string>? BidEvaluationCriteria { get; init; }
    public string? ProcurementStrategy { get; init; }
}
