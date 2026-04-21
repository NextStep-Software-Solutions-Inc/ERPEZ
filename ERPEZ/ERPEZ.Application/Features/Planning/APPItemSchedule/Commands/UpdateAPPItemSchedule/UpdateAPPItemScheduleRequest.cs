namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.UpdateAPPItemSchedule;

public record UpdateAPPItemScheduleRequest
{
    public Guid APPId { get; init; }
    public Guid APPItemId { get; init; }
    public Guid ProcurementActivityTypeId { get; init; }
    public DateTime ScheduledDate { get; init; }
}
