namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.CreateAPPItemSchedule;

public record CreateAPPItemScheduleRequest
{
    public Guid APPId { get; init; }
    public Guid APPItemId { get; init; }
    public Guid ProcurementActivityTypeId { get; init; }
    public DateTime ScheduledDate { get; init; }
}
