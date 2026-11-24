namespace ERPEZ.Application.Features.Planning.APP.Commands.UpdateBACLineItems;

public record UpdateBACLineItemRequest
{
    public Guid BACItemCode { get; init; }
    public Guid ModeOfProcurementId { get; init; }
    public string? Remarks { get; init; }
    public string? ItemNameOverride { get; init; }
    public string? GeneralDescription { get; init; }
    public bool EPAEligible { get; init; }
    public string? EPARemarks { get; init; }
    public DateTime? StartOfProcurementOverride { get; init; }
    public DateTime? EndOfProcurementOverride { get; init; }
    public decimal? EstimatedBudgetOverride { get; init; }
    public string? BidEvaluationCriteria { get; init; }
    public List<string>? ProcurementStrategies { get; init; }
    public bool? IsOutsourced { get; init; }
    public List<BACItemScheduleRequest>? Schedules { get; init; }
}

public record BACItemScheduleRequest
{
    public Guid ProcurementActivityTypeId { get; init; }
    public DateTime? ScheduledDate { get; init; }
    public string? CustomDateText { get; init; }
}
