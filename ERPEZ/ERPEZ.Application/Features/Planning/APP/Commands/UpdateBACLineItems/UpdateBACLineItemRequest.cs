namespace ERPEZ.Application.Features.Planning.APP.Commands.UpdateBACLineItems;

public record UpdateBACLineItemRequest
{
    public Guid BACItemCode { get; init; }
    public Guid ModeOfProcurementId { get; init; }
    public string? Remarks { get; init; }
    public bool EPAEligible { get; init; }
    public string? EPARemarks { get; init; }
    public List<BACItemScheduleRequest> Schedules { get; init; } = [];
}

public record BACItemScheduleRequest
{
    public Guid ProcurementActivityTypeId { get; init; }
    public DateTime? ScheduledDate { get; init; }
    public string? CustomDateText { get; init; }
}
