using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.CreateWFPObjectiveActivity;

public class CreateWFPObjectiveActivityCommand : IRequest<ApiResponse<Guid>>
{
    public Guid? WFPId { get; set; }
    public Guid? WFPObjectiveId { get; set; }
    public Guid? OPCRActivityId { get; set; }
    public string? ActivityName { get; set; }
    public string Indicator { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public List<TimelineDateRangeRequest> Dates { get; set; } = [];
}
