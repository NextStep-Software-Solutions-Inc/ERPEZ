using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.UpdateAPPItemSchedule;

public class UpdateAPPItemScheduleCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; set; }
    public Guid APPItemId { get; set; }
    public Guid ProcurementActivityTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
}
