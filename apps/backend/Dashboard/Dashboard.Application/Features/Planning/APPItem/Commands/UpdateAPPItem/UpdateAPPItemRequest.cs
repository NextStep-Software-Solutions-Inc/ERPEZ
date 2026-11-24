using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.UpdateAPPItem;

public record UpdateAPPItemRequest
{
    public Guid APPId { get; init; }
    public Guid PPMPItemId { get; init; }
    public Guid ProcurementModeId { get; init; }
    public Guid FundSourceId { get; init; }
    public Guid OfficeId { get; init; }
    public string PAPCode { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public string? ItemNameOverride { get; init; }
    public string? GeneralDescription { get; init; }
    public bool IsEarlyProcurementActivity { get; init; }
    public string? EPARemarks { get; init; }
    public bool IsOutsourced { get; init; }
    public string? BidEvaluationCriteria { get; init; }
    public List<string>? ProcurementStrategies { get; init; }
    public DateTime? StartOfProcurementOverride { get; init; }
    public DateTime? EndOfProcurementOverride { get; init; }
    public decimal? EstimatedBudgetOverride { get; init; }
}
