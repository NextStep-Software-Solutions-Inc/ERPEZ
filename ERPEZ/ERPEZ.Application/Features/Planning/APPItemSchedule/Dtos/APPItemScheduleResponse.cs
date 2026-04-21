namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Dtos;

public record APPItemScheduleResponse
{
    public Guid Id { get; init; }
    public Guid PPMPItemId { get; init; }
    public Guid ProcurementActivityTypeId { get; init; }
    public string ProcurementActivityTypeName { get; init; } = string.Empty;
    public DateTime ScheduledDate { get; init; }
    public List<Guid> APPItemIds { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
