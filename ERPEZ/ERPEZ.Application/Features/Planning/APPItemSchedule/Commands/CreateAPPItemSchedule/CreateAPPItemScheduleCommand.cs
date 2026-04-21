using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.CreateAPPItemSchedule;

public class CreateAPPItemScheduleCommand : IRequest<ApiResponse<Guid>>
{
    public Guid APPId { get; set; }
    public Guid APPItemId { get; set; }
    public Guid ProcurementActivityTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
}
